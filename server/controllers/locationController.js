const amapConfig = require('../config/amap');
const axios = require('axios');

// 获取行政区列表
exports.getDistricts = async (req, res) => {
    try {
        const { keywords } = req.query; // 城市名称，例如 "上海"
        if (!keywords) {
            return res.status(400).json({ message: 'Missing keywords parameter' });
        }

        const AMAP_KEY = amapConfig.apiKey;
        // subdistrict=2 为了获取直辖市（如上海）下的具体区（因为直辖市下第一级可能是"城区"和"郊区"）
        const url = `https://restapi.amap.com/v3/config/district?keywords=${encodeURIComponent(keywords)}&subdistrict=2&key=${AMAP_KEY}`;

        const response = await axios.get(url);

        if (response.data.status === '1' && response.data.districts.length > 0) {
            const cityData = response.data.districts[0];
            let rawDistricts = cityData.districts || [];
            let finalDistricts = [];

            // 处理直辖市特殊的 "城区/郊区" 结构
            // 如果只有 "城区" 或 "郊区"，则展开它们的子级
            // 改为包含匹配，防止出现 "上海城区" 这种情况
            const isMunicipalityStructure = rawDistricts.some(d => d.name.includes('城区') || d.name.includes('郊区'));

            if (isMunicipalityStructure) {
                rawDistricts.forEach(d => {
                    // 只要名字包含城区/郊区/县，且有子级，就展开
                    if ((d.name.includes('城区') || d.name.includes('郊区') || d.name.includes('县')) && d.districts && d.districts.length > 0) {
                        finalDistricts.push(...d.districts);
                    } else {
                        // 如果不是容器节点（或者是个没有子级的独立区），也保留
                        // 但如果是容器节点但没被上面命中（比如没子级），我们也不想要它，除非它是具体的区
                        if (!d.name.includes('城区') && !d.name.includes('郊区')) {
                            finalDistricts.push(d);
                        }
                    }
                });
            } else {
                finalDistricts = rawDistricts;
            }

            console.log('Final Districts (Before Filter):', finalDistricts.map(d => `${d.name} (${d.level})`));

            // 暂时放宽过滤条件
            finalDistricts = finalDistricts.filter(d => d.name);

            res.json({
                code: 200,
                data: finalDistricts // 返回扁平化后的列表
            });
        } else {
            res.json({
                code: 200,
                data: []
            });
        }

    } catch (error) {
        console.error('getDistricts Error:', error);
        res.status(500).json({ message: 'Server Internal Error' });
    }
};

// 获取 POI 列表 (机场/景点等)
exports.getPois = async (req, res) => {
    try {
        const { city, keywords, types } = req.query;
        if (!city) {
            return res.status(400).json({ message: 'Missing city parameter' });
        }

        const AMAP_KEY = amapConfig.apiKey;
        let url = `https://restapi.amap.com/v3/place/text?keywords=${encodeURIComponent(keywords || '')}&city=${encodeURIComponent(city)}&key=${AMAP_KEY}&offset=50&page=1&extensions=all`;

        if (types) {
            url += `&types=${types}`;
        }

        const response = await axios.get(url);

        if (response.data.status === '1') {
            res.json({
                code: 200,
                data: response.data.pois || []
            });
        } else {
            res.json({
                code: 200,
                data: []
            });
        }
    } catch (error) {
        console.error('getPois Error:', error);
        res.status(500).json({ message: 'getPois Server Internal Error' });
    }
};

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
