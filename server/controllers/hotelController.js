const db = require('../config/db');

// 获取酒店列表
// 获取酒店列表
exports.getHotelList = async (req, res) => {
    try {
        const { keyword, star, city, area, minPrice, maxPrice, sort, tags, page = 1, limit = 10 } = req.query;

        // 分页参数处理
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const offset = (pageNum - 1) * limitNum;

        // 基础查询：包含最低价格、评分以及获取一个最优惠的促销标签
        let baseSql = `
            FROM hotels h
            LEFT JOIN room_types r ON h.id = r.hotel_id
            WHERE h.status = 1
        `;
        let params = [];

        // 1. 城市过滤
        if (city) {
            baseSql += ` AND h.address LIKE ?`;
            params.push(`%${city}%`);
        }

        // 2. 区域/地段过滤
        if (area) {
            baseSql += ` AND h.address LIKE ?`;
            params.push(`%${area}%`);
        }

        // 3. 关键词搜索
        if (keyword) {
            baseSql += ` AND (h.name_cn LIKE ? OR h.address LIKE ?)`;
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        // 3. 星级过滤 (支持多选，逗号分隔)
        if (star) {
            const starArray = star.split(',');
            baseSql += ` AND h.star_rating IN (${starArray.map(() => '?').join(',')})`;
            params.push(...starArray);
        }

        // 构建分组和Having子句 (用于价格过滤)
        let groupHavingSql = ` GROUP BY h.id`;

        // 4. 价格区间过滤 (由于是聚合后的价格，需要使用 HAVING)
        if (minPrice || maxPrice) {
            let havingClauses = [];
            if (minPrice) {
                havingClauses.push(`MIN(r.price) >= ?`); // 注意这里直接用聚合函数，避免别名在WHERE中不可用的问题（虽然这是HAVING）
                params.push(minPrice);
            }
            if (maxPrice) {
                havingClauses.push(`MIN(r.price) <= ?`);
                params.push(maxPrice);
            }
            groupHavingSql += ` HAVING ` + havingClauses.join(' AND ');
        }

        // --- 获取总条数 (需要特殊处理，因为有 GROUP BY 和 HAVING) ---
        // 简单做法：嵌套查询计算总数
        const countSql = `SELECT COUNT(*) as total FROM (SELECT h.id ${baseSql} ${groupHavingSql}) as temp`;
        // 注意：countSql 需要使用 params，但 params 在下面构建 dataSql 时还会被用到，所以这里要在 execute 时传入 params 的副本
        // 但是 db.execute 的 params 是按顺序的。
        // 为了避免复杂的参数管理，我们先执行 count 查询

        const [countResult] = await db.execute(countSql, params);
        const total = countResult[0].total;

        // --- 获取分页数据 ---
        let dataSql = `
            SELECT h.*, 
                   MIN(r.price) as starting_price,
                   (SELECT title FROM promotions p WHERE p.hotel_id = h.id LIMIT 1) as promo_title
            ${baseSql}
            ${groupHavingSql}
        `;

        // 5. 排序处理
        if (sort === 'score_desc') {
            dataSql += ` ORDER BY h.score DESC`;
        } else if (sort === 'score_asc') {
            dataSql += ` ORDER BY h.score ASC`;
        } else if (sort === 'price_asc') {
            dataSql += ` ORDER BY starting_price ASC`;
        } else if (sort === 'price_desc') {
            dataSql += ` ORDER BY starting_price DESC`;
        } else {
            dataSql += ` ORDER BY h.id DESC`;
        }

        // 添加分页限制
        dataSql += ` LIMIT ? OFFSET ?`;
        const queryParams = [...params, limitNum.toString(), offset.toString()]; // LIMIT 和 OFFSET通常需要字符串或数字，mysql2处理参数时比较灵活

        const [hotels] = await db.execute(dataSql, queryParams);

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
                name_en: h.name_en, // 添加英文名
                highlight: h.description ? h.description.substring(0, 30) : '高品质酒店',
                tags: tags,
                image: imageUrl,
                price: h.starting_price || 0,
                originalPrice: (h.starting_price || 0) * 1.2,
                promoTag: h.promo_title || '',
            };
        });

        res.json({
            code: 200,
            data: formattedHotels,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error(error);
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