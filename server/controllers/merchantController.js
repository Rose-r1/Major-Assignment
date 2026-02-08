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
            main_image,
            description,
            nearby_info
        } = req.body;

        // 基本校验
        if (!merchant_id || !name_cn || !name_en || !star_rating || !address) {
            return res.status(400).json({
                message: '缺少必要字段'
            });
        }

        const sql = `
            INSERT INTO hotels
            (merchant_id, name_cn, name_en, star_rating, address, opening_date, main_image, status, description, nearby_info)
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
            main_image ?? null,
            0,
            description ?? null,
            nearby_info ?? null
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

//获取我的酒店列表
exports.myHotels = async (req, res) => {
    try {
        const { merchant_id } = req.query

        if (!merchant_id) {
            return res.status(400).json({
                message: '缺少商户ID'
            });
        }

        const sql = `
            SELECT *
            FROM hotels
            WHERE merchant_id = ?
            ORDER BY id ASC
        `;

        const [hotels] = await db.execute(sql, [merchant_id]);

        res.json({
            code: 200,
            data: hotels
        })

    } catch (error) {
        res.status(500).json({
            message: '获取我的酒店列表失败',
            error: error.message
        });
    }
};

//获取酒店详情
exports.getHotelById = async (req, res) => {
    try {
        const { id } = req.params;

        const sql = `
            SELECT *
            FROM hotels
            WHERE id = ?
        `;

        const [result] = await db.execute(sql, [id]);

        if (result.length === 0) {
            return res.status(404).json({
                message: '酒店不存在'
            });
        }

        res.json({
            code: 200,
            data: result[0]
        });

    } catch (error) {
        res.status(500).json({
            message: '获取酒店失败',
            error: error.message
        });
    }
};

//更新酒店信息
exports.updateHotel = async(req, res) => {
    try {
        const {id} = req.params;
        const {
            name_cn,
            name_en,
            star_rating,
            address,
            opening_date,
            main_image,
            description,
            nearby_info
        } = req.body;

        if(!id){
            return res.status(400).json({
                message: '缺少酒店ID'
            })
        }

        const sql = `
            UPDATE hotels
            SET name_cn = ?,
                name_en = ?,
                star_rating = ?,
                address = ?,
                opening_date = ?,
                main_image = ?,
                description = ?,
                nearby_info = ?,
                status = 0
            WHERE id = ?
        `;

        const params = [
            name_cn,
            name_en,
            star_rating,
            address,
            opening_date,
            main_image ?? null,
            description ?? null,
            nearby_info ?? null,
            id
        ];

        const [result] = await db.execute(sql, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: '酒店不存在'
            });
        }

        res.json({
            code: 200,
            message: '酒店更新成功'
        });

    } catch (error) {
        res.status(500).json({
            message: '更新酒店失败',
            error: error.message
        });
    }
};

//有就更新，没有就新增房型
exports.upsertRoom = async (req, res) => {
    try {
        const { id: hotel_id } = req.params;
        const { name, price, base_price, capacity, total_rooms, image } = req.body;

        if (!hotel_id || !name || !price || !base_price) {
            return res.status(400).json({
                message: '缺少必要字段'
            });
        }

        // 先查是否存在该房型
        const checkSql = `
            SELECT id FROM room_types
            WHERE hotel_id = ? AND name = ?
        `;

        const [rows] = await db.execute(checkSql, [hotel_id, name]);

        let result;

        if (rows.length > 0) {
            // 更新
            const updateSql = `
                UPDATE room_types
                SET price = ?, base_price = ?, capacity = ?, total_rooms = ?, image = ?
                WHERE id = ?
            `;

            [result] = await db.execute(updateSql, [
                price,
                base_price,
                capacity ?? 0,
                total_rooms ?? 0,
                image ?? null,
                rows[0].id
            ]);

            res.json({
                code: 200,
                message: '房型更新成功'
            });

        } else {
            // 新增
            const insertSql = `
                INSERT INTO room_types
                (hotel_id, name, price, base_price, capacity, total_rooms, image)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            [result] = await db.execute(insertSql, [
                hotel_id,
                name,
                price,
                base_price,
                capacity ?? 0,
                total_rooms ?? 0,
                image ?? null
            ]);

            res.json({
                code: 200,
                message: '房型新增成功',
                room_id: result.insertId
            });
        }

    } catch (error) {
        res.status(500).json({
            message: '管理房型失败',
            error: error.message
        });
    }
};
