import React from "react";
import { Search, Bell, Settings, User } from "lucide-react";

export default function Header() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <header className="bg-gradient-to-r from-amber-700 to-amber-800 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3 bg-amber-600/60 px-4 py-2 rounded-xl w-full max-w-md">
        <Search size={18} className="text-white" />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="bg-transparent outline-none text-sm w-full placeholder:text-amber-100/70"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-lg hover:bg-amber-600/60 transition-colors">
          <Bell size={20} />
        </button>
        <button className="p-2 rounded-lg hover:bg-amber-600/60 transition-colors">
          <Settings size={20} />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-amber-600">
          <div className="w-11 h-11 bg-amber-500 rounded-full flex items-center justify-center">
            <User size={22} />
          </div>
          <div className="leading-tight">
            <p className="font-semibold">{user.hoTen || "Your Name"}</p>
            <p className="text-xs text-amber-200">Xưởng trưởng</p>
          </div>
        </div>
      </div>
    </header>
  );
}
