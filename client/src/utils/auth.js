export const authUtils = {
  // Lưu token và role
  saveAuth: (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
  },

  // Lấy token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Lấy role
  getRole: () => {
    return localStorage.getItem("role");
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Kiểm tra role
  hasRole: (allowedRoles) => {
    const userRole = localStorage.getItem("role");
    if (!userRole) return false;
    
    return allowedRoles.some(
      role => role.toLowerCase() === userRole.toLowerCase()
    );
  },

  // Đăng xuất
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.userToken = null;
    window.userRole = null;
  },

  // Lấy redirect path theo role
  getRedirectPath: (role) => {
    const roleMap = {
      worker: "/worker",
      "công nhân": "/worker",
      director: "/director",
      "giám đốc": "/director",
      qc: "/qc",
      "quality control": "/qc",
    };
    
    return roleMap[role?.toLowerCase()] || "/login";
  },
};