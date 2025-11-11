import React from 'react';
import { Search, Bell, Settings, User } from 'lucide-react';

const Header = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="bg-gradient-to-r from-amber-700 to-amber-800 text-white p-4 flex items-center justify-between shadow-lg">
      <div className="flex-1 max-w-md">
        <div className="relative">
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
            <div className="font-semibold">{user.hoTen || 'Your Name'}</div>
            <div className="text-xs text-amber-200">Nhân viên bán hàng</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
