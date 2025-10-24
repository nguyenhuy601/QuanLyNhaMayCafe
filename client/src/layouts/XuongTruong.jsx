// src/layouts/DashboardLayout.jsx
import { useState } from "react";
import { Home, ClipboardList, BarChart2, Calendar, CheckSquare, Settings, Bell, User } from "lucide-react";

const DashboardLayout = ({ children }) => {
  const [active, setActive] = useState("Trang chủ");

  const menu = [
    { name: "Trang chủ", icon: <Home size={18} /> },
    { name: "Phân công công việc", icon: <ClipboardList size={18} /> },
    { name: "Thống kê kết quả sản xuất", icon: <BarChart2 size={18} /> },
    { name: "Xem kế hoạch", icon: <Calendar size={18} /> },
    { name: "Kiểm tra thành phẩm", icon: <CheckSquare size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-[#6b3f1d] text-white flex flex-col">
        <div className="p-4 border-b border-[#8c5a3a]">
          <h1 className="text-lg font-bold">Coffee Company</h1>
          <p className="text-sm mt-2">☕ Coffee App <span className="text-xs opacity-70">Dashboard v1.0</span></p>
        </div>

        <nav className="flex-1 mt-2">
          {menu.map((item) => (
            <button
              key={item.name}
              onClick={() => setActive(item.name)}
              className={`flex items-center gap-2 w-full px-4 py-3 text-left hover:bg-[#8c5a3a] ${
                active === item.name ? "bg-[#c27b45] text-black font-semibold rounded-r-full" : ""
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 text-xs border-t border-[#8c5a3a] bg-[#8c5a3a]/30">
          <span className="flex items-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div> Trạng thái hệ thống
          </span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#8c5a3a] text-white flex items-center justify-between px-6 py-3">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm..."
            className="bg-[#704225] px-3 py-2 rounded text-sm w-1/3 outline-none"
          />
          <div className="flex items-center gap-4">
            <Bell className="cursor-pointer" />
            <Settings className="cursor-pointer" />
            <div className="flex items-center gap-2 bg-[#704225] px-3 py-2 rounded">
              <User />
              <div>
                <p className="text-sm font-semibold">Your Name</p>
                <p className="text-xs">Xưởng trưởng</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
