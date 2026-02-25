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

// 全量酒店管理
exports.getHotels = async (req, res) => {
    try {
        const { status, keyword } = req.query;

        let sql = `
            SELECT *
            FROM hotels
            WHERE 1=1
        `;
        let params = [];

        // 状态筛选（可选）
        if (status !== undefined) {
            sql += ` AND status = ?`;
            params.push(status);
        }

        // 关键词搜索（可选）
        if (keyword) {
            sql += ` AND (name_cn LIKE ? OR address LIKE ?)`;
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        sql += ` ORDER BY id ASC`;

        const [rows] = await db.execute(sql, params);

        res.json({
            code: 200,
            total: rows.length,
            data: rows
        });

    } catch (error) {
        res.status(500).json({
            message: '获取酒店列表失败',
            error: error.message
        });
    }
};

// 下线酒店
exports.forceOfflineHotel = async(req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: '缺少参数'
            });
        }

        const sql = `
            UPDATE hotels
            SET status = 2
            WHERE id = ?
        `;

        const [result] = await db.execute(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: '酒店不存在'
            });
        }

        res.json({
            code: 200,
            message: "已强制将酒店下线"
        });

    } catch (error) {
        res.status(500).json({
            message: '审核失败',
            error: error.message
        });
    }
};

// 恢复酒店为待审核
exports.restoreHotelToPending = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: '缺少参数',
      });
    }

    const sql = `
      UPDATE hotels
      SET status = 0
      WHERE id = ?
    `;

    const [result] = await db.execute(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: '酒店不存在',
      });
    }

    res.json({
      code: 200,
      message: '已恢复为待审核',
    });
  } catch (error) {
    res.status(500).json({
      message: '恢复失败',
      error: error.message,
    });
  }
};