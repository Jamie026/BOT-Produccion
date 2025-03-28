const axios = require("axios");
const { sequelize } = require('./config/db');
const _ = require("lodash"); // Instalar con: npm install lodash
require("dotenv").config();

let lastResponse = null; // Guardará la respuesta anterior

const campaignsAndAdGroups = async () => {
    const results = await sequelize.query(
        `SELECT campaigns.campaign_id AS campaignId, campaigns.name AS campaignName, 
                sponsored_type.name AS sponsoredType, campaigns.state AS campaignState, 
                ad_groups.ad_group_id AS adGroupId, ad_groups.name AS adGroupName, 
                ad_groups.state AS adGroupState 
         FROM ad_groups 
         INNER JOIN campaigns ON ad_groups.campaigns_id = campaigns.id 
         INNER JOIN sponsored_type ON campaigns.sponsored_type_id = sponsored_type.id`
    );

    const rows = results[0];

    const groupedData = rows.reduce((acc, row) => {
        const { campaignId, campaignName, sponsoredType, campaignState, adGroupId, adGroupName, adGroupState } = row;

        if (!acc[campaignId]) {
            acc[campaignId] = {
                campaignId,
                campaignName,
                sponsoredType,
                campaignState,
                adGroups: []
            };
        }

        acc[campaignId].adGroups.push({
            adGroupId,
            adGroupName,
            adGroupState
        });

        return acc;
    }, {});

    return Object.values(groupedData);
};

async function checkForChanges() {
    try {
        const response = await campaignsAndAdGroups();        

        if (lastResponse && !_.isEqual(lastResponse, response)) {  // ✅ Usa comparación profunda
            console.log("🔔 Cambio detectado, notificando al servidor...");
            await notifyServer();
        }
        lastResponse = response; // ✅ Guarda el objeto sin convertir a JSON
        console.log("Consulta realizada.");
    } catch (error) {
        console.error("❌ Error al consultar la API:", error.message);
    }
}


async function notifyServer(currentData) {
    try {
        await axios.post(process.env.SERVER_URL, { mensaje: "Cambio detectado en la API" });
        console.log("Notificación enviada con éxito.");
    } catch (error) {
        console.error("Error al notificar al servidor:", error.message);
    }
}

setInterval(checkForChanges, 2000);