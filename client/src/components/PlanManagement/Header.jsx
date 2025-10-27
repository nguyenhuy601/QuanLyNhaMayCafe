import React from 'react';
import { Search, Bell, Settings, User } from 'lucide-react';

const Header = () => {
  return (
    <div className="bg-gradient-to-r from-amber-700 to-amber-800 text-white p-4 flex items-center justify-between shadow-lg">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-300" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-amber-600 border border-amber-500 text-white placeholder-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>
      
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
            <div className="font-semibold">Your Name</div>
            <div className="text-xs text-amber-200">Quản lý kế hoạch</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;