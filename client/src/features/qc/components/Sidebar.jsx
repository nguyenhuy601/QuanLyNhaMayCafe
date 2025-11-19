import React, { useEffect } from "react";
import { Home, CheckCircle, ClipboardList, LogOut } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = ({ activeMenu, setActiveMenu }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Đồng bộ activeMenu theo URL hiện tại
  useEffect(() => {
    if (location.pathname.startsWith("/qc/kiem-dinh")) {
      setActiveMenu("kiemDinh");
    } else if (location.pathname.startsWith("/qc/danh-sach")) {
      setActiveMenu("list");
    } else {
      setActiveMenu("home");
    }
  }, [location.pathname, setActiveMenu]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="fixed top-0 left-0 z-40 w-64 h-screen bg-gradient-to-b from-amber-800 to-amber-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-amber-700">
        <h1 className="text-xl font-bold">Coffee Company</h1>
      </div>

      {/* App Info */}
      <div className="p-4 border-b border-amber-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded flex items-center justify-center">
            <span className="text-lg">☕</span>
          </div>
          <div>
            <div className="font-semibold">Coffee App</div>
            <div className="text-xs text-amber-300">Dashboard v1.0</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-2">
          {/* Kiểm định thành phẩm */}
          <button
            onClick={() => {
              setActiveMenu("kiemDinh");
              navigate("/qc/kiem-dinh");
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1 ${
              activeMenu === "kiemDinh" ? "bg-amber-600" : "hover:bg-amber-700"
            }`}
          >
            <CheckCircle size={18} />
            <span>Kiểm định thành phẩm</span>
          </button>

          {/* Danh sách yêu cầu */}
          <button
            onClick={() => {
              setActiveMenu("list");
              navigate("/qc/danh-sach");
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1 ${
              activeMenu === "list" ? "bg-amber-600" : "hover:bg-amber-700"
            }`}
          >
            <ClipboardList size={18} />
            <span>Danh sách yêu cầu</span>
          </button>
        </nav>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-amber-700">
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
