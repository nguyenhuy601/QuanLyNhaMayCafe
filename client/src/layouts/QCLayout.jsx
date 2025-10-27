import { Outlet, NavLink } from "react-router-dom";
import { Bell, Settings, User, Home, ClipboardList } from "lucide-react";
import { useState } from "react";

const QCLayOut = () => {
  const [active, setActive] = useState("kiemDinh");

  return (
    <div className="flex h-screen bg-[#fffdfb] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#8b4513] text-white flex flex-col justify-between shadow-xl border-r border-[#a0522d] overflow-hidden">
        {/* Logo */}
        <div>
          <div className="px-6 py-5 text-xl font-extrabold tracking-wide text-center border-b border-[#a0522d]">
            ☕ Coffee Factory
          </div>

          {/* Navigation */}
          <nav className="mt-4 space-y-2 px-3 overflow-hidden">
            <NavLink
              to="/qc/dashboard"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-md font-semibold transition-all duration-200 transform
                 ${
                   isActive
                     ? "bg-[#a0522d] shadow-md scale-[1.02]"
                     : "hover:bg-[#c97a44]/90 hover:scale-[1.02] hover:shadow-sm"
                 }`
              }
            >
              <Home size={18} />
              <span>Trang chủ</span>
            </NavLink>

            <NavLink
              to="/qc/kiem-dinh"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-md font-semibold transition-all duration-200 transform
                 ${
                   isActive
                     ? "bg-[#c97a44] shadow-md scale-[1.02]"
                     : "hover:bg-[#c97a44]/90 hover:scale-[1.02] hover:shadow-sm"
                 }`
              }
            >
              <ClipboardList size={18} />
              <span>Kiểm định</span>
            </NavLink>

            <NavLink
              to="/qc/thong-tin"
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-md font-semibold transition-all duration-200 transform
                 ${
                   isActive
                     ? "bg-[#a0522d] shadow-md scale-[1.02]"
                     : "hover:bg-[#c97a44]/90 hover:scale-[1.02] hover:shadow-sm"
                 }`
              }
            >
              <User size={18} />
              <span>Thông tin cá nhân</span>
            </NavLink>
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#a0522d] text-center text-sm text-white rounded-t-lg shadow-inner">
          Trạng thái hệ thống 🟢
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-[#8b4513] text-white flex items-center justify-between px-6 py-3 shadow-md">
          {/* Left: App name + Search */}
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold tracking-wide">Coffee Company</span>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="px-3 py-1 rounded-md border border-[#a0522d] focus:outline-none focus:ring-2 focus:ring-[#a0522d] text-black"
            />
          </div>

          {/* Right: Icons + User */}
          <div className="flex items-center gap-5">
            <Bell className="cursor-pointer hover:text-yellow-300 transition" />
            <Settings className="cursor-pointer hover:text-yellow-300 transition" />
            <div className="flex items-center gap-2 cursor-pointer hover:bg-[#c97a44] px-3 py-1 rounded-lg transition-all">
              <User />
              <div className="text-right text-sm">
                <div className="font-semibold">Your Name</div>
                <div className="text-xs text-yellow-200">Nhân viên QC</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <section className="p-6 overflow-y-auto bg-[#fffdfb]">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default QCLayOut;
