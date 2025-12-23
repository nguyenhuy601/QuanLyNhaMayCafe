import React, { useState, useMemo, useEffect } from "react";
import {CheckSquare,Square,ChevronDown,Edit2,Trash2,Eye,Check} from "lucide-react";
import { fetchProductionPlans, sendPlanToDirector } from "../../../services/planService";
import formatDate from "../../../utils/formatDate";

const PlanListView = ({
  plans: propPlans = [],
  loading: propLoading = false,
  onEdit,
  onDelete,
  onView
}) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(propLoading);

  const [selectedPlans, setSelectedPlans] = useState([]);
  const [sortType, setSortType] = useState("date");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sendingIds, setSendingIds] = useState(new Set());

  // --- Load plans from props ---
  useEffect(() => {
    if (propPlans && Array.isArray(propPlans) && propPlans.length > 0) {
      setPlans(propPlans);
      setLoading(propLoading);
    }
  }, [propPlans, propLoading]);

  // --- Fetch plans only if no props provided ---
  useEffect(() => {
    if (propPlans && Array.isArray(propPlans) && propPlans.length > 0) return;

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const productionPlans = await fetchProductionPlans();

        if (mounted && Array.isArray(productionPlans)) {
          const mappedPlans = productionPlans.map((plan, i) => {
            let tenSanPham = "Không rõ sản phẩm";
            if (plan.sanPham) {
              if (typeof plan.sanPham === "object") {
                tenSanPham =
                  plan.sanPham.tenSanPham ||
                  plan.sanPham.tenSP ||
                  "Không rõ sản phẩm";
              } else if (typeof plan.sanPham === "string") {
                tenSanPham = plan.sanPham;
              }
            }

            // Hiển thị số lượng NVL thực tế nếu có, nếu không thì dùng ước tính
            let soLuongNVL = plan.soLuongNVLThucTe || plan.soLuongNVLUocTinh || 0;
            
            // Tính toán lại từ nvlCanThiet nếu các field riêng lẻ không có
            let soLuongNVLTho = plan.soLuongNVLTho || 0;
            let soLuongBaoBi = plan.soLuongBaoBi || 0;
            let soLuongTemNhan = plan.soLuongTemNhan || 0;
            
            // Luôn tính lại từ nvlCanThiet nếu có, để đảm bảo dữ liệu chính xác
            if (plan.nvlCanThiet && Array.isArray(plan.nvlCanThiet) && plan.nvlCanThiet.length > 0) {
              // Reset các giá trị trước khi tính lại
              let tempNVLTho = 0;
              let tempBaoBi = 0;
              let tempTemNhan = 0;
              
              // Tính lại từ nvlCanThiet dựa trên tên NVL
              plan.nvlCanThiet.forEach(nvl => {
                const tenNVL = (nvl.tenNVL || "").toLowerCase();
                const maSP = (nvl.maSP || "").toLowerCase();
                const soLuong = nvl.soLuong || 0;
                
                // Kiểm tra xem là bao bì, tem nhãn hay NVL thô
                if (tenNVL.includes("túi") || tenNVL.includes("hộp") || tenNVL.includes("bao bì") || 
                    maSP.includes("bag") || maSP.includes("box") || maSP.includes("sachet")) {
                  tempBaoBi += soLuong;
                } else if (tenNVL.includes("tem") || tenNVL.includes("nhãn") || maSP.includes("label")) {
                  tempTemNhan += soLuong;
                } else {
                  // Mặc định là NVL thô (hạt cà phê)
                  tempNVLTho += soLuong;
                }
              });
              
              // Ưu tiên giá trị từ nvlCanThiet, fallback về giá trị từ plan nếu nvlCanThiet = 0
              soLuongNVLTho = tempNVLTho > 0 ? tempNVLTho : (plan.soLuongNVLTho || 0);
              soLuongBaoBi = tempBaoBi > 0 ? tempBaoBi : (plan.soLuongBaoBi || 0);
              soLuongTemNhan = tempTemNhan > 0 ? tempTemNhan : (plan.soLuongTemNhan || 0);
            }
            
            // Đảm bảo các giá trị không phải null/undefined
            soLuongNVLTho = soLuongNVLTho ?? 0;
            soLuongBaoBi = soLuongBaoBi ?? 0;
            soLuongTemNhan = soLuongTemNhan ?? 0;
            
            return {
              _id: plan._id || `temp-${i}`,
              maKeHoach: plan.maKeHoach || `KH${i + 1}`,
              tenSanPham,
              soLuongNVL,
              soLuongNVLThucTe: plan.soLuongNVLThucTe,
              soLuongNVLUocTinh: plan.soLuongNVLUocTinh,
              soLuongNVLTho: soLuongNVLTho ?? 0, // NVL thô (kg)
              soLuongBaoBi: soLuongBaoBi ?? 0, // Bao bì (túi)
              soLuongTemNhan: soLuongTemNhan ?? 0, // Tem nhãn
              donVi: plan.donVi,
              ngayBatDau: plan.ngayBatDauDuKien || null,
              ngayKetThuc: plan.ngayKetThucDuKien || null,
              trangThai: plan.trangThai || "Chưa có",
              ghiChu: plan.ghiChu || "",
              _rawPlan: plan
            };
          });

          setPlans(mappedPlans);
        }
      } catch (err) {
        setPlans([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // --- Sorting ---
  const sortedPlans = useMemo(() => {
    const parseDate = (d) => {
      if (!d) return 0;
      const t = new Date(d).getTime();
      return isNaN(t) ? 0 : t;
    };

    return [...plans].sort((a, b) => {
      if (sortType === "product")
        return (a.tenSanPham || "").localeCompare(b.tenSanPham || "");
      if (sortType === "factory")
        return (a.xuongSanXuat || "").localeCompare(b.xuongSanXuat || "");
      return parseDate(b.ngayBatDau) - parseDate(a.ngayBatDau);
    });
  }, [plans, sortType]);

  // --- Filtering ---
  const filteredPlans = useMemo(() => {
    if (filterStatus === "all") return sortedPlans;
    if (filterStatus === "inProgress")
      return sortedPlans.filter((p) => p.trangThai === "Đang thực hiện");
    if (filterStatus === "completed")
      return sortedPlans.filter((p) => p.trangThai === "Hoàn thành");
    return sortedPlans;
  }, [sortedPlans, filterStatus]);

  // --- Toggle row selection ---
  const toggleSelect = (id) => {
    setSelectedPlans((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  // --- Send to Director ---
  const handleSendToDirector = async (plan) => {
    if (!plan._id) {
      alert("Không thể xác định kế hoạch");
      return;
    }

    setSendingIds((prev) => new Set(prev).add(plan._id));

    try {
      const result = await sendPlanToDirector(plan._id, plan._rawPlan);

      if (result.success) {
        setPlans((prev) => prev.filter((p) => p._id !== plan._id));
        alert("✅ Đã gửi kế hoạch cho ban giám đốc");
      } else {
        alert(`❌ Lỗi: ${result.message}`);
      }
    } catch (err) {
      alert("❌ Có lỗi xảy ra khi gửi kế hoạch");
    } finally {
      setSendingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(plan._id);
        return newSet;
      });
    }
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
          {/* Filter */}
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {[
              { key: "all", label: "Tất cả" },
              { key: "inProgress", label: "Đang thực hiện" },
              { key: "completed", label: "Hoàn thành" }
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
              <th className="px-3 py-3 text-left">NVL thô (kg)</th>
              <th className="px-3 py-3 text-left">Ngày bắt đầu</th>
              <th className="px-3 py-3 text-left">Ngày kết thúc</th>
              <th className="px-3 py-3 text-left">Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            {filteredPlans.map((plan, idx) => (
              <tr
                key={plan._id}
                className="border-b border-gray-200 hover:bg-amber-50 transition"
              >
                <td className="px-3 py-3 text-sm text-[#5A2E0E] font-semibold">
                  {plan.maDonHang || plan.maKeHoach}
                </td>

                <td className="px-3 py-3 text-sm">{plan.tenSanPham}</td>

                <td className="px-3 py-3 text-sm">
                  {plan.soLuongNVLTho || 0} kg
                </td>

                <td className="px-3 py-3 text-sm">
                  {formatDate(plan.ngayBatDau) || "Chưa có"}
                </td>

                <td className="px-3 py-3 text-sm">
                  {formatDate(plan.ngayKetThuc) || "Chưa có"}
                </td>

                <td className="px-3 py-3 text-sm">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      plan.trangThai === "Chưa duyệt"
                        ? "bg-yellow-100 text-yellow-700"
                        : plan.trangThai === "Đã duyệt"
                        ? "bg-blue-100 text-blue-700"
                        : plan.trangThai === "Đang thực hiện"
                        ? "bg-orange-100 text-orange-700"
                        : plan.trangThai === "Hoàn thành"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {plan.trangThai}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-gray-500">
          <p>Đang tải dữ liệu kế hoạch...</p>
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