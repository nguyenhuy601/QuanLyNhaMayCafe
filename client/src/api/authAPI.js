import axiosInstance from './axiosConfig';

const authAPI = {
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

  // Admin: Lấy danh sách accounts
  getAccounts: async (role = null) => {
    const params = role ? { role } : {};
    const response = await axiosInstance.get('/auth/accounts', { params });
    return response.data;
  },

  // Admin: Lấy thông tin account theo ID
  getAccountById: async (accountId) => {
    const response = await axiosInstance.get(`/auth/accounts/${accountId}`);
    return response.data;
  },

  // Admin: Cập nhật role của account
  updateAccountRole: async (accountId, role) => {
    const response = await axiosInstance.put(`/auth/accounts/${accountId}/role`, { role });
    return response.data;
  },

  // Admin: Gán sản phẩm phụ trách cho xưởng trưởng
  assignProductsToManager: async (accountId, sanPhamPhuTrach) => {
    const response = await axiosInstance.put(`/auth/accounts/${accountId}/san-pham-phu-trach`, {
      sanPhamPhuTrach
    });
    return response.data;
  },

  // Admin: Tạo account mới
  createAccount: async (accountData) => {
    const response = await axiosInstance.post('/auth/accounts', accountData);
    return response.data;
  },

  // Admin: Cập nhật account
  updateAccount: async (accountId, accountData) => {
    const response = await axiosInstance.put(`/auth/accounts/${accountId}`, accountData);
    return response.data;
  },

  // Admin: Xóa account
  deleteAccount: async (accountId) => {
    const response = await axiosInstance.delete(`/auth/accounts/${accountId}`);
    return response.data;
  },
};

export default authAPI;