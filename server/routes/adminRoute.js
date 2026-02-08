const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/audit/list', adminController.getAuditList);
router.patch('/audit/:id', adminController.auditHotel);


module.exports = router;