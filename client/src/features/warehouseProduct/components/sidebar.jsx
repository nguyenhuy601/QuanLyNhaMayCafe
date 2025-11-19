import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,           // Trang chủ (Trang chủ)
  TrendingUp,     // Thống kê (Thống kê)
  FileText,       // Kiểm định QC (Kiểm định QC)
  LogIn,          // Nhập kho (Nhập kho thành phẩm)
  LogOut,         // Xuất kho (Xuất kho thành phẩm)
  User,           // Thông tin cá nhân (Thông tin cá nhân)
  Coffee,         // Logo Coffee App
} from "lucide-react";

function Sidebar() {
  const location = useLocation();

  const menu = [
    { to: "/", icon: <Home size={18} />, text: "Trang chủ", count: null },
    { to: "/thongke", icon: <TrendingUp size={18} />, text: "Thống kê", count: 10 },
    { to: "/kiemdinhqc", icon: <FileText size={18} />, text: "Kiểm định QC", count: 10 },
    { to: "/nhapkho", icon: <LogIn size={18} />, text: "Nhập kho thành phẩm", count: 10 },
    { to: "/xuatkho", icon: <LogOut size={18} />, text: "Xuất kho thành phẩm", count: 10 },
    { to: "/thongtincanhan", icon: <User size={18} />, text: "Thông tin cá nhân", count: 10 },
  ];
  
  const countBgColor = '#6b3e1d'; 

  return (
    <div className="w-64 bg-[#8B4513] text-white flex flex-col justify-between h-full"> {/* Chỉnh màu nền và chiều cao */}
      <div>
        <div className="px-6 py-4 border-b border-[#a0522d] flex items-center">
          <Coffee size={24} className="mr-3 text-[#D2B48C]" /> {/* Icon Coffee */}
          <div>
            <h1 className="text-lg font-bold">Coffee Company</h1>
            <p className="text-sm text-gray-300">Coffee App - Dashboard v1.0</p>
          </div>
        </div>

        <nav className="mt-4 space-y-1">
          {menu.map((item) => {
            // Xác định trạng thái active
            const isActive = location.pathname === item.to;
            
            // Màu sắc dựa trên trạng thái active/hover
            const bgColor = isActive 
              ? "bg-[#FFA500] font-semibold" // Màu cam khi Active
              : "hover:bg-[#A0522D]";      // Màu nâu đậm hơn khi Hover

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between px-6 py-3 transition-colors duration-200 ${bgColor}`}
              >
                <span className="flex items-center">
                  <span className="mr-3 flex items-center">{item.icon}</span>
                  <span>{item.text}</span>
                </span>
                
                {/* Hiển thị số lượng (Count) */}
                {item.count !== null && (
                  <span 
                    className="ml-4 px-2 py-0.5 text-xs font-bold rounded"
                    style={{ backgroundColor: countBgColor }} // Sử dụng màu nền của sidebar
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Trạng thái hệ thống */}
      <div className="p-4 border-t border-[#a0522d] flex items-center text-sm">
        <span className="text-[#32CD32] mr-2">●</span>
        <span>Trạng thái hệ thống</span>
      </div>
    </div>
  );
}

export default Sidebar;