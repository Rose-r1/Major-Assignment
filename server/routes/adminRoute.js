const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/audit/list', adminController.getAuditList);


module.exports = router;