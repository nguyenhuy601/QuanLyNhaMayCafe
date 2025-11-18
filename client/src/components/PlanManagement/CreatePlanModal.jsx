import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createProductionPlan } from "../../services/planService";
import { fetchMaterials } from "../../services/productService";

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

  const [materials, setMaterials] = useState([]);

  // RADIO STATE CHO 3 NHÓM
  const [selectedBean, setSelectedBean] = useState(null);
  const [selectedBag, setSelectedBag] = useState(null);
  const [selectedLabel, setSelectedLabel] = useState(null);

  // ----------------------------------------
  // 1) Load NVL từ backend
  // ----------------------------------------
  useEffect(() => {
    async function load() {
      const list = await fetchMaterials();
      setMaterials(list || []);
    }
    load();
  }, []);

  // ----------------------------------------
  // 2) Tự fill dữ liệu đơn hàng
  // ----------------------------------------
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
            ? firstOrder.chiTiet?.[0]?.sanPham?.tenSP || "Không có"
            : `Nhiều đơn (${orders.length})`,
        soLuongNVL: totalNVL,
        soLuongCanSanXuat: totalThanhPham,
        ngayBatDauDuKien: "",
        ngayKetThucDuKien: "",
        xuongPhuTrach: "",
      });
    }
  }, [orders]);

  // ----------------------------------------
  // 3) Submit
  // ----------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.xuongPhuTrach) {
      alert("⚠️ Vui lòng chọn xưởng sản xuất!");
      return;
    }

    // Decode token
    const token = localStorage.getItem("token");
    let currentUserId = null;

    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      currentUserId = decoded.id || decoded._id;
    } catch (err) {
      console.warn("Không decode được token.");
    }

    // Build NVL list từ radio
    const nvlCanThiet = [];

    const pushNVL = (id) => {
      if (!id) return;
      const item = materials.find((m) => m._id === id);
      if (!item) return;

      nvlCanThiet.push({
        productId: item._id,
        tenNVL: item.tenSP,
        maSP: item.maSP,
        soLuong: 1,
        loai: "nguyenvatlieu",
      });
    };

    pushNVL(selectedBean);
    pushNVL(selectedBag);
    pushNVL(selectedLabel);

    const payload = {
      donHangLienQuan: orders.map((o) => ({
        orderId: o._id,
        maDonHang: o.maDH,
        tenKhachHang: o.khachHang?.tenKH || "",
        tongTien: o.tongTien || 0,
      })),

      sanPham: {
        productId: orders[0].chiTiet[0].sanPham._id,
        tenSanPham: orders[0].chiTiet[0].sanPham.tenSP,
        maSP: orders[0].chiTiet[0].sanPham.maSP,
        loai: orders[0].chiTiet[0].sanPham.loai,
      },

      soLuongCanSanXuat: Number(formData.soLuongCanSanXuat),
      soLuongNVLUocTinh: Number(formData.soLuongNVL),
      ngayBatDauDuKien: new Date(formData.ngayBatDauDuKien),
      ngayKetThucDuKien: new Date(formData.ngayKetThucDuKien),

      xuongPhuTrach: formData.xuongPhuTrach,
      nguoiLap: currentUserId,

      nvlCanThiet,
      ghiChu: "",
    };

    const result = await createProductionPlan(payload);

    if (result.success) {
      alert("✅ Tạo kế hoạch thành công!");
      onClose();
    } else {
      alert("❌ Lỗi tạo kế hoạch: " + result.message);
    }
  };

  // ----------------------------------------
  // 4) Nhóm NVL theo mã sản phẩm
  // ----------------------------------------
  const nvlHat = materials.filter((m) => m.maSP.includes("BEAN"));
  const nvlTui = materials.filter(
    (m) =>
      m.maSP.includes("BAG") ||
      m.maSP.includes("SACHET") ||
      m.maSP.includes("BOX")
  );
  const nvlTem = materials.filter((m) => m.maSP.includes("LABEL"));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
  <div className="bg-gradient-to-br from-amber-700 to-amber-800 rounded-2xl w-full max-w-5xl relative shadow-2xl 
      max-h-[90vh] flex flex-col overflow-hidden">

    {/* Nút đóng */}
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-white hover:text-gray-200 z-20"
    >
      <X size={24} />
    </button>

    {/* Header cố định */}
    <div className="p-6 pb-3 border-b border-amber-600">
      <h2 className="text-2xl font-bold text-white text-center">
        Phiếu kế hoạch sản xuất
      </h2>
    </div>

    {/* Body scrollable */}
    <div className="p-6 overflow-y-auto flex-1">
      <form
        id="create-plan-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Left info */}
        <div className="space-y-4">
          {[
            ["Mã đơn hàng", "maDonHang"],
            ["Tên sản phẩm", "tenSanPham"],
            ["Số lượng NVL ước tính", "soLuongNVL"],
            ["Số lượng cần sản xuất", "soLuongCanSanXuat"],
          ].map(([label, key]) => (
            <div key={key}>
              <label className="text-white text-sm">{label}</label>
              <input
                type="text"
                value={formData[key]}
                readOnly
                className="w-full px-4 py-2 rounded-lg bg-amber-600 text-white"
              />
            </div>
          ))}
        </div>

        {/* Right inputs */}
        <div className="space-y-4">
          <div>
            <label className="text-white text-sm">Ngày bắt đầu:</label>
            <input
              type="date"
              value={formData.ngayBatDauDuKien}
              onChange={(e) =>
                setFormData({ ...formData, ngayBatDauDuKien: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg bg-amber-600 text-white"
              required
            />
          </div>

          <div>
            <label className="text-white text-sm">Ngày kết thúc:</label>
            <input
              type="date"
              value={formData.ngayKetThucDuKien}
              onChange={(e) =>
                setFormData({ ...formData, ngayKetThucDuKien: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg bg-amber-600 text-white"
              required
            />
          </div>

          <div>
            <label className="text-white text-sm">Xưởng phụ trách:</label>
            <select
              value={formData.xuongPhuTrach}
              onChange={(e) =>
                setFormData({ ...formData, xuongPhuTrach: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg bg-amber-600 text-white"
              required
            >
              <option value="">Chọn xưởng...</option>
              <option value="Factory Arabica">Factory Arabica</option>
              <option value="Factory Robusta">Factory Robusta</option>
              <option value="Factory Civet">Factory Civet</option>
              <option value="Factory Instant">Factory Instant</option>
            </select>
          </div>
        </div>

        {/* NVL SECTION */}
        <div className="col-span-1 md:col-span-2 bg-amber-700 bg-opacity-40 p-5 rounded-xl">
          <h3 className="text-lg font-bold text-white mb-3">Nguyên vật liệu cần thiết</h3>

          {/* Group A */}
          <h4 className="font-semibold text-white mb-2">A. Hạt cà phê</h4>
          {nvlHat.map((n) => (
            <label key={n._id} className="text-white flex gap-2 mb-1">
              <input
                type="radio"
                name="bean"
                checked={selectedBean === n._id}
                onChange={() => setSelectedBean(n._id)}
              />
              {n.tenSP} ({n.maSP})
            </label>
          ))}

          {/* Group B */}
          <h4 className="font-semibold text-white mt-4 mb-2">B. Bao bì – Túi</h4>
          {nvlTui.map((n) => (
            <label key={n._id} className="text-white flex gap-2 mb-1">
              <input
                type="radio"
                name="bag"
                checked={selectedBag === n._id}
                onChange={() => setSelectedBag(n._id)}
              />
              {n.tenSP} ({n.maSP})
            </label>
          ))}

          {/* Group C */}
          <h4 className="font-semibold text-white mt-4 mb-2">C. Tem – Nhãn</h4>
          {nvlTem.map((n) => (
            <label key={n._id} className="text-white flex gap-2 mb-1">
              <input
                type="radio"
                name="label"
                checked={selectedLabel === n._id}
                onChange={() => setSelectedLabel(n._id)}
              />
              {n.tenSP} ({n.maSP})
            </label>
          ))}
        </div>
      </form>
    </div>

    {/* Footer cố định */}
    <div className="p-4 border-t border-amber-600 flex justify-center gap-4 bg-amber-800 bg-opacity-60">
      <button
        type="button"
        onClick={onClose}
        className="px-6 py-2 bg-amber-600 text-white rounded-lg"
      >
        Hủy
      </button>
      <button
        form="create-plan-form"
        type="submit"
        className="px-6 py-2 bg-amber-900 text-white rounded-lg"
      >
        Xác nhận
      </button>
    </div>

  </div>
</div>

  );
};

export default CreatePlanModal;
