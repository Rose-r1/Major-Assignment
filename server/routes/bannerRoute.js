const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const authMiddleware = require('../middleware/authMiddleware');

// 公开接口：获取首页 Banner
router.get('/', bannerController.getBanners);

// 管理接口：增删改 (需要登录)
router.post('/', authMiddleware, bannerController.addBanner);
router.put('/:id', authMiddleware, bannerController.updateBanner);
router.delete('/:id', authMiddleware, bannerController.deleteBanner);

module.exports = router;
