import { useOutletContext, useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserMinus,
  RefreshCw,
  Lock,
  Building2,
  BadgeDollarSign,
} from "lucide-react";

const AdminOverview = () => {
  const {
    users = [],
    roles = [],
    departments = [],
    positions = [],
    reloadUsers,
    reloadReferences,
    referenceLoading,
  } = useOutletContext();
  const navigate = useNavigate();

  const activeCount = users.filter((user) => user.trangThai === "Active").length;
  const inactiveCount = users.filter((user) => user.trangThai === "Inactive").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#5a2e0f]">Tổng quan nhân sự</h2>
          <p className="text-gray-600">Quản lý quyền truy cập và thông tin tài khoản</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={reloadReferences}
            className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg flex items-center gap-2 hover:bg-amber-200 transition"
          >
            <RefreshCw size={16} />
            Tải danh mục
          </button>
          <button
            onClick={reloadUsers}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg flex items-center gap-2 hover:bg-amber-500 transition"
          >
            <RefreshCw size={16} />
            Làm mới nhân sự
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl shadow p-5 border border-amber-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100 text-amber-700">
              <Users size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tổng số tài khoản</p>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border border-emerald-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
              <UserCheck size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Đang hoạt động</p>
              <p className="text-3xl font-bold">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border border-rose-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-rose-100 text-rose-600">
              <UserMinus size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tạm khóa</p>
              <p className="text-3xl font-bold">{inactiveCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl shadow p-5 border border-amber-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100 text-amber-700">
              <Lock size={26} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Vai trò</p>
              <p className="text-2xl font-semibold">{roles.length}</p>
              <button
                onClick={() => navigate("/admin/roles")}
                className="text-sm text-amber-600 hover:underline"
              >
                Quản lý vai trò
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border border-amber-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100 text-amber-700">
              <Building2 size={26} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Phòng ban</p>
              <p className="text-2xl font-semibold">{departments.length}</p>
              <button
                onClick={() => navigate("/admin/departments")}
                className="text-sm text-amber-600 hover:underline"
              >
                Quản lý phòng ban
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 border border-amber-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100 text-amber-700">
              <BadgeDollarSign size={26} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Chức vụ</p>
              <p className="text-2xl font-semibold">{positions.length}</p>
              <button
                onClick={() => navigate("/admin/positions")}
                className="text-sm text-amber-600 hover:underline"
              >
                Quản lý chức vụ
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-amber-100 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-[#5a2e0f]">Thêm nhân sự mới</h3>
          <p className="text-gray-600">
            Cấp tài khoản truy cập hệ thống cho nhân sự nội bộ hoặc đối tác.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/users/create")}
          className="px-5 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-500 transition"
        >
          Tạo tài khoản
        </button>
      </div>
      {!referenceLoading ? null : (
        <div className="text-sm text-gray-500">
          Đang đồng bộ dữ liệu danh mục...
        </div>
      )}
    </div>
  );
};

export default AdminOverview;

