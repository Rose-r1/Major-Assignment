const db = require('../config/db');

// 待审核列表
exports.getAuditList = async(req, res) => {
    try {
        const sql = `
            SELECT *
            FROM hotels
            WHERE status = 0
            ORDER BY id ASC
        `;

        const [rows] = await db.execute(sql);

        res.json({
            code: 200,
            data: rows
        });

    } catch (error) {
        res.status(500).json({
            message: '获取审核列表失败',
            error: error.message
        });
    }
};

