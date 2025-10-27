import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Settings, User, LogOut } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-700 to-amber-800 text-white p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-300" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full bg-amber-600 bg-opacity-50 border border-amber-500 rounded-lg pl-10 pr-4 py-2 text-white placeholder-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 ml-4">
          <button className="p-2 hover:bg-amber-600 rounded-lg transition">
            <Bell size={20} />
          </button>
          <button className="p-2 hover:bg-amber-600 rounded-lg transition">
            <Settings size={20} />
          </button>
          <div className="flex items-center gap-3 bg-amber-600 px-4 py-2 rounded-lg">
            <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
              <User size={18} />
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold">{user.name || 'User'}</div>
              <div className="text-xs text-amber-200">Nhân viên bán hàng</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 hover:bg-amber-600 rounded-lg transition"
            title="Đăng xuất"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;