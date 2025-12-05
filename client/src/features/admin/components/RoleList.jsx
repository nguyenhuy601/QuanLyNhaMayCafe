import { useOutletContext, useNavigate } from "react-router-dom";
import { Edit2, Trash2, PlusCircle } from "lucide-react";

const RoleList = () => {
  const { roles = [], referenceLoading, handleDeleteRole } = useOutletContext();
  const navigate = useNavigate();

  const onDelete = async (id, name) => {
    if (!window.confirm(`Xóa vai trò ${name}?`)) return;
    await handleDeleteRole(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#5a2e0f]">Vai trò</h2>
          <p className="text-gray-600">Quản lý các roles hệ thống: admin, worker, director, qc, plan, orders, xuongtruong, totruong, ...</p>
        </div>
        <button
          onClick={() => navigate("/admin/roles/create")}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg flex items-center gap-2 hover:bg-amber-500 transition"
        >
          <PlusCircle size={18} />
          Thêm vai trò
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#8b4513] text-white text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Mã</th>
                <th className="px-4 py-3 text-left">Tên vai trò</th>
                <th className="px-4 py-3 text-left">Mô tả</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {referenceLoading ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    Chưa có vai trò nào
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role._id} className="border-b hover:bg-amber-50 transition">
                    <td className="px-4 py-3 font-semibold">{role.maRole}</td>
                    <td className="px-4 py-3">{role.tenRole}</td>
                    <td className="px-4 py-3">{role.moTa || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/roles/${role._id}`)}
                          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg flex items-center gap-1 hover:bg-blue-600 transition"
                        >
                          <Edit2 size={16} />
                          Sửa
                        </button>
                        <button
                          onClick={() => onDelete(role._id, role.tenRole)}
                          className="px-3 py-1.5 bg-rose-500 text-white text-sm rounded-lg flex items-center gap-1 hover:bg-rose-600 transition"
                        >
                          <Trash2 size={16} />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RoleList;

