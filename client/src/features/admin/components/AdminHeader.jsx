import { Bell, Settings, User } from "lucide-react";

const AdminHeader = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    <header className="bg-gradient-to-r from-amber-700 to-amber-800 text-white p-4 flex items-center justify-between shadow">
      <div>
        <p className="text-sm uppercase tracking-widest text-amber-200">Bảng điều khiển</p>
        <h1 className="text-2xl font-semibold">Trung tâm quản trị hệ thống</h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-full bg-amber-600 hover:bg-amber-500 transition-colors">
          <Bell size={18} />
        </button>
        <button className="p-2 rounded-full bg-amber-600 hover:bg-amber-500 transition-colors">
          <Settings size={18} />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-amber-500">
          <div className="w-11 h-11 rounded-full bg-amber-500 flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <p className="font-semibold">{user.hoTen || "System Admin"}</p>
            <p className="text-xs text-amber-200">Quản trị viên</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;

