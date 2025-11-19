import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import AdminHeader from "../components/AdminHeader.jsx";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar />
      <div className="ml-64 flex-1 flex flex-col">
        <AdminHeader />
        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

