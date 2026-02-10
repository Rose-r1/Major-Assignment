const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');

// 获取逆地理编码
router.get('/reverse-geocode', locationController.getLocation);

// 获取行政区
router.get('/districts', locationController.getDistricts);

// 获取 POI (机场车站、景点等)
router.get('/pois', locationController.getPois);

module.exports = router;
