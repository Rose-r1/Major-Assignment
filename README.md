# Major-Assignment 酒店旅游预约管理系统

本项目是一个完整的全栈 Web 应用程序，包含移动端小程序、Web 管理后台以及 Node.js 后端。系统主要功能包括酒店搜索、预约下单、个人信息管理以及后台数据维护。

##  项目结构

```text
Major-Assignment/
├── server/             # 后端项目 (Node.js + Express + MySQL)
├── client-uniapp/      # 移动端小程序 (Taro + React + TS)
└── web/
    └── trip-app/       # Web 管理后台 (React + Ant Design + Vite)
```

---

##  快速开始

### 1. 环境准备
- **Node.js**: 建议版本 v18.x 或更高
- **MySQL**: 数据库支持
- **微信开发者工具**: 用于运行小程序端

### 2. 后端配置 (Server)
1. 进入目录：`cd server`
2. 安装依赖：`npm install`
3. 配置环境：修改 `.env` 文件，填写你的数据库连接信息及密钥。
4. 运行项目：`npm run dev` (通过 nodemon 启动)

### 3. 移动端 (Client-UniApp)
1. 进入目录：`cd client-uniapp`
2. 安装依赖：`npm install`
3. 运行项目：`npm run dev:weapp`
4. 使用**微信开发者工具**打开目录下的 `dist` 文件夹即可预览。

### 4. Web 管理端 (Web/Trip-App)
1. 进入目录：`cd web/trip-app`
2. 安装依赖：`npm install`
3. 运行项目：`npm run dev`
4. 访问地址：`http://localhost:5173` (默认端口)

---

##  技术栈

### 后端 (Server)
- **框架**: Express.js
- **数据库**: MySQL (使用 mysql2 驱动)
- **鉴权**: JWT (jsonwebtoken) & bcryptjs (加密)
- **上传**: Multer (文件上传) & Ali-OSS (可选存储)
- **中间件**: CORS, Body-parser, Dotenv

### 移动端 (Client-UniApp)
- **框架**: Taro (React 技术栈)
- **开发语言**: TypeScript
- **样式**: SCSS (Vanilla CSS)
- **特性**: 支持多端编译，目前主要适配微信小程序。

### Web 后台 (Web/Trip-App)
- **构建工具**: Vite
- **框架**: React 19
- **UI 组件库**: Ant Design (v6)
- **路由**: React Router v7
- **请求**: Axios

---

##  功能特性

-  **酒店搜索**: 支持关键词、城市、区域及日期筛选。
-  **排序过滤**: 支持按评分、价格及距离排序。
-  **日期选择**: 自定义日期范围选择插件。
-  **后台管理**: 酒店信息录入、图片上传、订单状态追踪。
-  **用户系统**: 手机号登录与权限验证。

---

