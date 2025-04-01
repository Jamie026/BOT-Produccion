const axios = require("axios");
const { adGroupsListSP, adGroupsListSB } = require("./service/groups");
const { campaignsListSB, campaignsListSP } = require("./service/campaign")
const { portfoliosList } = require("./service/portafolio")
const { productsAdsSP } = require("./service/asins")
require("dotenv").config();
const _ = require("lodash");

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

function mergeCampaignsWithAdGroups(campaigns, adGroups) {
    return campaigns.map(campaign => ({
        ...campaign,
        adGroups: adGroups.filter(adGroup => adGroup.campaignId === campaign.campaignId),
    }));
}

async function getData() {
    const [adGroupsData, campaignsData, portafoliosData, productosData] = await Promise.all([
        adGroupsListSP(),
        campaignsListSP(),
        portfoliosList(),
        productsAdsSP(),
    ]);

    const campaignsMerge = mergeCampaignsWithAdGroups(campaignsData.campaigns, adGroupsData.adGroups);
    const portafoliosMerge = mergeCampaignsWithPortafolios(portafoliosData.portfolios, campaignsMerge)
    const productosMerge = mergeCampaignsWithASIN(campaignsData.campaigns, productosData.productAds)

    return {
        campaigns: campaignsMerge,
        adgroups: adGroupsData.adGroups,
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