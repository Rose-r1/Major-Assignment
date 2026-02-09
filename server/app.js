const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const authRoute = require('./routes/authRoute');
const hotelRoute = require('./routes/hotelRoute');
const merchantRoute = require('./routes/merchantRoute');
const adminRoute = require('./routes/adminRoute');
const bannerRoute = require('./routes/bannerRoute');
const uploadRouter = require('./routes/upload');
const path = require('path');


const app = express();


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
app.listen(PORT, () => {
    console.log(`====================================`);
    console.log(`后端服务已启动`);
    console.log(`运行端口: ${PORT}`);
    console.log(`环境: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================`);
});