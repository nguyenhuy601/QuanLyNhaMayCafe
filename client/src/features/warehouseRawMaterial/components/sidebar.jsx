import React from 'react';
import { Home, BarChart2, Archive, Truck, LogOut, FileText } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = ({ activeMenu, setActiveMenu, planCount = 0 }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSetActive = (key) => {
    if (typeof setActiveMenu === 'function') setActiveMenu(key);
  };

  return (
    <div className="w-52 bg-gradient-to-b from-amber-800 to-amber-900 text-white flex flex-col">
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
            <div className="text-xs text-amber-300">Kho NVL v1.0</div>
          </div>
        </div>
      </div>

      <nav className="p-2 flex-1">
        <div className="flex flex-col gap-2">
          <NavLink
            to="/warehouse-raw-material"
            end
            onClick={() => handleSetActive('home')}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                isActive || activeMenu === 'home' ? 'bg-amber-600' : 'hover:bg-amber-700'
              }`
            }
          >
            <Home size={16} />
            <span>Trang chủ</span>
          </NavLink>

          <NavLink
            to="/warehouse-raw-material/ke-hoach"
            onClick={() => handleSetActive('KeHoach')}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                isActive || activeMenu === 'KeHoach' ? 'bg-amber-600' : 'hover:bg-amber-700'
              }`
            }
          >
            <FileText size={16} />
            <span className="flex-1">Kế hoạch đã duyệt</span>
            {planCount > 0 && (
              <span className="ml-auto bg-amber-700 px-2 py-0.5 rounded text-xs">
                {planCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/warehouse-raw-material/thong-so-kho"
            onClick={() => handleSetActive('ThongSoKho')}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                isActive || activeMenu === 'ThongSoKho' ? 'bg-amber-600' : 'hover:bg-amber-700'
              }`
            }
          >
            <BarChart2 size={16} />
            <span className="flex-1">Thông số kho</span>
          </NavLink>

          <NavLink
            to="/warehouse-raw-material/thong-ke"
            onClick={() => handleSetActive('ThongKe')}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                isActive || activeMenu === 'ThongKe' ? 'bg-amber-600' : 'hover:bg-amber-700'
              }`
            }
          >
            <BarChart2 size={16} />
            <span className="flex-1">Thống kê</span>
          </NavLink>

          <NavLink
            to="/warehouse-raw-material/nhap-kho"
            onClick={() => handleSetActive('NhapKho')}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                isActive || activeMenu === 'NhapKho' ? 'bg-amber-600' : 'hover:bg-amber-700'
              }`
            }
          >
            <Archive size={16} />
            <span>Nhập kho NVL</span>
          </NavLink>

          <NavLink
            to="/warehouse-raw-material/xuat-kho"
            onClick={() => handleSetActive('XuatKho')}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                isActive || activeMenu === 'XuatKho' ? 'bg-amber-600' : 'hover:bg-amber-700'
              }`
            }
          >
            <Truck size={16} />
            <span>Xuất kho NVL</span>
          </NavLink>
        </div>
      </nav>

      <div className="p-2 border-t border-amber-700 mt-auto">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-amber-700 hover:bg-amber-600 transition-colors mb-2 text-sm">
          <span className="text-amber-300">●</span>
          <span>Trang thái hệ thống</span>
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-amber-700 transition-colors text-sm"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

