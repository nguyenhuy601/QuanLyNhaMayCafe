import { NavLink, useNavigate } from "react-router-dom";
import { Home, FileCheck, ClipboardCheck, BarChart, LogOut } from "lucide-react";

// Đã đổi icon emoji sang lucide-react cho nhất quán
const icons = {
  home: <Home size={18} />,
  plan: <FileCheck size={18} />,
  order: <ClipboardCheck size={18} />,
  report: <BarChart size={18} />,
};

// Thêm props để nhận số lượng (giống file mẫu)
// Đã BỎ systemStatusCount
export default function SidebarNav({ planCount = 0, orderCount = 0 }) {
  const navigate = useNavigate();

  // Lấy logic logout từ file mẫu
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Dữ liệu menu của bạn (dành cho Ban Giám Đốc)
  const items = [
    // SỬA LẠI: Thêm 'end: true' để NavLink chỉ active khi ĐÚNG trang chủ
    { to: "/director", icon: "home", label: "Trang chủ", end: true },
    { to: "/director/approve-plan", icon: "plan", label: "Phê duyệt kế hoạch", count: planCount },
    { to: "/director/approve-orders", icon: "order", label: "Phê duyệt đơn hàng", count: orderCount },
    { to: "/director/reports", icon: "report", label: "Xem báo cáo tổng hợp" },
  ];

  return (
    // Áp dụng style gradient và màu của file mẫu
    // SỬA LẠI: w-60 -> w-52 (giống hệt ảnh 1)
    <div className="w-65 bg-gradient-to-b from-amber-800 to-amber-900 text-white flex flex-col h-full">
      {/* --- Phần Header (Giống file mẫu) --- */}
      <div className="p-4 border-b border-amber-700">
        <h1 className="text-xl font-bold">Coffee Company</h1>
      </div>

      {/* --- Phần App Info (Giống file mẫu) --- */}
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

      {/* --- Phần Navigation --- */}
      <nav className="p-2 flex-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            // SỬA LẠI: Thêm prop 'end' vào NavLink
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
            {/* Hiển thị count (nếu có > 0) */}
            {it.count > 0 && (
              <span className="ml-auto bg-amber-700 px-2 py-0.5 rounded text-xs">
                {it.count}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* --- Phần Footer (Giống file mẫu) --- */}
      <div className="p-2 border-t border-amber-700">
        {/* SỬA LẠI: Thêm 'bg-transparent' để chắc chắn nút này trong suốt */}
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-transparent hover:bg-amber-700 transition-colors mb-2 text-left">
          <span className="text-emerald-400">●</span>
          <span>Trạng thái hệ thống</span>
        </button>
        {/* SỬA LẠI: Thêm 'bg-transparent' để chắc chắn nút này trong suốt */}
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

