import React from 'react';
import { Home, FileText, ClipboardList, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeMenu, setActiveMenu, orderCount, approvedCount }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-gradient-to-b from-amber-800 to-amber-900 text-white flex flex-col">
      <div className="p-4 border-b border-amber-700">
        <h1 className="text-xl font-bold">Coffee Company</h1>
      </div>
      
      <div className="p-4 border-b border-amber-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded flex items-center justify-center">
            <span className="text-lg">☕</span>
          </div>
          <div>
            <div className="font-semibold">Coffee App</div>
            <div className="text-xs text-amber-300">Dashboard v1.0</div>
          </div>
        </div>
      </div>

      <nav className="p-2 flex-1">
        <button 
          onClick={() => setActiveMenu('home')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1 ${
            activeMenu === 'home' ? 'bg-amber-600' : 'hover:bg-amber-700'
          }`}
        >
          <Home size={18} />
          <span>Trang chủ</span>
        </button>
        
        <button 
          onClick={() => setActiveMenu('production')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1 ${
            activeMenu === 'production' ? 'bg-amber-600' : 'hover:bg-amber-700'
          }`}
        >
          <FileText size={18} />
          <span>Kế hoạch sản xuất</span>
          <span className="ml-auto bg-amber-700 px-2 py-0.5 rounded text-xs">
            {orderCount}
          </span>
        </button>
        
        <button 
          onClick={() => setActiveMenu('list')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
            activeMenu === 'list' ? 'bg-amber-600' : 'hover:bg-amber-700'
          }`}
        >
          <ClipboardList size={18} />
          <span>Danh sách kế hoạch</span>
          <span className="ml-auto bg-amber-700 px-2 py-0.5 rounded text-xs">
            {approvedCount}
          </span>
        </button>
      </nav>

      <div className="p-2 border-t border-amber-700">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-amber-700 hover:bg-amber-600 transition-colors mb-2">
          <span className="text-amber-300">●</span>
          <span>Trang thái hệ thống</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-700 transition-colors"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;