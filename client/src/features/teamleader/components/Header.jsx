import React from "react";
import { Bell, Settings, User } from "lucide-react";

export default function Header() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <div className="bg-gradient-to-r from-amber-700 to-amber-800 text-white p-4 flex items-center justify-between shadow-lg">
      <div className="flex-1 max-w-md" />

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-amber-600 rounded-lg transition-colors">
          <Bell size={22} />
        </button>
        <button className="p-2 hover:bg-amber-600 rounded-lg transition-colors">
          <Settings size={22} />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-amber-600">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
            <User size={22} />
          </div>
          <div>
            <div className="font-semibold">{user.hoTen || "Tổ trưởng"}</div>
            <div className="text-xs text-amber-200">Tổ trưởng sản xuất</div>
          </div>
        </div>
      </div>
    </div>
  );
}

