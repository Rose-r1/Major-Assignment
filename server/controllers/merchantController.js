const db = require('../config/db');

//新增酒店
exports.addHotel = async (req, res) => {
    try {
        const {
            merchant_id,
            name_cn,
            name_en,
            star_rating,
            address,
            opening_date,
            main_image
        } = req.body;

        // 基本校验
        if (!merchant_id || !name_cn || !name_en || !star_rating || !address) {
            return res.status(400).json({
                message: '缺少必要字段'
            });
        }

        const sql = `
            INSERT INTO hotels
            (merchant_id, name_cn, name_en, star_rating, address, opening_date, main_image, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // status: 0 = 待审核
        const params = [
            merchant_id,
            name_cn,
            name_en,
            star_rating,
            address,
            opening_date,
            main_image || null,
            0
        ];

        const [result] = await db.execute(sql, params);

        res.json({
            code: 200,
            message: '酒店提交成功，等待审核',
            hotel_id: result.id
        });

    } catch (error) {
        res.status(500).json({
            message: '新增酒店失败',
            error: error.message
        });
    }
};
