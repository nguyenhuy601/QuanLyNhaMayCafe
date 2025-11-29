// Helper function để lấy token (dùng ở mọi nơi)
export const getToken = () => {
  return sessionStorage.getItem("token") || localStorage.getItem("token") || window.userToken || null;
};

// Helper function để xử lý lỗi 401 (token expired)
export const handle401Error = (errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.") => {
  // Clear tất cả auth data
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");
  window.userToken = null;
  window.userRole = null;
  
  // Hiển thị thông báo
  alert(errorMessage);
  
  // Redirect về login
  window.location.href = "/login";
};

export const authUtils = {
  // Lưu token và role
  saveAuth: (token, role) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
  },

  // Lấy token (từ sessionStorage hoặc localStorage)
  getToken: () => {
    return getToken();
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
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("role");
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