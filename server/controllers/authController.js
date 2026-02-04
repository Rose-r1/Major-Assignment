const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, password, role, nickname } = req.body;
        // 1. 检查用户是否存在
        const [existing] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) return res.status(400).json({ message: '用户名已存在' });

        // 2. 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. 存入数据库
        await db.execute(
            'INSERT INTO users (username, password, role, nickname) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, role || 'user', nickname]
        );
        res.status(201).json({ code: 200, message: '注册成功' });
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        // 1. 查找用户
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(404).json({ message: '用户不存在' });

        const user = users[0];
        // 2. 校验密码
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: '密码错误' });

        // 3. 生成 JWT (包含 id 和 role)
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            code: 200,
            token,
            user: { id: user.id, role: user.role, nickname: user.nickname }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ code: 404, message: '登录失败', error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        // req.user 由中间件注入
        const userId = req.user.id;

        const [users] = await db.execute('SELECT id, username, role, nickname FROM users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: '用户不存在' });

        res.json({
            code: 200,
            data: users[0]
        });
    } catch (error) {
        res.status(500).json({ message: '获取用户信息失败' });
    }
};