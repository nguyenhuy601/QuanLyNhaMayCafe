import React from "react";
import {
  Home,
  ClipboardList,
  BarChart3,
  FileText,
  Users,
  LogOut,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

export default function SidebarXuongTruong() {
  const navigate = useNavigate();
  const basePath = "/factory";
  const menu = [
    { path: basePath, label: "Trang chủ", icon: <Home size={18} /> },
    {
      path: `${basePath}/phan-cong`,
      label: "Phân công công việc",
      icon: <ClipboardList size={18} />,
    },
    {
      path: `${basePath}/thong-ke`,
      label: "Thống kê kết quả sản xuất",
      icon: <BarChart3 size={18} />,
    },
    {
      path: `${basePath}/xem-ke-hoach`,
      label: "Xem kế hoạch",
      icon: <FileText size={18} />,
    },
    {
      path: `${basePath}/thong-tin-to`,
      label: "Thông tin các tổ",
      icon: <Users size={18} />,
    },
  ];

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-amber-800 to-amber-900 text-white flex flex-col h-screen fixed top-0 left-0 shadow-lg z-30">
      <div className="p-5 border-b border-amber-700">
        <h2 className="text-xl font-bold text-amber-100">Coffee Company</h2>
        <p className="text-sm text-amber-300">Dashboard sản xuất</p>
      </div>

      <div className="p-5 border-b border-amber-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center text-2xl">
            ☕
          </div>
          <div>
            <p className="font-semibold">Xưởng sản xuất</p>
            <p className="text-xs text-amber-300">Quản lý phiên bản 1.0</p>
          </div>
        </div>
      </div>

      <nav className="p-4 flex-1 space-y-2">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === basePath}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive ? "bg-amber-600 shadow-sm" : "hover:bg-amber-700"
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-amber-700 space-y-3">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-amber-700 text-amber-100">
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
    </aside>
  );
}
