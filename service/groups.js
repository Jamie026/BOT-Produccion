const axios = require("axios");
const amazonAdsConfig = require("../config/amazon");

//configuración de los headers y URL

const adGroupsListSP = async () => {

    const apiUrl = "https://advertising-api.amazon.com/sp/adGroups/list";

    //configuración de los headers y URL
    const accessToken = await amazonAdsConfig.getValidAccessToken();

    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId": amazonAdsConfig.clientId,
        "Amazon-Advertising-API-Scope": amazonAdsConfig.profileId,
        "Content-Type": "application/vnd.spadGroup.v3+json",
        "Accept": "application/vnd.spadGroup.v3+json"
    };

    //Estructura Base
    try {
        const response = await axios.post(apiUrl, null, { headers });

        if (response.status === 200) {
            console.log("AdGroups SP obtenidos correctamente");
            return response.data;
        } else {
            throw new Error(`Error al obtener los adgroups SP : ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Error al obtener los adgroups SP : ${error.message}`);
    }

}

const adGroupsListSB = async () => {

    const apiUrl = "https://advertising-api.amazon.com/sb/v4/adGroups/list";

    //configuración de los headers y URL
    const accessToken = await amazonAdsConfig.getValidAccessToken();

    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId": amazonAdsConfig.clientId,
        "Amazon-Advertising-API-Scope": amazonAdsConfig.profileId,
        "Content-Type": "application/vnd.sbadgroupresource.v4+json",
        "Accept": "application/vnd.sbadgroupresource.v4+json"
    };

    //Estructura Base
    try {
        const response = await axios.post(apiUrl, null, { headers });

        if (response.status === 200) {
            console.log("AdGroups SB obtenidas correctamente");
            return response.data;
        } else {
            throw new Error(`Error al obtener los adgroups SB : ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Error al obtener los adgroups SB: ${error.message}`);
    }
}

module.exports = { adGroupsListSP, adGroupsListSB };