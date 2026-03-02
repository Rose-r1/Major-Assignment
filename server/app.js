const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const authRoute = require('./routes/authRoute');
const hotelRoute = require('./routes/hotelRoute');
const merchantRoute = require('./routes/merchantRoute');
const adminRoute = require('./routes/adminRoute');
const bannerRoute = require('./routes/bannerRoute');
const locationRoute = require('./routes/locationRoute');
const chatRoute = require('./routes/chatRoute');
const uploadRouter = require('./routes/upload');
const path = require('path');


const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // 允许小程序端跨域连接
        methods: ["GET", "POST"]
    }
});

// 将 io 实例挂载到 app 上，方便在路由/控制器中通过 req.app.get('io') 获取
app.set('io', io);

io.on('connection', (socket) => {
    console.log('有新的客户端连接:', socket.id);
    socket.on('disconnect', () => {
        console.log('客户端断开连接:', socket.id);
    });
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 静态目录，方便访问上传的图片
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const authMiddleware = require('./middleware/authMiddleware');

app.use('/api/auth', authRoute);     // 身份验证相关接口 (Login/Register accessible without token)
app.use('/api/hotels', authMiddleware, hotelRoute);   // 酒店展示及商户操作接口 (Protected)
app.use('/api/merchant', authMiddleware, merchantRoute); //商户端接口 (Protected)
app.use('/api/admin', authMiddleware, adminRoute);   //管理员端接口 (Protected)
app.use('/api/banners', bannerRoute); // Banner 接口 (内部区分公开/私有)
app.use('/api/location', locationRoute);
app.use('/api/chat', chatRoute);
app.use('/api', uploadRouter); // 路由身份验证移至路由内部，防止拦截其他错误路径


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({
        code: 500,
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`====================================`);
    console.log(`后端服务已启动 (已开启 WebSocket)`);
    console.log(`运行端口: ${PORT}`);
    console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================`);
});