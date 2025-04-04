const { adGroupsListSP, adGroupsListSB } = require("./service/groups");
const { campaignsListSB, campaignsListSP } = require("./service/campaign")
const { portfoliosList } = require("./service/portafolio")
const { productsAdsSP } = require("./service/asins")
const express = require("express");
const axios = require("axios");
const _ = require("lodash");
const cors = require("cors");
const app = express();

require("dotenv").config();

const PORT = process.env.PORT || 5000;

app.use(cors())

app.get("/", (req, res) => {
    console.log("Cliente conectado");
    res.status(200).json({ message: "Ok" })
})

const server = app.listen(PORT, () => console.log("BOT escuchando..."))

let lastResponse = null;

function mergeCampaignsWithASIN(campaigns, productos){
    return productos.map(producto => ({
        ...producto,
        campaigns: campaigns.filter(campaign => campaign.campaignId === producto.campaignId),
    }));
}

function mergeCampaignsWithPortafolios(portafolios, campaigns) {
    return portafolios.map(portafolio => ({
        ...portafolio,
        campaigns: campaigns.filter(campaign => campaign.portfolioId === portafolio.portfolioId),
    }));
}

function mergeCampaignsWithAdGroups(campaigns, adGroups, type) {
    return campaigns.map(campaign => ({
        ...campaign,
        type: type,
        adGroups: adGroups.filter(adGroup => adGroup.campaignId === campaign.campaignId),
    }));
}

async function getData() {
    const [adGroupsDataSP, adGroupsDataSB, campaignsDataSP, campaignsDataSB, portafoliosData, productosData] = await Promise.all([
        adGroupsListSP(),
        adGroupsListSB(),
        campaignsListSP(),
        campaignsListSB(),
        portfoliosList(),
        productsAdsSP(),
    ]);

    const campaignsMergeSP = mergeCampaignsWithAdGroups(campaignsDataSP.campaigns, adGroupsDataSP.adGroups, "SP");
    const campaignsMergeSB = mergeCampaignsWithAdGroups(campaignsDataSB.campaigns, adGroupsDataSB.adGroups, "SB");

    const campaignsData = [...campaignsMergeSB, ...campaignsMergeSP]
    const adGroupsData = [...adGroupsDataSP.adGroups, ...adGroupsDataSB.adGroups]

    const portafoliosMerge = mergeCampaignsWithPortafolios(portafoliosData.portfolios, campaignsData)
    const productosMerge = mergeCampaignsWithASIN(campaignsData, productosData.productAds)

    return {
        campaigns: campaignsData,
        adgroups: adGroupsData,
        portfolios: portafoliosMerge,
        productos: productosMerge
    }
}

function findDifferences(obj1, obj2) {
    return {
        campaigns: _.differenceWith(obj1.campaigns, obj2.campaigns, _.isEqual),
        adgroups: _.differenceWith(obj1.adgroups, obj2.adgroups, _.isEqual),
        portfolios: _.differenceWith(obj1.portfolios, obj2.portfolios, _.isEqual)
    };
}

// 🟡 Función para revisar cambios en la BD
async function checkForChanges() {
    try {
        const response = await getData();

        if (lastResponse) {
            const differences = findDifferences(response, lastResponse);

            if (differences.campaigns.length || differences.adgroups.length || differences.portfolios.length) {
                console.log("🔍 Diferencias detectadas:", JSON.stringify(differences, null, 2));
                console.log("🔔 Cambio detectado, notificando al servidor...");
                await notifyServer();
            }
        }

        lastResponse = response;

    } catch (error) {
        console.error("❌ Error al consultar la API:", error.message);
    }
}

// 🔴 Notificar al servidor si hay cambios
async function notifyServer() {
    try {
        await axios.post(process.env.SERVER_URL, {
            mensaje: "Cambio detectado en la API",
        });
        console.log("✅ Notificación enviada.");
    } catch (error) {
        console.error("⚠️ Error al notificar al servidor:", error.message);
    }
}

// ⏳ Ejecutar funciones en intervalos
setInterval(checkForChanges, 2000);