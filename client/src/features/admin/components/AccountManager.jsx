import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";
import authAPI from "../../../api/authAPI";

const AccountManager = () => {
  const { roles: roleEntities = [] } = useOutletContext();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "worker",
    isActive: true,
  });

  // Lấy danh sách role từ dữ liệu (tenRole), sắp xếp theo bảng chữ cái
  const roleOptions = Array.from(
    new Set(
      (roleEntities || [])
        .map((r) => r.tenRole)
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, "vi", { sensitivity: "base" }));

  useEffect(() => {
    loadAccounts(roleFilter === "all" ? null : roleFilter);
  }, [roleFilter]);

  const loadAccounts = async (role = null) => {
    try {
      setLoading(true);
      setError("");
      const data = await authAPI.getAccounts(role || undefined);
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (account = null) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        email: account.email || "",
        password: "", // Không hiển thị password
        role: account.role || "worker",
        isActive: account.isActive !== undefined ? account.isActive : true,
      });
    } else {
      setEditingAccount(null);
      setFormData({
        email: "",
        password: "",
        role: "worker",
        isActive: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAccount(null);
    setFormData({
      email: "",
      password: "",
      role: "worker",
      isActive: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAccount) {
        // Update
        const updateData = {
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        };
        // Chỉ cập nhật password nếu có nhập
        if (formData.password) {
          updateData.password = formData.password;
        }
        await authAPI.updateAccount(editingAccount._id, updateData);
        alert("Cập nhật tài khoản thành công");
      } else {
        // Create
        if (!formData.password) {
          alert("Vui lòng nhập mật khẩu");
          return;
        }
        await authAPI.createAccount(formData);
        alert("Tạo tài khoản thành công");
      }
      handleCloseModal();
      loadAccounts();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (account) => {
    if (account.role === "admin") {
      alert("Không thể xóa tài khoản admin");
      return;
    }
    if (!window.confirm(`Bạn có chắc muốn xóa tài khoản ${account.email}?`)) {
      return;
    }
    try {
      await authAPI.deleteAccount(account._id);
      alert("Đã xóa tài khoản thành công");
      loadAccounts();
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Không thể xóa tài khoản");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#5a2e0f]">Quản lý Tài khoản</h2>
          <p className="text-gray-600">Tạo, sửa, xóa tài khoản hệ thống</p>
        </div>
        <div className="flex gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Lọc theo role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">Tất cả</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => loadAccounts(roleFilter === "all" ? null : roleFilter)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Làm mới
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition flex items-center gap-2"
          >
            <Plus size={18} />
            Thêm tài khoản
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#8b4513] text-white text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Sản phẩm phụ trách</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    Chưa có tài khoản nào
                  </td>
                </tr>
              ) : (
                accounts.map((account) => (
                  <tr key={account._id} className="border-b hover:bg-amber-50 transition">
                    <td className="px-4 py-3 font-semibold">{account.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        {account.role || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          account.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-600"
                        }`}
                      >
                        {account.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {account.sanPhamPhuTrach && account.sanPhamPhuTrach.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {account.sanPhamPhuTrach.slice(0, 2).map((sp, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                            >
                              {sp.tenSP || sp.maSP || "SP"}
                            </span>
                          ))}
                          {account.sanPhamPhuTrach.length > 2 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              +{account.sanPhamPhuTrach.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(account)}
                          className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg flex items-center gap-1 hover:bg-blue-600 transition"
                        >
                          <Edit2 size={16} />
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(account)}
                          disabled={account.role === "admin"}
                          className={`px-3 py-1.5 text-white text-sm rounded-lg flex items-center gap-1 transition ${
                            account.role === "admin"
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-rose-500 hover:bg-rose-600"
                          }`}
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

      {/* Modal Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#5a2e0f]">
                  {editingAccount ? "Sửa tài khoản" : "Thêm tài khoản mới"}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu {editingAccount ? "(để trống nếu không đổi)" : "*"}
                </label>
                <input
                  type="password"
                  required={!editingAccount}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Tài khoản hoạt động</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 flex items-center gap-2"
                >
                  <Save size={16} />
                  {editingAccount ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManager;

