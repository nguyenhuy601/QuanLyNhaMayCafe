import React, { useState, useEffect } from "react";
import { CalendarDays, Search, ClipboardList, Info } from "lucide-react";
import { fetchPlans, fetchPlanById } from "../../../services/factoryService";

export default function XemKeHoach() {
  const [filter, setFilter] = useState({ tuNgay: "", denNgay: "", maKeHoach: "" });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await fetchPlans();
      setPlans(data);
    } catch (error) {
      console.error("Lỗi tải kế hoạch:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa có";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  const normalizePlan = (plan) => ({
    _id: plan._id,
    maKeHoach: plan.maKeHoach || plan._id,
    sanPham: plan.sanPham?.tenSanPham || plan.sanPham?.productId || "Sản phẩm",
    ngayBatDau: plan.ngayBatDauDuKien || plan.ngayBatDau,
    ngayKetThuc: plan.ngayKetThucDuKien || plan.ngayKetThuc,
    toSanXuat: plan.xuongPhuTrach || "Chưa xác định",
    soLuong: plan.soLuongCanSanXuat || 0,
    trangThai: plan.trangThai || "Chờ duyệt",
  });

  const filteredData = plans.map(normalizePlan).filter((item) => {
    const tu = filter.tuNgay ? new Date(filter.tuNgay) : null;
    const den = filter.denNgay ? new Date(filter.denNgay) : null;
    const ngayBD = new Date(item.ngayBatDau);
    const matchDate = (!tu || ngayBD >= tu) && (!den || ngayBD <= den);
    const matchMa = !filter.maKeHoach || item.maKeHoach.includes(filter.maKeHoach);
    return matchDate && matchMa;
  });

  const filterControl =
    "flex items-center gap-2 rounded-2xl border border-amber-200 px-4 py-2.5 bg-white text-sm text-amber-900 focus-within:ring-2 focus-within:ring-amber-500";

  return (
    <div className="space-y-6 text-amber-900">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
          <ClipboardList size={24} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Planning</p>
          <h1 className="text-3xl font-bold text-amber-900">Xem kế hoạch sản xuất</h1>
        </div>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label className={filterControl}>
            <Search size={18} className="text-amber-500" />
            <input
              type="text"
              placeholder="Nhập mã kế hoạch..."
              value={filter.maKeHoach}
              onChange={(e) => setFilter({ ...filter, maKeHoach: e.target.value })}
              className="flex-1 border-none bg-transparent outline-none"
            />
          </label>
          <label className={filterControl}>
            <CalendarDays size={18} className="text-amber-500" />
            <input
              type="date"
              value={filter.tuNgay}
              onChange={(e) => setFilter({ ...filter, tuNgay: e.target.value })}
              className="flex-1 border-none bg-transparent outline-none"
            />
          </label>
          <label className={filterControl}>
            <CalendarDays size={18} className="text-amber-500" />
            <input
              type="date"
              value={filter.denNgay}
              onChange={(e) => setFilter({ ...filter, denNgay: e.target.value })}
              className="flex-1 border-none bg-transparent outline-none"
            />
          </label>
        </div>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-amber-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Mã kế hoạch</th>
                <th className="px-4 py-3 text-left font-semibold">Mã lô</th>
                <th className="px-4 py-3 text-left font-semibold">Sản phẩm</th>
                <th className="px-4 py-3 text-left font-semibold">Tổ sản xuất</th>
                <th className="px-4 py-3 text-left font-semibold">Ngày bắt đầu</th>
                <th className="px-4 py-3 text-left font-semibold">Ngày kết thúc</th>
                <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-left font-semibold">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-amber-600">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-amber-600">
                    Chưa có kế hoạch sản xuất nào
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row._id || row.maKeHoach} className="hover:bg-amber-50/60">
                    <td className="px-4 py-3 font-semibold">{row.maKeHoach}</td>
                    <td className="px-4 py-3">{row._id?.slice(-6) || "N/A"}</td>
                    <td className="px-4 py-3">{row.sanPham}</td>
                    <td className="px-4 py-3">{row.toSanXuat}</td>
                    <td className="px-4 py-3">{formatDate(row.ngayBatDau)}</td>
                    <td className="px-4 py-3">{formatDate(row.ngayKetThuc)}</td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        {row.trangThai}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => {
                          if (row._id) {
                            const fullPlan = await fetchPlanById(row._id);
                            setSelectedPlan(fullPlan ? normalizePlan(fullPlan) : row);
                          } else {
                            setSelectedPlan(row);
                          }
                        }}
                        className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold shadow hover:shadow-lg transition"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg space-y-4 border border-amber-100">
            <div className="flex items-center gap-2 text-amber-800">
              <Info size={22} />
              <h2 className="text-xl font-bold">Chi tiết kế hoạch</h2>
            </div>
            <div className="space-y-2 text-sm text-amber-900">
              <p><strong>Mã kế hoạch:</strong> {selectedPlan.maKeHoach || selectedPlan._id}</p>
              <p><strong>Mã lô hàng:</strong> {selectedPlan._id?.slice(-6) || "N/A"}</p>
              <p><strong>Sản phẩm:</strong> {selectedPlan.sanPham}</p>
              <p><strong>Tổ sản xuất:</strong> {selectedPlan.toSanXuat}</p>
              <p><strong>Số lượng cần sản xuất:</strong> {selectedPlan.soLuong?.toLocaleString("vi-VN") || 0}</p>
              <p>
                <strong>Ngày bắt đầu:</strong> {formatDate(selectedPlan.ngayBatDau)}
              </p>
              <p>
                <strong>Ngày kết thúc:</strong> {formatDate(selectedPlan.ngayKetThuc)}
              </p>
              <p><strong>Trạng thái:</strong> {selectedPlan.trangThai}</p>
            </div>
            <div className="text-right">
              <button
                onClick={() => setSelectedPlan(null)}
                className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold shadow hover:shadow-lg transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
