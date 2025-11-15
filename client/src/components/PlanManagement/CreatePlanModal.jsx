import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createProductionPlan } from "../../services/planService";

const CreatePlanModal = ({ onClose, orders }) => {
  const [formData, setFormData] = useState({
    maDonHang: "",
    tenSanPham: "",
    soLuongNVL: "",
    soLuongCanSanXuat: "",
    ngayBatDauDuKien: "",
    ngayKetThucDuKien: "",
    xuongPhuTrach: "",
  });

  // ✅ Tự động tính số lượng khi nhận danh sách đơn hàng
  useEffect(() => {
    if (orders && orders.length > 0) {
      const firstOrder = orders[0];
      const totalThanhPham = orders.reduce(
        (sum, o) => sum + (o.chiTiet?.[0]?.soLuong || 0),
        0
      );
      const totalNVL = Math.round(totalThanhPham * 1.1);

      setFormData({
        maDonHang:
          orders.length === 1
            ? firstOrder.maDH
            : orders.map((o) => o.maDH).join(", "),
        tenSanPham:
          orders.length === 1
            ? firstOrder.chiTiet?.[0]?.sanPham?.tenSP || "No product info"
            : `Multiple orders (${orders.length})`,
        soLuongNVL: totalNVL,
        soLuongCanSanXuat: totalThanhPham,
        ngayBatDauDuKien: "",
        ngayKetThucDuKien: "",
        xuongPhuTrach: "",
      });
    }
  }, [orders]);

  // ✅ Gửi dữ liệu sang backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.ngayBatDauDuKien || !formData.ngayKetThucDuKien || !formData.xuongPhuTrach) {
      alert("⚠️ Vui lòng nhập đầy đủ thông tin kế hoạch!");
      return;
    }

    const payload = {
      maDH: formData.maDonHang,
      sanPham: orders?.[0]?.chiTiet?.[0]?.sanPham?._id || null,
      soLuongCanSanXuat: Number(formData.soLuongCanSanXuat),
      ngayBatDauDuKien: new Date(formData.ngayBatDauDuKien).toISOString(),
      ngayKetThucDuKien: new Date(formData.ngayKetThucDuKien).toISOString(),
      xuongPhuTrach: formData.xuongPhuTrach,
      nguoiTao: "671f234ac24c8f3a0a1d4a7f",
      ghiChu: "",
    };

    console.log("📦 Dữ liệu gửi backend:", payload);

    const result = await createProductionPlan(payload);

    if (result?.success) {
      alert("✅ Tạo kế hoạch sản xuất thành công!");
      onClose();
    } else {
      const msg = result?.message || "Không thể tạo kế hoạch sản xuất.";
      alert("❌ Lỗi khi tạo kế hoạch: " + msg);
      console.error("Create plan failed:", result);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-gradient-to-br from-amber-700 to-amber-800 rounded-2xl p-8 w-full max-w-4xl relative shadow-2xl">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-200 transition"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Phiếu kế hoạch sản xuất
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* --- Cột trái: Chỉ đọc --- */}
          <div className="space-y-4">
            {[
              ["Mã đơn hàng", "maDonHang"],
              ["Tên sản phẩm", "tenSanPham"],
              ["Số lượng nguyên vật liệu (ước tính)", "soLuongNVL"],
              ["Số lượng cần sản xuất", "soLuongCanSanXuat"],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="block text-white text-sm font-medium mb-2">
                  {label}:
                </label>
                <input
                  type="text"
                  value={formData[key]}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg bg-amber-600 text-white border-none focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* --- Cột phải: Nhập --- */}
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Ngày bắt đầu dự kiến:
              </label>
              <input
                type="date"
                value={formData.ngayBatDauDuKien}
                onChange={(e) =>
                  setFormData({ ...formData, ngayBatDauDuKien: e.target.value })
                }
                required
                className="w-full px-4 py-2 rounded-lg bg-amber-600 text-white focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Ngày kết thúc dự kiến:
              </label>
              <input
                type="date"
                value={formData.ngayKetThucDuKien}
                onChange={(e) =>
                  setFormData({ ...formData, ngayKetThucDuKien: e.target.value })
                }
                required
                className="w-full px-4 py-2 rounded-lg bg-amber-600 text-white focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Xưởng sản xuất phụ trách:
              </label>
              <select
                value={formData.xuongPhuTrach}
                onChange={(e) =>
                  setFormData({ ...formData, xuongPhuTrach: e.target.value })
                }
                required
                className="w-full px-4 py-2 rounded-lg bg-amber-600 text-white focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Chọn xưởng sản xuất...</option>
                <option value="Factory Arabica">Factory Arabica</option>
                <option value="Factory Robusta">Factory Robusta</option>
                <option value="Factory Civet">Factory Civet</option>
                <option value="Factory Instant">Factory Instant</option>
              </select>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 flex gap-3 justify-center pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-amber-900 hover:bg-amber-950 text-white rounded-lg font-medium transition"
            >
              Xác nhận
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlanModal;
