import axios from 'axios';
import { message } from 'antd';

const request = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', 
  timeout: 8000,
});

// 请求拦截器（自动带 token）
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器（统一错误处理）
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    message.error(error.response?.data?.message || '请求失败');
    return Promise.reject(error);
  }
);

export default request;