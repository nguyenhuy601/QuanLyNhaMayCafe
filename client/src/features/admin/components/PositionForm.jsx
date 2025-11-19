import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";

const defaultForm = {
  maChucVu: "",
  tenChucVu: "",
  moTa: "",
  bacLuongToiThieu: "",
  bacLuongToiDa: "",
};

const PositionForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { positions = [], handleCreatePosition, handleUpdatePosition } = useOutletContext();
  const [formData, setFormData] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentPosition = useMemo(
    () => positions.find((pos) => pos._id === id),
    [positions, id]
  );

  useEffect(() => {
    if (isEdit && currentPosition) {
      setFormData({
        maChucVu: currentPosition.maChucVu || "",
        tenChucVu: currentPosition.tenChucVu || "",
        moTa: currentPosition.moTa || "",
        bacLuongToiThieu:
          currentPosition.bacLuongToiThieu != null ? currentPosition.bacLuongToiThieu : "",
        bacLuongToiDa:
          currentPosition.bacLuongToiDa != null ? currentPosition.bacLuongToiDa : "",
      });
    } else if (!isEdit) {
      setFormData(defaultForm);
    }
  }, [isEdit, currentPosition]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...formData,
        bacLuongToiThieu: formData.bacLuongToiThieu
          ? Number(formData.bacLuongToiThieu)
          : undefined,
        bacLuongToiDa: formData.bacLuongToiDa ? Number(formData.bacLuongToiDa) : undefined,
      };
      if (isEdit) {
        await handleUpdatePosition(id, payload);
      } else {
        await handleCreatePosition(payload);
      }
      navigate("/admin/positions");
    } catch (err) {
      setError(err.message || "Không thể lưu chức vụ");
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
            {isEdit ? "Chỉnh sửa chức vụ" : "Thêm chức vụ mới"}
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
            <label className="text-sm text-gray-600">Mã chức vụ *</label>
            <input
              name="maChucVu"
              value={formData.maChucVu}
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Tên chức vụ *</label>
            <input
              name="tenChucVu"
              value={formData.tenChucVu}
              onChange={handleChange}
              required
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600">Lương tối thiểu</label>
            <input
              type="number"
              name="bacLuongToiThieu"
              value={formData.bacLuongToiThieu}
              onChange={handleChange}
              min="0"
              step="100000"
              className="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Lương tối đa</label>
            <input
              type="number"
              name="bacLuongToiDa"
              value={formData.bacLuongToiDa}
              onChange={handleChange}
              min="0"
              step="100000"
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
            onClick={() => navigate("/admin/positions")}
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

export default PositionForm;

