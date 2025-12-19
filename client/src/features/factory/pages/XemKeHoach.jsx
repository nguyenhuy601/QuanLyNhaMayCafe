import React, { useState, useEffect } from "react";
import { CalendarDays, Search, ClipboardList, Info, CheckCircle2, XCircle, Play } from "lucide-react";
import { fetchPlans, fetchPlanById, checkStartConditions, startPlan } from "../../../services/factoryService";

export default function XemKeHoach() {
  const [filter, setFilter] = useState({ tuNgay: "", denNgay: "", maKeHoach: "", trangThai: "all" });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [conditions, setConditions] = useState(null);
  const [loadingConditions, setLoadingConditions] = useState(false);
  const [startingPlan, setStartingPlan] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await fetchPlans();
      setPlans(data);
    } catch (error) {
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
    const matchStatus = filter.trangThai === "all" || item.trangThai === filter.trangThai;
    return matchDate && matchMa && matchStatus;
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
        <div className="grid gap-4 md:grid-cols-4">
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
          <select
            value={filter.trangThai}
            onChange={(e) => setFilter({ ...filter, trangThai: e.target.value })}
            className={filterControl}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Đang thực hiện">Đang thực hiện</option>
            <option value="Hoàn thành">Hoàn thành</option>
            <option value="Từ chối">Từ chối</option>
          </select>
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
                <th className="px-4 py-3 text-left font-semibold">Hành động</th>
                <th className="px-4 py-3 text-left font-semibold">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-amber-600">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-amber-600">
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
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        row.trangThai === "Chờ duyệt" 
                          ? "bg-yellow-100 text-yellow-700"
                          : row.trangThai === "Đã duyệt"
                          ? "bg-green-100 text-green-700"
                          : row.trangThai === "Từ chối"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {row.trangThai}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {row.trangThai === "Đã duyệt" ? (
                        <button
                          onClick={async () => {
                            if (row._id) {
                              const fullPlan = await fetchPlanById(row._id);
                              const planToShow = fullPlan ? normalizePlan(fullPlan) : row;
                              setSelectedPlan(planToShow);
                              // Load điều kiện
                              setLoadingConditions(true);
                              try {
                                const conditionsData = await checkStartConditions(row._id);
                                setConditions(conditionsData);
                              } catch (err) {
                                setConditions(null);
                              } finally {
                                setLoadingConditions(false);
                              }
                            }
                          }}
                          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold shadow hover:shadow-lg transition flex items-center gap-2"
                        >
                          <Play size={14} />
                          Bắt đầu kế hoạch
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={async () => {
                          if (row._id) {
                            const fullPlan = await fetchPlanById(row._id);
                            const planToShow = fullPlan ? normalizePlan(fullPlan) : row;
                            setSelectedPlan(planToShow);
                            
                            // Nếu trạng thái là "Đã duyệt", load điều kiện
                            if (planToShow.trangThai === "Đã duyệt") {
                              setLoadingConditions(true);
                              setConditions(null);
                              try {
                                const conditionsData = await checkStartConditions(row._id);
                                setConditions(conditionsData);
                              } catch (err) {
                                setConditions(null);
                              } finally {
                                setLoadingConditions(false);
                              }
                            } else {
                              setConditions(null);
                            }
                          } else {
                            setSelectedPlan(row);
                            setConditions(null);
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-amber-100">
            <div className="flex items-center gap-2 text-amber-800 mb-6">
              <Info size={22} />
              <h2 className="text-xl font-bold">Chi tiết kế hoạch</h2>
            </div>
            
            {/* Thông tin cơ bản */}
            <div className="space-y-2 text-sm text-amber-900 mb-6 pb-6 border-b border-amber-100">
              <p><strong>Mã kế hoạch:</strong> {selectedPlan.maKeHoach || selectedPlan._id}</p>
              <p><strong>Mã lô hàng:</strong> {selectedPlan._id?.slice(-6) || "N/A"}</p>
              <p><strong>Sản phẩm:</strong> {selectedPlan.sanPham}</p>
              <p><strong>Tổ sản xuất:</strong> {selectedPlan.toSanXuat}</p>
              <p><strong>Số lượng cần sản xuất:</strong> {selectedPlan.soLuong?.toLocaleString("vi-VN") || 0}</p>
              <p><strong>Ngày bắt đầu:</strong> {formatDate(selectedPlan.ngayBatDau)}</p>
              <p><strong>Ngày kết thúc:</strong> {formatDate(selectedPlan.ngayKetThuc)}</p>
              <p><strong>Trạng thái:</strong> {selectedPlan.trangThai}</p>
            </div>

            {/* 4 điều kiện bắt đầu kế hoạch */}
            {selectedPlan.trangThai === "Đã duyệt" && (
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-bold text-amber-900 mb-4">Điều kiện bắt đầu kế hoạch</h3>
                
                {loadingConditions ? (
                  <div className="text-center py-4 text-amber-600">Đang kiểm tra điều kiện...</div>
                ) : conditions && conditions.conditions ? (
                  <>
                    {/* (1) Kế hoạch đã được phê duyệt */}
                    <div className={`p-4 rounded-2xl border-2 ${
                      conditions.conditions.planApproved.status 
                        ? "bg-green-50 border-green-200" 
                        : "bg-red-50 border-red-200"
                    }`}>
                      <div className="flex items-start gap-3">
                        {conditions.conditions.planApproved.status ? (
                          <CheckCircle2 size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-amber-900 mb-1">
                            (1) Kế hoạch đã được phê duyệt
                          </h4>
                          <p className="text-sm text-amber-700 mb-2">
                            {conditions.conditions.planApproved.message}
                          </p>
                          {Object.keys(conditions.conditions.planApproved.details).length > 0 && (
                            <div className="text-xs text-amber-600 mt-2">
                              {Object.entries(conditions.conditions.planApproved.details).map(([key, value]) => (
                                <p key={key}><strong>{key}:</strong> {String(value)}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* (2) Nguyên vật liệu đã sẵn sàng */}
                    <div className={`p-4 rounded-2xl border-2 ${
                      conditions.conditions.materialsReady.status 
                        ? "bg-green-50 border-green-200" 
                        : "bg-red-50 border-red-200"
                    }`}>
                      <div className="flex items-start gap-3">
                        {conditions.conditions.materialsReady.status ? (
                          <CheckCircle2 size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-amber-900 mb-1">
                            (2) Nguyên vật liệu đã sẵn sàng
                          </h4>
                          <p className="text-sm text-amber-700 mb-2">
                            {conditions.conditions.materialsReady.message}
                          </p>
                          {Object.keys(conditions.conditions.materialsReady.details).length > 0 && (
                            <div className="text-xs text-amber-600 mt-2">
                              {Object.entries(conditions.conditions.materialsReady.details).map(([key, value]) => (
                                <p key={key}><strong>{key}:</strong> {String(value)}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* (3) Năng lực sản xuất sẵn sàng */}
                    <div className={`p-4 rounded-2xl border-2 ${
                      conditions.conditions.productionCapacityReady.status 
                        ? "bg-green-50 border-green-200" 
                        : "bg-red-50 border-red-200"
                    }`}>
                      <div className="flex items-start gap-3">
                        {conditions.conditions.productionCapacityReady.status ? (
                          <CheckCircle2 size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-amber-900 mb-1">
                            (3) Năng lực sản xuất sẵn sàng
                          </h4>
                          <p className="text-sm text-amber-700 mb-2">
                            {conditions.conditions.productionCapacityReady.message}
                          </p>
                          {Object.keys(conditions.conditions.productionCapacityReady.details).length > 0 && (
                            <div className="text-xs text-amber-600 mt-2">
                              {Object.entries(conditions.conditions.productionCapacityReady.details).map(([key, value]) => (
                                <p key={key}><strong>{key}:</strong> {String(value)}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* (4) Xưởng trưởng xác nhận */}
                    <div className={`p-4 rounded-2xl border-2 ${
                      conditions.conditions.managerConfirmation.status 
                        ? "bg-green-50 border-green-200" 
                        : "bg-red-50 border-red-200"
                    }`}>
                      <div className="flex items-start gap-3">
                        {conditions.conditions.managerConfirmation.status ? (
                          <CheckCircle2 size={24} className="text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle size={24} className="text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-amber-900 mb-1">
                            (4) Xưởng trưởng xác nhận có thể triển khai
                          </h4>
                          <p className="text-sm text-amber-700 mb-2">
                            {conditions.conditions.managerConfirmation.message}
                          </p>
                          {Object.keys(conditions.conditions.managerConfirmation.details).length > 0 && (
                            <div className="text-xs text-amber-600 mt-2">
                              {Object.entries(conditions.conditions.managerConfirmation.details).map(([key, value]) => (
                                <p key={key}><strong>{key}:</strong> {String(value)}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Nút bắt đầu kế hoạch */}
                    {conditions.allConditionsMet && (
                      <div className="mt-6 flex justify-end gap-3">
                        <button
                          onClick={async () => {
                            if (selectedPlan._id) {
                              setStartingPlan(true);
                              try {
                                await startPlan(selectedPlan._id);
                                alert("✅ Đã bắt đầu kế hoạch thành công!");
                                setSelectedPlan(null);
                                setConditions(null);
                                loadPlans(); // Reload danh sách
                              } catch (err) {
                                alert(`❌ Lỗi: ${err.response?.data?.message || err.message}`);
                              } finally {
                                setStartingPlan(false);
                              }
                            }
                          }}
                          disabled={startingPlan}
                          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold shadow hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <Play size={18} />
                          {startingPlan ? "Đang xử lý..." : "Bắt đầu kế hoạch"}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-amber-600 mb-3">Chưa thể tải thông tin điều kiện</p>
                    <button
                      onClick={async () => {
                        if (selectedPlan._id) {
                          setLoadingConditions(true);
                          try {
                            const conditionsData = await checkStartConditions(selectedPlan._id);
                            setConditions(conditionsData);
                          } catch (err) {
                            alert(`Lỗi: ${err.response?.data?.message || err.message}`);
                            setConditions(null);
                          } finally {
                            setLoadingConditions(false);
                          }
                        }
                      }}
                      className="px-4 py-2 rounded-2xl bg-amber-100 text-amber-700 font-semibold hover:bg-amber-200 transition"
                    >
                      Tải lại điều kiện
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="text-right mt-6 pt-6 border-t border-amber-100">
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setConditions(null);
                }}
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
