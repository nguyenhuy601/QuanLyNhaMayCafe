import React from "react";
import { Search, Bell, Settings, User } from "lucide-react";

function Header() {
  return (
    <div className="bg-[#8b5530] text-white flex justify-between items-center px-6 py-3 shadow-md">
      {/* Search */}
      <div className="flex items-center bg-[#a96738] px-3 py-2 rounded-md w-1/3">
        <Search size={18} className="mr-2 text-white" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="bg-transparent outline-none text-white w-full placeholder:text-gray-200"
        />
      </div>

      {/* Icons + User */}
      <div className="flex items-center space-x-5">
        <Bell size={20} />
        <Settings size={20} />
        <div className="flex items-center space-x-2 bg-[#a96738] px-3 py-1 rounded-full">
          <User size={18} />
          <div>
            <p className="font-semibold text-sm">Your Name</p>
            <p className="text-xs text-gray-200">Quản lý kho thành phẩm</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;