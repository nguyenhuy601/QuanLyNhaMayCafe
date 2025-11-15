import React, { useState, useMemo, useEffect } from "react";
import {CheckSquare,Square,ChevronDown,Edit2,Trash2,Eye,Check} from "lucide-react";
import { fetchProductionPlans, sendPlanToDirector } from "../../services/planService";
import formatDateOnly from "../../utils/formatDate";

const PlanListView = ({ onEdit, onDelete, onView }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlans, setSelectedPlans] = useState([]);
  const [sortType, setSortType] = useState("date");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sendingIds, setSendingIds] = useState(new Set());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const productionPlans = await fetchProductionPlans();

        if (mounted && Array.isArray(productionPlans)) {
          // Map production plans to display format
          const mappedPlans = productionPlans.map((plan, i) => {
            // Get product name - handle nested object structure
            let tenSanPham = "Không rõ sản phẩm";
            if (plan.sanPham) {
              if (typeof plan.sanPham === "object") {
                tenSanPham = plan.sanPham.tenSanPham || plan.sanPham.tenSP || "Không rõ sản phẩm";
              } else if (typeof plan.sanPham === "string") {
                tenSanPham = plan.sanPham;
              }
            }

            // Calculate total NVL quantity from nvlCanThiet array
            let soLuongNVL = 0;
            if (Array.isArray(plan.nvlCanThiet)) {
              soLuongNVL = plan.nvlCanThiet.reduce((sum, nvl) => sum + (nvl.soLuong || 0), 0);
            } else if (plan.soLuongCanSanXuat) {
              // Fallback to production quantity if no NVL array
              soLuongNVL = plan.soLuongCanSanXuat;
            }

            return {
              _id: plan._id || `temp-${i}`,
              maKeHoach: plan.maKeHoach || `KH${i + 1}`,
              tenSanPham: tenSanPham,
              soLuongNVL: soLuongNVL || 0,
              ngayBatDau: plan.ngayBatDauDuKien || null,
              ngayKetThuc: plan.ngayKetThucDuKien || null,
              trangThai: plan.trangThai || "Chưa có",
              ghiChu: plan.ghiChu || "",
              _rawPlan: plan,
            };
          });

          setPlans(mappedPlans);
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải kế hoạch sản xuất:", err);
        setPlans([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);


  // 🧩 Sắp xếp
  const sortedPlans = useMemo(() => {
    const parseDate = (d) => {
      if (!d) return 0;
      const t = new Date(d).getTime();
      return isNaN(t) ? 0 : t;
    };
    const sorted = [...plans].sort((a, b) => {
      if (sortType === "product")
        return (a.tenSanPham || "").localeCompare(b.tenSanPham || "");
      if (sortType === "factory")
        return (a.xuongSanXuat || "").localeCompare(b.xuongSanXuat || "");
        return parseDate(b.ngayBatDau) - parseDate(a.ngayBatDau);
    });
    return sorted;
  }, [plans, sortType]);

  // 🧩 Lọc
  const filteredPlans = useMemo(() => {
    if (filterStatus === "all") return sortedPlans;
    if (filterStatus === "inProgress")
      return sortedPlans.filter((p) => p.trangThai === "Đang thực hiện");
    if (filterStatus === "completed")
      return sortedPlans.filter((p) => p.trangThai === "Hoàn thành");
    return sortedPlans;
  }, [sortedPlans, filterStatus]);

  const toggleSelect = (id) => {
    setSelectedPlans((prev) =>
      prev.includes(id)
        ? prev.filter((pid) => pid !== id)
        : [...prev, id]
    );
  };

  // Handle sending plan to director
  const handleSendToDirector = async (plan) => {
    if (!plan._id) {
      alert("Không thể xác định kế hoạch");
      return;
    }

    setSendingIds((prev) => new Set(prev).add(plan._id));
    try {
      const result = await sendPlanToDirector(plan._id, plan._rawPlan);
      
      if (result.success) {
        // Remove the plan from display
        setPlans((prevPlans) => prevPlans.filter((p) => p._id !== plan._id));
        alert("✅ Đã gửi kế hoạch cho ban giám đốc");
      } else {
        alert(`❌ Lỗi: ${result.message}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Có lỗi xảy ra khi gửi kế hoạch");
    } finally {
      setSendingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(plan._id);
        return newSet;
      });
    }
  };

  // Use shared util to format date-only (dd/mm/yyyy)
  const formatDate = (value) => {
    const formatted = formatDateOnly(value);
    return formatted || "Chưa có";
  };


  const handleSortChange = (type) => {
    setSortType(type);
    setShowSortMenu(false);
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#5A2E0E]">
            Danh sách kế hoạch sản xuất
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng số: {filteredPlans.length} kế hoạch
          </p>
        </div>

        {/* Filter + Sort */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Lọc trạng thái */}
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {[
              { key: "all", label: "Tất cả" },
              { key: "inProgress", label: "Đang thực hiện" },
              { key: "completed", label: "Hoàn thành" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilterStatus(item.key)}
                className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium ${
                  filterStatus === item.key
                    ? "bg-[#8B4513] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu((p) => !p)}
              className="flex items-center justify-between gap-2 bg-[#8B4513] hover:bg-[#5A2E0E] text-white px-4 py-2 rounded-lg transition shadow-sm text-sm"
            >
              <span>
                {sortType === "date" && "Ngày gần nhất"}
                {sortType === "product" && "Tên sản phẩm"}
                {sortType === "factory" && "Xưởng sản xuất"}
              </span>
              <ChevronDown size={16} />
            </button>

            {showSortMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => handleSortChange("date")}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Ngày gần nhất
                </button>
                <button
                  onClick={() => handleSortChange("product")}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Tên sản phẩm
                </button>
                <button
                  onClick={() => handleSortChange("factory")}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Xưởng sản xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full border-collapse min-w-[1100px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#8B4513] text-white text-xs sm:text-sm uppercase">
              <th className="px-3 py-3 text-left">Mã kế hoạch</th>
              <th className="px-3 py-3 text-left">Tên sản phẩm</th>
              <th className="px-3 py-3 text-left">Số lượng NVL</th>
              <th className="px-3 py-3 text-left">Ngày bắt đầu</th>
              <th className="px-3 py-3 text-left">Ngày kết thúc</th>
              <th className="px-3 py-3 text-left">Trạng thái</th>
              <th className="px-3 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.map((plan) => (
              <tr
                key={plan._id}
                className="border-b border-gray-200 hover:bg-amber-50 transition"
              >
                <td className="px-3 py-3 text-sm text-[#5A2E0E] font-semibold">{plan.maKeHoach}</td>
                <td className="px-3 py-3 text-sm">{plan.tenSanPham}</td>
                <td className="px-3 py-3 text-sm">{plan.soLuongNVL}</td>
                <td className="px-3 py-3 text-sm">{formatDate(plan.ngayBatDau)}</td>
                <td className="px-3 py-3 text-sm">{formatDate(plan.ngayKetThuc)}</td>
                <td className="px-3 py-3 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    plan.trangThai === "Chưa duyệt" ? "bg-yellow-100 text-yellow-700" :
                    plan.trangThai === "Đã duyệt" ? "bg-blue-100 text-blue-700" :
                    plan.trangThai === "Đang thực hiện" ? "bg-orange-100 text-orange-700" :
                    plan.trangThai === "Hoàn thành" ? "bg-green-100 text-green-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {plan.trangThai}
                  </span>
                </td>
                <td className="px-5 py-5 text-center">
                  <button
                    onClick={() => handleSendToDirector(plan)}
                    disabled={sendingIds.has(plan._id)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-medium transition ${
                      sendingIds.has(plan._id)
                        ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                    }`}
                  >
                    {sendingIds.has(plan._id) ? "Đang gửi..." : "Xong"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-gray-500">
          <p>Đang tải dữ liệu đơn hàng...</p>
        </div>
      )}

      {!loading && filteredPlans.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>Không có kế hoạch sản xuất nào.</p>
        </div>
      )}
    </div>
  );
};

export default PlanListView;
