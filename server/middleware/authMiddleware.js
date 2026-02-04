const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token;
    if (authHeader) {
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else {
            token = authHeader;
        }
    }

    if (!token) return res.status(401).json({ message: '未授权，请提供 Token' });

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
