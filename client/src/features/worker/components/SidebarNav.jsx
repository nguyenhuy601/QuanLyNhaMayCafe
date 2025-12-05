import { NavLink, useNavigate } from "react-router-dom";
import { Home, Calendar, DollarSign, LogOut } from "lucide-react";

const icons = {
  home: <Home size={18} />,
  shift: <Calendar size={18} />,
  salary: <DollarSign size={18} />,
};

export default function SidebarNav() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const items = [
    { to: "/worker", icon: "home", label: "Trang chủ", end: true },
    { to: "/worker/shifts", icon: "shift", label: "Xem ca làm" },
    { to: "/worker/salary", icon: "salary", label: "Xem lương" },
  ];

  return (
    // GIỮ NGUYÊN STYLE MÀU NÂU GRADIENT
    <div className="w-full bg-gradient-to-b from-amber-800 to-amber-900 text-white flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-amber-700">
        <h1 className="text-xl font-bold">Coffee Company</h1>
      </div>

      {/* App Info - ĐÃ SỬA GIỐNG HỆT DIRECTOR 100% */}
      <div className="p-4 border-b border-amber-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded flex items-center justify-center">
            {/* Đổi icon bánh răng thành ly cà phê */}
            <span className="text-lg">☕</span>
          </div>
          <div>
            {/* Đổi Worker App -> Coffee App */}
            <div className="font-semibold">Coffee App</div>
            {/* Đổi Phân hệ SX -> Dashboard v1.0 */}
            <div className="text-xs text-amber-300">Dashboard v1.0</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-2 flex-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end || false}
            className={({ isActive }) =>
              [
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1",
                isActive ? "bg-amber-600" : "hover:bg-amber-700"
              ].join(" ")
            }
          >
            {icons[it.icon]}
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer - ĐÃ THÊM NÚT TRẠNG THÁI HỆ THỐNG */}
      <div className="p-2 border-t border-amber-700">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-transparent hover:bg-amber-700 transition-colors mb-2 text-left">
          <span className="text-emerald-400">●</span>
          <span>Trạng thái hệ thống</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-transparent hover:bg-amber-700 transition-colors text-left"
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}