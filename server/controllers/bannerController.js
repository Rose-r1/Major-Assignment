const db = require('../config/db');

// 获取首页 Banner 列表 (公开接口)
exports.getBanners = async (req, res) => {
    try {
        // 只查询状态为启用的，按权重倒序排列
        const [rows] = await db.execute('SELECT * FROM banners WHERE status = 1 ORDER BY sort_order DESC, id DESC');
        res.json({ code: 200, data: rows });
    } catch (error) {
        console.error('Get Banners Error:', error);
        res.status(500).json({ message: '获取 Banner 失败' });
    }
};

// 添加 Banner (需要管理员权限)
exports.addBanner = async (req, res) => {
    try {
        const { image_url, target_url, title, sort_order } = req.body;

        if (!image_url) {
            return res.status(400).json({ message: '图片地址不能为空' });
        }

        await db.execute(
            'INSERT INTO banners (image_url, target_url, title, sort_order) VALUES (?, ?, ?, ?)',
            [image_url, target_url, title, sort_order || 0]
        );

        res.status(201).json({ code: 200, message: '添加成功' });
    } catch (error) {
        console.error('Add Banner Error:', error);
        res.status(500).json({ message: '添加失败' });
    }
};

// 删除 Banner
exports.deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        await db.execute('DELETE FROM banners WHERE id = ?', [id]);
        res.json({ code: 200, message: '删除成功' });
    } catch (error) {
        res.status(500).json({ message: '删除失败' });
    }
};

// 更新 Banner 状态或排序
exports.updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, target_url, sort_order, status } = req.body;

        await db.execute(
            'UPDATE banners SET title=?, target_url=?, sort_order=?, status=? WHERE id=?',
            [title, target_url, sort_order, status, id]
        );

        res.json({ code: 200, message: '更新成功' });
    } catch (error) {
        res.status(500).json({ message: '更新失败' });
    }
};
