import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  ClipboardList,
  BarChart,
  Calendar,
  CheckCircle,
} from "lucide-react";

function Sidebar() {
  const location = useLocation();

  const menu = [
    { to: "/", icon: <Home size={18} />, text: "Trang chủ" },
    { to: "/phancong", icon: <ClipboardList size={18} />, text: "Phân công công việc" },
    { to: "/thongke", icon: <BarChart size={18} />, text: "Thống kê kết quả sản xuất" },
    { to: "/kehoach", icon: <Calendar size={18} />, text: "Xem kế hoạch" },
    { to: "/kiemtra", icon: <CheckCircle size={18} />, text: "Kiểm tra thành phẩm" },
  ];

  return (
    <div className="w-64 bg-[#6b3e1d] text-white flex flex-col justify-between">
      <div>
        <div className="px-6 py-4 border-b border-[#855a32]">
          <h1 className="text-lg font-bold">Coffee Company</h1>
          <p className="text-sm text-gray-300">Coffee App - Dashboard v1.0</p>
        </div>

        <nav className="mt-4 space-y-1">
          {menu.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center px-6 py-3 rounded-lg ${
                location.pathname === item.to
                  ? "bg-[#a96738]"
                  : "hover:bg-[#8b5530]"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.text}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-[#855a32] flex items-center justify-between bg-[#814c25] rounded-t-lg">
        <span className="text-sm">🟢 Trạng thái hệ thống</span>
      </div>
    </div>
  );
}

export default Sidebar;
