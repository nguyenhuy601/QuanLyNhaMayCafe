import { Outlet } from "react-router-dom";
import SidebarNav from "../components/SidebarNav";
import Topbar from "../components/Topbar";

export default function CongNhanLayout() {
  return (
    // Grid Layout chuẩn: Sidebar 260px - Content phần còn lại
    <div className="grid [grid-template-columns:260px_1fr] h-screen bg-neutral-900 text-white">
      
      {/* Cột trái: Sidebar */}
      <aside className="border-r border-amber-900">
        <SidebarNav />
      </aside>

      {/* Cột phải: Topbar + Nội dung */}
      <main className="flex flex-col bg-gray-50 text-neutral-900">
        <Topbar />
        
        {/* Khu vực hiển thị nội dung các trang con (Home, Salary...) */}
        <section className="p-6 h-full overflow-auto">
          <Outlet />
        </section>
      </main>
    </div>
  );
}