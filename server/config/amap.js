require('dotenv').config();

const config = {
    apiKey: process.env.GAO_KEY || '', // 获取 .env 中的 GAO_KEY
    baseUrl: 'https://restapi.amap.com/v3'
};

if (!config.apiKey) {
    console.warn('Warning: GAO_KEY is not defined in .env file');
}

module.exports = config;
