// client/src/layouts/CongNhan.jsx
import { Outlet } from "react-router-dom";
import SidebarNav from "@/components/worker/SidebarNav.jsx";
import Topbar from "@/components/worker/Topbar.jsx";

export default function CongNhanLayout() {
  return (
    <div className="grid [grid-template-columns:260px_1fr] h-screen bg-neutral-900 text-white">
      <aside className="bg-[#6d3a14] p-4">
        <SidebarNav />
      </aside>
      <main className="flex flex-col bg-white">
        <Topbar />
        <section className="p-5 h-full overflow-auto text-neutral-900">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
