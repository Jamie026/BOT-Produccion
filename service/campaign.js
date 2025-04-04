const axios = require("axios");
const amazonAdsConfig = require("../config/amazon");

//configuración de los headers y URL

const campaignsListSP = async (body = null) => {

    const apiUrl = "https://advertising-api.amazon.com/sp/campaigns/list";

    //configuración de los headers y URL
    const accessToken = await amazonAdsConfig.getValidAccessToken();

    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId": amazonAdsConfig.clientId,
        "Amazon-Advertising-API-Scope": amazonAdsConfig.profileId,
        "Content-Type": "application/vnd.spCampaign.v3+json",
        "Accept": "application/vnd.spCampaign.v3+json"
    };

    //Estructura Base
    try {
        const response = await axios.post(apiUrl, body, { headers });

        if (response.status === 200) {
            console.log("Campañas obtenidas correctamente");
            return response.data;
        } else {
            throw new Error(`Error al obtener las campañas : ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Error al obtener las campañas: ${error.message}`);
    }

}

const campaignsListSB = async (body = null) => {

    const apiUrl = "https://advertising-api.amazon.com/sb/v4/campaigns/list";

    //configuración de los headers y URL

    const accessToken = await amazonAdsConfig.getValidAccessToken();

    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId": amazonAdsConfig.clientId,
        "Amazon-Advertising-API-Scope": amazonAdsConfig.profileId,
        "Content-Type": "application/vnd.sbcampaignresource.v4+json",
        "Accept": "application/vnd.sbcampaignresource.v4+json"
    };

    //Estructura Base
    try {
        const response = await axios.post(apiUrl, body, { headers });

        if (response.status === 200) {
            console.log("Campañas obtenidas correctamente");
            return response.data;
        } else {
            throw new Error(`Error al obtener las campañas : ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Error al obtener las campañas: ${error.message}`);
    }

}

module.exports = { campaignsListSP, campaignsListSB };