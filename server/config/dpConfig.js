require("dotenv").config(); // 加载 .env 文件

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
  try {
    const [rows] = await pool.execute("SELECT NOW() as currentTime");
    console.log("连接成功，当前时间:", rows[0].currentTime);
  } catch (err) {
    console.error("连接失败:", err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
