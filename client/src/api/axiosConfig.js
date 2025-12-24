import axios from 'axios';
import { handle401Error } from '../utils/auth';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để tự động thêm token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    // Ưu tiên sessionStorage (per-tab) để tránh conflict giữa các tab
    const sessionToken = sessionStorage.getItem('token');
    const token = sessionToken || localStorage.getItem('token') || window.userToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor xử lý lỗi chung
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn, xử lý và redirect về login
      handle401Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;