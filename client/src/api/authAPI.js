import axiosInstance from './axiosConfig';

export const authAPI = {
  // Đăng nhập
  login: async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { 
      email, 
      password 
    });
    return response.data;
  },

  // Verify token
  verifyToken: async () => {
    const response = await axiosInstance.post('/auth/verify');
    return response.data;
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  },
};