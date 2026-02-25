const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/audit/list', adminController.getAuditList);
router.patch('/audit/:id', adminController.auditHotel);
router.get('/hotels', adminController.getHotels);
router.patch('/hotels/:id/offline', adminController.forceOfflineHotel);
router.patch('/hotels/:id/restore', adminController.restoreHotelToPending);


module.exports = router;