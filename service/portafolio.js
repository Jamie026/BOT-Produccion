const axios = require("axios");
//importamos dotenv para obtener las variables de entorno
const amazonAdsConfig = require("../config/amazon");

//configuración de los headers y URL
const apiUrl = "https://advertising-api.amazon.com/portfolios/list";

const portfoliosList = async (body = null) => {

    //configuración de los headers y URL
    const accessToken = await amazonAdsConfig.getValidAccessToken();

    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId": amazonAdsConfig.clientId,
        "Amazon-Advertising-API-Scope": amazonAdsConfig.profileId,
        "Content-Type": "application/vnd.spPortfolio.v3+json",
        "Accept": "application/vnd.spPortfolio.v3+json"
    };

    //Estructura Base
    try {
        const response = await axios.post(apiUrl, body, { headers });

        if (response.status === 200) {
            console.log("portafolios obtenidos correctamente");
            return response.data;
        } else {
            throw new Error(`Error al obtener los portafolios : ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Error al obtener los portafolios: ${error.message}`);
    }

}

module.exports = { portfoliosList };