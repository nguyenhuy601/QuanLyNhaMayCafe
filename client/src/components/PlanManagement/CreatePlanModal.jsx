import React, { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";

const CreatePlanModal = ({ onClose, orders }) => {
  const [formData, setFormData] = useState({
    maDonHang: "",
    tenSanPham: "",
    soLuongNVL: "",
    soLuongThanhPham: "",
    ngayBatDau: "",
    ngayKetThuc: "",
    xuongSanXuat: "",
  });

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
            ? firstOrder.chiTiet?.[0]?.sanPham?.tenSP || "Không có sản phẩm"
            : `Nhiều đơn hàng (${orders.length})`,
        soLuongThanhPham: totalThanhPham,
        soLuongNVL: totalNVL,
        ngayBatDau: "",
        ngayKetThuc: "",
        xuongSanXuat: "",
      });
    }
  }, [orders]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("✅ Kế hoạch mới:", formData);
    alert("Tạo kế hoạch thành công!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-gradient-to-br from-amber-700 to-amber-800 rounded-2xl p-8 w-full max-w-4xl relative shadow-2xl">
        {/* ❌ Nút đóng */}
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
          {/* Cột trái */}
          <div className="space-y-4">
            {[
              ["Mã đơn hàng", "maDonHang"],
              ["Tên sản phẩm", "tenSanPham"],
              ["Số lượng NVL", "soLuongNVL"],
              ["Số lượng thành phẩm", "soLuongThanhPham"],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="block text-white text-sm font-medium mb-2">{label}:</label>
                <input
                  type="text"
                  value={formData[key]}
                  readOnly
                  className="w-full px-4 py-2 rounded-lg bg-amber-600 text-white border-none focus:outline-none"
                />
              </div>
            ))}
          </div>

          {/* Cột phải */}
          <div className="space-y-4">
            {/* Ngày bắt đầu */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Ngày bắt đầu:</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.ngayBatDau}
                  onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-amber-600 text-white focus:ring-2 focus:ring-amber-400"
                />
                
              </div>
            </div>

            {/* Ngày kết thúc */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Ngày kết thúc:</label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.ngayKetThuc}
                  onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
                  required
                  className="w-full px-4 py-2 rounded-lg bg-amber-600 text-white focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Xưởng sản xuất */}
            <div>
              <label className="block text-white text-sm font-medium mb-2">Xưởng sản xuất:</label>
              <select
                value={formData.xuongSanXuat}
                onChange={(e) => setFormData({ ...formData, xuongSanXuat: e.target.value })}
                required
                className="w-full px-4 py-2 rounded-lg bg-amber-600 text-white focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Chọn xưởng sản xuất...</option>
                <option value="Xưởng arabica">Xưởng arabica</option>
                <option value="Xưởng robusta">Xưởng robusta</option>
                <option value="Xưởng chồn">Xưởng chồn</option>
                <option value="Xưởng hòa tan">Xưởng hòa tan</option>
              </select>
            </div>
          </div>

          {/* Hàng nút bấm (ngang, full width) */}
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
