import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  UserPlus,
  LogOut,
  Shield,
  UserCog,
} from "lucide-react";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "bg-amber-600 shadow-inner" : "hover:bg-amber-700";

  const handleLogout = () => {
    if (window.confirm("Đăng xuất khỏi phiên quản trị?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-amber-900 to-amber-950 text-white flex flex-col h-screen fixed top-0 left-0 shadow-2xl z-30">
      <div className="p-5 border-b border-amber-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center">
            <Shield size={22} />
          </div>
          <div>
            <p className="text-sm uppercase tracking-widest text-amber-300">Admin Center</p>
            <p className="text-lg font-bold">Coffee Factory</p>
          </div>
        </div>
      </div>

      <nav className="p-4 flex-1 space-y-2">
        <button
          onClick={() => navigate("/admin")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive(
            "/admin"
          )}`}
        >
          <Home size={18} />
          <span>Tổng quan</span>
        </button>

        <button
          onClick={() => navigate("/admin/users")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive(
            "/admin/users"
          )}`}
        >
          <Users size={18} />
          <span>Danh sách nhân sự</span>
        </button>

        <button
          onClick={() => navigate("/admin/users/create")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive(
            "/admin/users/create"
          )}`}
        >
          <UserPlus size={18} />
          <span>Thêm nhân sự</span>
        </button>

        <button
          onClick={() => navigate("/admin/accounts")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive(
            "/admin/accounts"
          )}`}
        >
          <Users size={18} />
          <span>Quản lý Tài khoản</span>
        </button>

        <button
          onClick={() => navigate("/admin/xuong-truong")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${isActive(
            "/admin/xuong-truong"
          )}`}
        >
          <UserCog size={18} />
          <span>Quản lý Xưởng trưởng</span>
        </button>
      </nav>

      <div className="p-4 border-t border-amber-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-600 transition-colors"
        >
          <LogOut size={18} />
          <div className="flex flex-col items-start">
            <span>Đăng xuất</span>
            <span className="text-xs text-amber-200">Kết thúc phiên làm việc</span>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;

