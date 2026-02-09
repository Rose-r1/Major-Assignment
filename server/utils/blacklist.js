// 简单的内存黑名单，用于存储已注销的 Token
// 注意：服务重启后黑名单会清空，生产环境建议使用 Redis
const blacklist = new Set();

module.exports = {
    add: (token) => blacklist.add(token),
    has: (token) => blacklist.has(token),
    // 可选：定期清理过期 Token (这里暂不实现复杂的清理逻辑)
};
