import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, List, Plus } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'bg-amber-600' : '';

  return (
    <div className="w-64 bg-gradient-to-b from-amber-800 to-amber-900 text-white h-screen fixed left-0 top-0">
      <div className="p-4">
        <h1 className="text-xl font-bold mb-1">Coffee Company</h1>
      </div>

      <div className="bg-amber-700 p-4 m-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
            <ShoppingCart size={20} />
          </div>
          <div>
            <div className="font-semibold">Coffee App</div>
            <div className="text-xs text-amber-200">Dashboard v1.0</div>
          </div>
        </div>
      </div>

      <nav className="mt-2 flex flex-col gap-1 px-2">
        <button
          onClick={() => navigate('/orders')}
          className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-amber-700 transition ${isActive('/orders')}`}
        >
          <Home size={20} />
          <span>Trang chủ</span>
        </button>

        <button
          onClick={() => navigate('/orders/create')}
          className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-amber-700 transition ${isActive('/orders/create')}`}
        >
          <Plus size={20} />
          <span>Tạo đơn hàng</span>
        </button>

        <button
          onClick={() => navigate('/orders/list')}
          className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-amber-700 transition ${isActive('/orders/list')}`}
        >
          <List size={20} />
          <span>Danh sách đơn hàng</span>
        </button>
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-amber-700 p-3 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm">Trạng thái hệ thống</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
