const amapConfig = require('../config/amap');
const axios = require('axios');

exports.getLocation = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        // 1. 校验参数
        if (!lat || !lng) {
            return res.status(400).json({ message: '缺少经纬度参数' });
        }

        // 2. 获取高德 Key
        const AMAP_KEY = amapConfig.apiKey;
        if (!AMAP_KEY) {
            return res.status(500).json({ message: '服务端配置错误：缺少高德地图 Key' });
        }

        // 3. 构造请求地址
        const url = `${amapConfig.baseUrl}/geocode/regeo?output=json&location=${lng},${lat}&key=${AMAP_KEY}&radius=1000&extensions=all`;

        // 4. 调用高德 API
        const response = await axios.get(url);

        if (response.data.status === '1') {
            res.json({
                code: 200,
                data: response.data.regeocode
            });
        } else {
            console.error('高德 API 错误:', response.data);
            res.status(500).json({ message: '定位服务调用失败', detail: response.data });
        }

    } catch (error) {
        console.error('定位控制器错误:', error);
        res.status(500).json({ message: '服务器内部错误' });
    }
};
