import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

const defaultForm = {
  maPhong: "",
  tenPhong: "",
  moTa: "",
};

const DepartmentForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { departments = [], handleCreateDepartment, handleUpdateDepartment } = useOutletContext();
  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentDept = useMemo(() => departments.find((dept) => dept._id === id), [
    departments,
    id,
  ]);

  useEffect(() => {
    if (isEdit && currentDept) {
      setFormData({
        maPhong: currentDept.maPhong || "",
        tenPhong: currentDept.tenPhong || "",
        moTa: currentDept.moTa || "",
      });
    } else if (!isEdit) {
      setFormData(defaultForm);
    }
  }, [isEdit, currentDept]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      if (isEdit) {
        await handleUpdateDepartment(id, formData);
      } else {
        await handleCreateDepartment(formData);
      }
      navigate("/admin/departments");
    } catch (err) {
      setError(err.message || "Không thể lưu phòng ban");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-amber-100">
      <div className="px-6 py-4 border-b border-amber-100 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-amber-400">
            {isEdit ? "Cập nhật" : "Khởi tạo"}
          </p>
          <h2 className="text-2xl font-semibold text-[#5a2e0f]">
            {isEdit ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
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
            <label className="text-sm text-gray-600">Tên phòng ban *</label>
            <input
              name="tenPhong"
              value={formData.tenPhong}
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600">Mô tả</label>
          <textarea
            name="moTa"
            value={formData.moTa}
            onChange={handleChange}
            rows={4}
            className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t">
          <button
            type="button"
            onClick={() => navigate("/admin/departments")}
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

export default DepartmentForm;

