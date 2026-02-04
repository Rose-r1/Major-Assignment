const db = require('../config/db');

// 获取酒店列表
exports.getHotelList = async (req, res) => {
    try {
        const { keyword, star } = req.query;
        let sql = `
            SELECT h.id, h.name_cn, h.name_en, h.star_rating, h.address, h.main_image, 
                   MIN(r.price) as starting_price 
            FROM hotels h
            LEFT JOIN room_types r ON h.id = r.hotel_id
            WHERE h.status = 1
        `;
        let params = [];

        if (keyword) {
            sql += ` AND (h.name_cn LIKE ? OR h.address LIKE ?)`;
            params.push(`%${keyword}%`, `%${keyword}%`);
        }
        if (star) {
            sql += ` AND h.star_rating = ?`;
            params.push(star);
        }

        sql += ` GROUP BY h.id`;

        // 排序处理
        const { sort } = req.query;
        if (sort === 'price_asc') {
            sql += ` ORDER BY starting_price ASC`;
        } else if (sort === 'price_desc') {
            sql += ` ORDER BY starting_price DESC`;
        } else if (sort === 'star_desc') {
            sql += ` ORDER BY h.star_rating DESC`;
        } else {
            // 默认排序
            sql += ` ORDER BY h.id DESC`;
        }

        const [hotels] = await db.execute(sql, params);
        res.json({ code: 200, data: hotels });
    } catch (error) {
        res.status(500).json({ message: '查询酒店失败', error: error.message });
    }
};

// 获取酒店详情 (包含房型和优惠)
exports.getHotelDetail = async (req, res) => {
    try {
        const hotelId = req.params.id;

        // 1. 查询酒店基本信息
        const [hotels] = await db.execute('SELECT * FROM hotels WHERE id = ? AND status = 1', [hotelId]);
        if (hotels.length === 0) return res.status(404).json({ message: '酒店未找到' });

        const hotel = hotels[0];

        // 2. 查询该酒店下的房型
        const [rooms] = await db.execute('SELECT * FROM room_types WHERE hotel_id = ?', [hotelId]);

        // 3. 查询该酒店下的优惠信息
        const [promos] = await db.execute('SELECT * FROM promotions WHERE hotel_id = ?', [hotelId]);

        // 组合返回
        res.json({
            code: 200,
            data: {
                ...hotel,
                room_types: rooms,
                promotions: promos
            }
        });
    } catch (error) {
        res.status(500).json({ message: '查询详情失败' });
    }
};

// 获取酒店优惠
exports.getHotelPromotions = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const [promos] = await db.execute('SELECT * FROM promotions WHERE hotel_id = ?', [hotelId]);
        res.json({ code: 200, data: promos });
    } catch (error) {
        res.status(500).json({ message: '获取优惠信息失败' });
    }
};

// 获取周边信息
exports.getHotelNearby = async (req, res) => {
    try {
        const hotelId = req.params.id;
        const [nearby] = await db.execute('SELECT * FROM nearby_places WHERE hotel_id = ?', [hotelId]);
        res.json({ code: 200, data: nearby });
    } catch (error) {
        res.status(500).json({ message: '获取周边信息失败' });
    }
};