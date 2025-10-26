import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Lấy token và role từ localStorage (hoặc window nếu bạn dùng window)
  const token = localStorage.getItem("token") || window.userToken;
  const userRole = localStorage.getItem("role") || window.userRole;

  // Kiểm tra đã đăng nhập chưa
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role có được phép truy cập không
  if (allowedRoles && !allowedRoles.includes(userRole?.toLowerCase())) {
    // Nếu không có quyền, redirect về trang login hoặc trang unauthorized
    return <Navigate to="/login" replace />;
  }

  // Nếu hợp lệ, render children
  return children;
};

export default ProtectedRoute;