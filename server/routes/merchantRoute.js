const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/hotels', merchantController.addHotel);
router.get('/hotels', merchantController.myHotels);
router.get('/hotels/:id', merchantController.getHotelById);
router.put('/hotels/:id', merchantController.updateHotel);
router.post('/hotels/:id/rooms', merchantController.upsertRoom);
router.delete('/hotels/:id', authMiddleware, merchantController.deleteHotel);
router.get('/hotels/:hotel_id/room-types', merchantController.getRoomTypesByHotel);


module.exports = router;