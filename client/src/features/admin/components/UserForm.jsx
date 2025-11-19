import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

const defaultForm = {
  maNV: "",
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

  const currentUser = useMemo(() => users.find((user) => user._id === id), [users, id]);

  useEffect(() => {
    if (isEdit) {
      if (currentUser) {
        setFormData({
          maNV: currentUser.maNV || "",
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
        await handleUpdateUser(id, payload);
      } else {
        await handleCreateUser(payload);
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
            <label className="text-sm text-gray-600">Mã nhân viên *</label>
            <input
              name="maNV"
              value={formData.maNV}
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="VD: NV001"
            />
          </div>
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

