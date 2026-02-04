const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

router.get('/', hotelController.getHotelList);
router.get('/:id', hotelController.getHotelDetail);
router.get('/:id/promotions', hotelController.getHotelPromotions);
router.get('/:id/nearby', hotelController.getHotelNearby);

module.exports = router;