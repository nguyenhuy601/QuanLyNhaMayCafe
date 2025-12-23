import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import authAPI from "../../../api/authAPI";

const defaultForm = {
  hoTen: "",
  email: "",
  sdt: "",
  gioiTinh: "Nam",
  ngaySinh: "",
  diaChi: "",
  ngayVaoLam: "",
  chucVu: [],
  phongBan: [],
  role: [],
  luongCoBan: "",
  trangThai: "Active",
};

const statuses = ["Active", "Inactive", "OnLeave"];
const genders = ["Nam", "Nữ", "Khác"];

const UserForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const {
    users = [],
    roles = [],
    departments = [],
    positions = [],
    referenceLoading,
    handleCreateUser,
    handleUpdateUser,
    reloadUsers,
    reloadReferences,
  } = useOutletContext();
  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [createAccount, setCreateAccount] = useState(true); // Checkbox tạo tài khoản
  const [accountPassword, setAccountPassword] = useState(""); // Mật khẩu cho tài khoản

  const currentUser = useMemo(() => users.find((user) => user._id === id), [users, id]);

  useEffect(() => {
    if (isEdit) {
      if (currentUser) {
        setFormData({
          hoTen: currentUser.hoTen || "",
          email: currentUser.email || "",
          sdt: currentUser.sdt || currentUser.soDienThoai || "",
          gioiTinh: currentUser.gioiTinh || "Nam",
          ngaySinh: currentUser.ngaySinh ? currentUser.ngaySinh.slice(0, 10) : "",
          diaChi: currentUser.diaChi || "",
          ngayVaoLam: currentUser.ngayVaoLam ? currentUser.ngayVaoLam.slice(0, 10) : "",
          chucVu: Array.isArray(currentUser.chucVu)
            ? currentUser.chucVu
            : currentUser.chucVu
            ? [currentUser.chucVu]
            : [],
          phongBan: Array.isArray(currentUser.phongBan)
            ? currentUser.phongBan
            : currentUser.phongBan
            ? [currentUser.phongBan]
            : [],
          role: Array.isArray(currentUser.role)
            ? currentUser.role
            : currentUser.role
            ? [currentUser.role]
            : [],
          luongCoBan: currentUser.luongCoBan ?? "",
          trangThai: currentUser.trangThai || "Active",
        });
      } else {
        reloadUsers();
      }
    } else {
      setFormData(defaultForm);
    }
  }, [isEdit, currentUser, reloadUsers]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiChange = (name, values) => {
    setFormData((prev) => ({ ...prev, [name]: values }));
  };

  const handleSelectMultiple = (e) => {
    const { name, selectedOptions } = e.target;
    const values = Array.from(selectedOptions).map((option) => option.value);
    handleMultiChange(name, values);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        ...formData,
        luongCoBan: formData.luongCoBan ? Number(formData.luongCoBan) : undefined,
      };
      
      if (isEdit) {
        const oldUser = currentUser;
        await handleUpdateUser(id, payload);
        
        // Đồng bộ với Account (tài khoản) nếu email hoặc role thay đổi
        try {
          const accounts = await authAPI.getAccounts();
          const account = accounts.find((a) => 
            a.email && a.email.toLowerCase() === (oldUser?.email || "").toLowerCase()
          );
          
          if (account) {
            // Tìm role name từ role ID đầu tiên
            const userRoleIds = Array.isArray(formData.role) ? formData.role : (formData.role ? [formData.role] : []);
            const firstRoleId = userRoleIds[0];
            const selectedRole = roles.find((r) => r._id === firstRoleId);
            const roleName = selectedRole?.tenRole || selectedRole?.maRole || account.role;
            
            const syncData = {};
            if (formData.email !== oldUser?.email) {
              syncData.email = formData.email;
            }
            if (roleName && roleName !== account.role) {
              syncData.role = roleName;
            }
            
            if (Object.keys(syncData).length > 0) {
              await authAPI.updateAccount(account._id, syncData);
            }
          }
        } catch (syncErr) {
          console.warn("Không thể đồng bộ với tài khoản:", syncErr.message);
          // Không block việc cập nhật user nếu đồng bộ lỗi
        }
        // Trigger event để AccountManager reload
        window.dispatchEvent(new CustomEvent("admin:user-updated"));
      } else {
        // Tạo user
        await handleCreateUser(payload);
        
        // Tự động tạo tài khoản nếu checkbox được chọn
        if (createAccount && formData.email && formData.role && formData.role.length > 0) {
          try {
            // Lấy role đầu tiên từ danh sách roles của user
            const userRoleIds = Array.isArray(formData.role) ? formData.role : [formData.role];
            const firstRoleId = userRoleIds[0];
            const selectedRole = roles.find((r) => r._id === firstRoleId);
            const roleName = selectedRole?.tenRole || selectedRole?.maRole || "worker";
            
            // Tạo mật khẩu mặc định nếu không nhập
            const password = accountPassword || "123456"; // Mật khẩu mặc định
            
            await authAPI.createAccount({
              email: formData.email,
              password: password,
              role: roleName,
              isActive: true,
            });
          } catch (accountErr) {
            // Nếu tạo account lỗi (ví dụ email đã tồn tại), chỉ cảnh báo, không block việc tạo user
            // Silent fail - có thể hiển thị warning nhưng vẫn tiếp tục
          }
        }
        // Trigger event để AccountManager reload
        window.dispatchEvent(new CustomEvent("admin:user-updated"));
      }
      navigate("/admin/users");
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-amber-100">
      <div className="px-6 py-4 border-b border-amber-100 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-amber-400">
            {isEdit ? "Cập nhật" : "Khởi tạo"}
          </p>
          <h2 className="text-2xl font-semibold text-[#5a2e0f]">
            {isEdit ? "Chỉnh sửa thông tin nhân sự" : "Thêm nhân sự mới"}
          </h2>
        </div>
        <button onClick={() => navigate(-1)} className="text-amber-600 hover:underline">
          ← Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Họ tên *</label>
            <input
              name="hoTen"
              value={formData.hoTen}
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email *</label>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Số điện thoại</label>
            <input
              name="sdt"
              value={formData.sdt}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Giới tính</label>
            <select
              name="gioiTinh"
              value={formData.gioiTinh}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              {genders.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Ngày sinh</label>
            <input
              type="date"
              name="ngaySinh"
              value={formData.ngaySinh}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Địa chỉ</label>
            <input
              name="diaChi"
              value={formData.diaChi}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Ngày vào làm</label>
            <input
              type="date"
              name="ngayVaoLam"
              value={formData.ngayVaoLam}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Lương cơ bản</label>
            <input
              type="number"
              name="luongCoBan"
              value={formData.luongCoBan}
              onChange={handleChange}
              min="0"
              step="100000"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Trạng thái *</label>
            <select
              name="trangThai"
              value={formData.trangThai}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Phần tạo tài khoản - chỉ hiển thị khi tạo mới */}
        {!isEdit && (
          <div className="pt-4 border-t space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="createAccount"
                checked={createAccount}
                onChange={(e) => setCreateAccount(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <label htmlFor="createAccount" className="text-sm font-medium text-gray-700">
                Tự động tạo tài khoản đăng nhập
              </label>
            </div>
            {createAccount && (
              <div>
                <label className="text-sm text-gray-600">
                  Mật khẩu tài khoản {formData.role && formData.role.length > 0 ? "" : "(Chọn vai trò trước)"}
                </label>
                <input
                  type="password"
                  value={accountPassword}
                  onChange={(e) => setAccountPassword(e.target.value)}
                  placeholder={formData.role && formData.role.length > 0 ? "Để trống sẽ dùng mật khẩu mặc định: 123456" : "Chọn vai trò trước"}
                  disabled={!formData.role || formData.role.length === 0}
                  className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nếu để trống, mật khẩu mặc định là: <strong>123456</strong>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
          <div>
            <label className="text-sm text-gray-600">Vai trò</label>
            <select
              name="role"
              multiple
              value={formData.role}
              onChange={handleSelectMultiple}
              className="w-full mt-1 px-3 py-2 border rounded-lg h-32 focus:ring-2 focus:ring-amber-500"
            >
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.tenRole || role.maRole}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Giữ Ctrl (Windows) hoặc Cmd (Mac) để chọn nhiều dòng.
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-600">Phòng ban</label>
            <select
              name="phongBan"
              multiple
              value={formData.phongBan}
              onChange={handleSelectMultiple}
              className="w-full mt-1 px-3 py-2 border rounded-lg h-32 focus:ring-2 focus:ring-amber-500"
            >
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.tenPhong || dept.maPhong}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Chức vụ</label>
            <select
              name="chucVu"
              multiple
              value={formData.chucVu}
              onChange={handleSelectMultiple}
              className="w-full mt-1 px-3 py-2 border rounded-lg h-32 focus:ring-2 focus:ring-amber-500"
            >
              {positions.map((pos) => (
                <option key={pos._id} value={pos._id}>
                  {pos.tenChucVu || pos.maChucVu}
                </option>
              ))}
            </select>
          </div>
        </div>

        {referenceLoading && (
          <div className="text-sm text-gray-500">
            Đang tải danh sách vai trò/phòng ban/chức vụ...{" "}
            <button
              type="button"
              onClick={reloadReferences}
              className="text-amber-600 underline"
            >
              Thử lại
            </button>
          </div>
        )}

        <div className="pt-4 flex justify-end gap-3 border-t">
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-500 transition disabled:opacity-60"
          >
            {submitting ? "Đang lưu..." : isEdit ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;

