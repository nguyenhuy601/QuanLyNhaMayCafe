// client/src/layouts/BanGiamDocLayout.jsx
import { Outlet } from "react-router-dom";
import DirectorSidebar from "../components/SidebarNav.jsx";
import DirectorTopbar from "../components/Topbar.jsx";

export default function BanGiamDocLayout() {
  return (
    <div className="grid [grid-template-columns:260px_1fr] h-screen bg-neutral-900 text-white">
      <aside className="bg-[#6d3a14] p-4">
        <DirectorSidebar />
      </aside>
      <main className="flex flex-col bg-white">
        <DirectorTopbar />
        <section className="p-5 h-full overflow-auto text-neutral-900">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
