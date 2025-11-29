import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, CalendarClock, ClipboardList, Users, LogOut } from "lucide-react";

export default function Sidebar() {
  const basePath = "/totruong";
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { path: basePath, label: "Trang chủ", icon: <Home size={18} /> },
    { path: `${basePath}/cham-cong`, label: "Chấm công công nhân", icon: <CalendarClock size={18} /> },
    { path: `${basePath}/phan-cong-ca`, label: "Phân công ca làm", icon: <ClipboardList size={18} /> },
    { path: `${basePath}/to-nhom`, label: "Tổ sản xuất", icon: <Users size={18} /> },
  ];

  const isActive = (path) => (location.pathname === path ? "bg-amber-600" : "hover:bg-amber-700");

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      navigate("/login");
    }
  };

  return (
    <div className="w-64 bg-gradient-to-b from-amber-800 to-amber-900 text-white flex flex-col h-screen fixed top-0 left-0 shadow-lg z-30">
      <div className="p-4 border-b border-amber-700">
        <h1 className="text-xl font-bold">Coffee Company</h1>
      </div>

      <div className="p-4 border-b border-amber-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded flex items-center justify-center">
            <span className="text-lg">☕</span>
          </div>
          <div>
            <div className="font-semibold">Coffee App</div>
            <div className="text-xs text-amber-300">Tổ trưởng dashboard</div>
          </div>
        </div>
      </div>

      <nav className="p-3 flex-1 space-y-1">
        {menu.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive(item.path)}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

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
}

