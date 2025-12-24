// Helper function để lấy token (dùng ở mọi nơi)
// Chỉ dùng sessionStorage (per-tab) để tránh conflict giữa các tab
// Không dùng localStorage để tránh bị lẫn token giữa các tab
export const getToken = () => {
  // Ưu tiên sessionStorage (per-tab), chỉ fallback localStorage nếu sessionStorage trống
  // Điều này đảm bảo mỗi tab có token riêng
  const sessionToken = sessionStorage.getItem("token");
  if (sessionToken) {
    return sessionToken;
  }
  // Fallback cho các tab cũ chưa có sessionStorage
  return localStorage.getItem("token") || window.userToken || null;
};

// Helper function để lấy role (ưu tiên sessionStorage)
export const getRole = () => {
  return sessionStorage.getItem("role") || localStorage.getItem("role") || window.userRole || null;
};

// Helper function để lấy userEmail (ưu tiên sessionStorage)
export const getUserEmail = () => {
  return sessionStorage.getItem("userEmail") || localStorage.getItem("userEmail") || null;
};

// Flag để tránh xử lý 401 nhiều lần
let isHandling401 = false;

// Helper function để xử lý lỗi 401 (token expired)
export const handle401Error = (errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.") => {
  // Nếu đang xử lý 401 rồi, bỏ qua
  if (isHandling401) {
    return;
  }
  
  // Đánh dấu đang xử lý
  isHandling401 = true;
  
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
  
  // Reset flag sau 2 giây (phòng trường hợp redirect không thành công)
  setTimeout(() => {
    isHandling401 = false;
  }, 2000);
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

  // Lấy role (ưu tiên sessionStorage)
  getRole: () => {
    return sessionStorage.getItem("role") || localStorage.getItem("role") || window.userRole || null;
  },

  // Kiểm tra đã đăng nhập chưa (ưu tiên sessionStorage)
  isAuthenticated: () => {
    return !!(sessionStorage.getItem("token") || localStorage.getItem("token") || window.userToken);
  },

  // Kiểm tra role (ưu tiên sessionStorage)
  hasRole: (allowedRoles) => {
    const userRole = sessionStorage.getItem("role") || localStorage.getItem("role") || window.userRole;
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