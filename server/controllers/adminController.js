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

// 审核操作
exports.auditHotel = async(req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body;

        if (!id || !action) {
            return res.status(400).json({
                message: '缺少参数'
            });
        }

        let status;

        if (action === 'pass') {
            status = 1;
        } else if (action === 'reject') {
            status = 2;
        } else {
            return res.status(400).json({
                message: 'action 只能是 pass 或 reject'
            });
        }

        const sql = `
            UPDATE hotels
            SET status = ?
            WHERE id = ?
        `;

        const [result] = await db.execute(sql, [status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: '酒店不存在'
            });
        }

        res.json({
            code: 200,
            message: action === 'pass' ? '审核通过' : '审核驳回'
        });

    } catch (error) {
        res.status(500).json({
            message: '审核失败',
            error: error.message
        });
    }
};