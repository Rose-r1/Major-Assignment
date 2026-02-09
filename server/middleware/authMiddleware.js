const jwt = require('jsonwebtoken');
const blacklist = require('../utils/blacklist');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token;
    if (authHeader) {
        // 允许 Bearer 或 bearer (大小写不敏感)
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
            token = parts[1];
        } else {
            // 尝试直接读取（兼容仅发送 token 的情况）
            token = authHeader;
        }
    }

    if (!token) return res.status(401).json({ message: '未授权，请提供 Token' });

    // 检查是否在黑名单中
    if (blacklist.has(token)) {
        return res.status(401).json({ message: 'Token 已失效（已退出登录）' });
    }

    // 2. 验证 Token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('====================================');
            console.error('Token Verify Error Details:');
            console.error('Error Message:', err.message);
            console.error('Token received:', token);
            console.error('Current Secret Configured:', process.env.JWT_SECRET ? 'YES (Length: ' + process.env.JWT_SECRET.length + ')' : 'NO');
            console.error('====================================');
            return res.status(403).json({ message: 'Token 无效或已过期', error: err.message });
        }

        // 3. 将用户信息存入 req
        req.user = user;
        next();
    });
};
