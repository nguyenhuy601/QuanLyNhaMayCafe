import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Plus, List, LogOut, ShoppingCart } from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hàm check active route
  const isActive = (path) =>
    location.pathname === path ? "bg-amber-600" : "hover:bg-amber-700";

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <div className="w-64 bg-gradient-to-b from-amber-800 to-amber-900 text-white flex flex-col h-screen fixed top-0 left-0 shadow-lg z-20">
      {/* Logo */}
      <div className="p-4 border-b border-amber-700">
        <h1 className="text-xl font-bold">Coffee Company</h1>
      </div>

      {/* App Info */}
      <div className="p-4 border-b border-amber-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded flex items-center justify-center">
            <ShoppingCart size={20} />
          </div>
          <div>
            <div className="font-semibold">Coffee App</div>
            <div className="text-xs text-amber-300">Dashboard v1.0</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 flex-1 space-y-1">
        <button
          onClick={() => navigate("/orders")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive(
            "/orders"
          )}`}
        >
          <Home size={18} />
          <span>Trang chủ</span>
        </button>

        <button
          onClick={() => navigate("/orders/create")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive(
            "/orders/create-order"
          )}`}
        >
          <Plus size={18} />
          <span>Tạo đơn hàng</span>
        </button>

        <button
          onClick={() => navigate("/orders/list")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive(
            "/orders/list"
          )}`}
        >
          <List size={18} />
          <span>Danh sách đơn hàng</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-amber-700">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-amber-700 hover:bg-amber-600 transition-colors mb-2">
          <span className="text-amber-300">●</span>
          <span>Trạng thái hệ thống</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
