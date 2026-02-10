const db = require('../config/db');

// 获取酒店列表
exports.getHotelList = async (req, res) => {
    try {
        const { keyword, star, city, area, minPrice, maxPrice, sort, tags } = req.query;

        // 基础查询：包含最低价格、评分以及获取一个最优惠的促销标签
        let sql = `
            SELECT h.*, 
                   MIN(r.price) as starting_price,
                   (SELECT title FROM promotions p WHERE p.hotel_id = h.id LIMIT 1) as promo_title
            FROM hotels h
            LEFT JOIN room_types r ON h.id = r.hotel_id
            WHERE h.status = 1
        `;
        let params = [];

        // 1. 城市过滤
        if (city) {
            sql += ` AND h.address LIKE ?`;
            params.push(`%${city}%`);
        }

        // 2. 区域/地段过滤
        if (area) {
            sql += ` AND h.address LIKE ?`;
            params.push(`%${area}%`);
        }

        // 3. 关键词搜索
        if (keyword) {
            sql += ` AND (h.name_cn LIKE ? OR h.address LIKE ?)`;
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        // 3. 星级过滤 (支持多选，逗号分隔)
        if (star) {
            const starArray = star.split(',');
            sql += ` AND h.star_rating IN (${starArray.map(() => '?').join(',')})`;
            params.push(...starArray);
        }

        sql += ` GROUP BY h.id`;

        // 4. 价格区间过滤 (由于是聚合后的价格，需要使用 HAVING)
        if (minPrice || maxPrice) {
            let havingClauses = [];
            if (minPrice) {
                havingClauses.push(`starting_price >= ?`);
                params.push(minPrice);
            }
            if (maxPrice) {
                havingClauses.push(`starting_price <= ?`);
                params.push(maxPrice);
            }
            sql += ` HAVING ` + havingClauses.join(' AND ');
        }

        // 5. 排序处理
        if (sort === 'score_desc') {
            sql += ` ORDER BY h.score DESC`;
        } else if (sort === 'score_asc') {
            sql += ` ORDER BY h.score ASC`;
        } else if (sort === 'price_asc') {
            sql += ` ORDER BY starting_price ASC`;
        } else if (sort === 'price_desc') {
            sql += ` ORDER BY starting_price DESC`;
        } else {
            sql += ` ORDER BY h.id DESC`;
        }

        const [hotels] = await db.execute(sql, params);

        // 数据后处理：映射字段名以适配前端
        const formattedHotels = hotels.map(h => {
            let tags = [];
            try {
                tags = h.tags ? (typeof h.tags === 'string' ? JSON.parse(h.tags) : h.tags) : [];
            } catch (e) {
                console.error('解析标签失败', e);
            }

            // 图片处理逻辑
            let imageUrl = h.main_image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';
            // 如果是本地上传路径（以 /uploads 开头），拼上服务器域名
            if (h.main_image && h.main_image.startsWith('/uploads')) {
                imageUrl = `http://localhost:5000${h.main_image}`;
            }

            return {
                id: h.id,
                name: h.name_cn,
                star: h.star_rating,
                score: h.score || 4.5,
                scoreLabel: h.score_label || (h.score >= 4.7 ? '超棒' : '很棒'),
                reviews: h.reviews_count || 100,
                favorites: h.favorites_count || 500,
                distance: h.address,
                highlight: h.description ? h.description.substring(0, 30) : '高品质酒店',
                tags: tags,
                image: imageUrl,
                price: h.starting_price || 0,
                originalPrice: (h.starting_price || 0) * 1.2,
                promoTag: h.promo_title || '',
            };
        });

        res.json({ code: 200, data: formattedHotels });
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