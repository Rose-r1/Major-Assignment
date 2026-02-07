const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');

router.post('/hotels', merchantController.addHotel);
router.get('/hotels', merchantController.myHotels);
router.get('/hotels/:id', merchantController.getHotelById);
router.put('/hotels/:id', merchantController.updateHotel);


module.exports = router;