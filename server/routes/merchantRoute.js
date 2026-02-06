const express = require('express');
const router = express.Router();
const merchantController = require('../controllers/merchantController');

router.post('/hotels', merchantController.addHotel);


module.exports = router;