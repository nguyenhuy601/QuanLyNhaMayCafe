import React from "react";
import {
  Home,
  ClipboardList,
  BarChart,
  Calendar,
  CheckCircle,
} from "lucide-react";

function Sidebar() {
  return (
    <div className="w-64 bg-[#6b3e1d] text-white flex flex-col justify-between">
      <div>
        <div className="px-6 py-4 border-b border-[#855a32]">
          <h1 className="text-lg font-bold">Coffee Company</h1>
          <p className="text-sm text-gray-300">Coffee App - Dashboard v1.0</p>
        </div>

        <nav className="mt-4 space-y-1">
          <SidebarItem icon={<Home size={18} />} text="Trang chủ" active />
          <SidebarItem icon={<ClipboardList size={18} />} text="Phân công công việc" />
          <SidebarItem icon={<BarChart size={18} />} text="Thống kê kết quả sản xuất" />
          <SidebarItem icon={<Calendar size={18} />} text="Xem kế hoạch" />
          <SidebarItem icon={<CheckCircle size={18} />} text="Kiểm tra thành phẩm" />
        </nav>
      </div>

      <div className="p-4 border-t border-[#855a32] flex items-center justify-between bg-[#814c25] rounded-t-lg">
        <span className="text-sm">🟢 Trạng thái hệ thống</span>
      </div>
    </div>
  );
}

function SidebarItem({ icon, text, active }) {
  return (
    <div
      className={`flex items-center px-6 py-3 cursor-pointer ${
        active ? "bg-[#a96738] rounded-lg" : "hover:bg-[#8b5530]"
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span>{text}</span>
    </div>
  );
}

export default Sidebar;
