import { useOutletContext, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Edit2, Trash2, Users } from "lucide-react";

const UserList = () => {
  const {
    users = [],
    roles = [],
    departments = [],
    positions = [],
    loading,
    handleDeleteUser,
  } = useOutletContext();
  const navigate = useNavigate();
  const [selectedPosition, setSelectedPosition] = useState("all");

  const roleMap = useMemo(() => {
    const map = {};
    roles.forEach((role) => {
      if (role?._id) map[role._id] = role.tenRole || role.maRole;
    });
    return map;
  }, [roles]);

  const departmentMap = useMemo(() => {
    const map = {};
    departments.forEach((dept) => {
      if (dept?._id) map[dept._id] = dept.tenPhong || dept.maPhong;
    });
    return map;
  }, [departments]);

  const positionMap = useMemo(() => {
    const map = {};
    positions.forEach((pos) => {
      if (pos?._id) map[pos._id] = pos.tenChucVu || pos.maChucVu;
    });
    return map;
  }, [positions]);

  // Group users theo chức vụ
  const usersByPosition = useMemo(() => {
    const grouped = {
      all: [],
      noPosition: [],
    };
    
    // Khởi tạo group cho mỗi chức vụ
    positions.forEach((pos) => {
      if (pos?._id) {
        grouped[pos._id] = [];
      }
    });

    // Phân loại users
    users.forEach((user) => {
      if (!user.chucVu || (Array.isArray(user.chucVu) && user.chucVu.length === 0)) {
        grouped.noPosition.push(user);
      } else {
        const positionIds = Array.isArray(user.chucVu) ? user.chucVu : [user.chucVu];
        positionIds.forEach((positionId) => {
          if (grouped[positionId]) {
            grouped[positionId].push(user);
          }
        });
      }
      grouped.all.push(user);
    });

    return grouped;
  }, [users, positions]);

  // Lấy danh sách users theo chức vụ được chọn
  const filteredUsers = useMemo(() => {
    if (selectedPosition === "all") {
      return usersByPosition.all;
    } else if (selectedPosition === "noPosition") {
      return usersByPosition.noPosition;
    } else {
      return usersByPosition[selectedPosition] || [];
    }
  }, [selectedPosition, usersByPosition]);

  const renderNames = (value, lookup) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return "-";
    const arr = Array.isArray(value) ? value : [value];
    const names = arr
      .map((id) => lookup[id] || id)
      .filter(Boolean);
    return names.length ? names.join(", ") : "-";
  };

  const onDelete = async (id, name) => {
    if (!window.confirm(`Xóa tài khoản ${name}?`)) return;
    try {
      await handleDeleteUser(id);
    } catch (error) {
      alert(error.message || "Không thể xóa người dùng");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#5a2e0f]">Danh sách nhân sự</h2>
          <p className="text-gray-600">Theo dõi và quản lý quyền truy cập hệ thống</p>
        </div>
        <button
          onClick={() => navigate("/admin/users/create")}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition"
        >
          + Thêm nhân sự
        </button>
      </div>

      {/* Tabs theo chức vụ */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="border-b border-amber-200">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setSelectedPosition("all")}
              className={`px-6 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition ${
                selectedPosition === "all"
                  ? "border-amber-600 text-amber-700 bg-amber-50"
                  : "border-transparent text-gray-600 hover:text-amber-600 hover:bg-amber-50/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>Tất cả ({usersByPosition.all.length})</span>
              </div>
            </button>
            {positions.map((pos) => {
              const count = usersByPosition[pos._id]?.length || 0;
              if (count === 0) return null;
              return (
                <button
                  key={pos._id}
                  onClick={() => setSelectedPosition(pos._id)}
                  className={`px-6 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition ${
                    selectedPosition === pos._id
                      ? "border-amber-600 text-amber-700 bg-amber-50"
                      : "border-transparent text-gray-600 hover:text-amber-600 hover:bg-amber-50/50"
                  }`}
                >
                  {pos.tenChucVu || pos.maChucVu} ({count})
                </button>
              );
            })}
            {usersByPosition.noPosition.length > 0 && (
              <button
                onClick={() => setSelectedPosition("noPosition")}
                className={`px-6 py-3 font-semibold text-sm whitespace-nowrap border-b-2 transition ${
                  selectedPosition === "noPosition"
                    ? "border-amber-600 text-amber-700 bg-amber-50"
                    : "border-transparent text-gray-600 hover:text-amber-600 hover:bg-amber-50/50"
                }`}
              >
                Chưa phân chức vụ ({usersByPosition.noPosition.length})
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#8b4513] text-white text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Họ tên</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">SĐT</th>
                <th className="px-4 py-3 text-left">Phòng ban</th>
                <th className="px-4 py-3 text-left">Chức vụ</th>
                <th className="px-4 py-3 text-left">Vai trò</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500">
                    {selectedPosition === "all" 
                      ? "Chưa có tài khoản nào"
                      : selectedPosition === "noPosition"
                      ? "Không có nhân sự chưa phân chức vụ"
                      : "Không có nhân sự với chức vụ này"}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b hover:bg-amber-50 transition">
                    <td className="px-4 py-3">{user.hoTen}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.sdt || user.soDienThoai || "-"}</td>
                    <td className="px-4 py-3">{renderNames(user.phongBan, departmentMap)}</td>
                    <td className="px-4 py-3">{renderNames(user.chucVu, positionMap)}</td>
                    <td className="px-4 py-3">{renderNames(user.role, roleMap)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          user.trangThai === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-600"
                        }`}
                      >
                        {user.trangThai}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/users/${user._id}`)}
                          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg flex items-center gap-1 hover:bg-blue-600 transition"
                        >
                          <Edit2 size={16} />
                          Sửa
                        </button>
                        <button
                          onClick={() => onDelete(user._id, user.hoTen)}
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

export default UserList;

