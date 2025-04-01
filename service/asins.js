const axios = require("axios");
//importamos dotenv para obtener las variables de entorno
const amazonAdsConfig = require("../config/amazon");

//configuración de los headers y URL
const apiUrl = "https://advertising-api.amazon.com/sp/productAds/list";

const productsAdsSP = async () => {

    //configuración de los headers y URL
    const accessToken = await amazonAdsConfig.getValidAccessToken();

    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId": amazonAdsConfig.clientId,
        "Amazon-Advertising-API-Scope": amazonAdsConfig.profileId,
        "Content-Type": "application/vnd.spProductAd.v3+json",
        "Accept": "application/vnd.spProductAd.v3+json",
    };


    try {
        const response = await axios.post(apiUrl, null, { headers });
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(`Error al obtener los asins : ${response.status} - access token: ${accessToken}`);
        }
    } catch (error) {
        throw new Error(`Error al obtener los asins: ${error.message} - access token: ${accessToken}`);
    }

};

module.exports = { productsAdsSP }