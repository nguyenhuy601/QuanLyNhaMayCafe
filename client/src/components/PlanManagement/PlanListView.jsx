import React, { useState, useMemo } from "react";
import { CheckSquare, Square, ChevronDown, Edit2, Trash2, Eye } from "lucide-react";

const PlanListView = ({ plans = [], onEdit, onDelete, onView, loading = false }) => {
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [sortType, setSortType] = useState("date"); // "date" | "product" | "factory"
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all"); // "all" | "inProgress" | "completed"

  // 🔹 Mock data nếu không có kế hoạch thật
  const effectivePlans = useMemo(() => {
    if (Array.isArray(plans) && plans.length > 0) return plans;
    return [
      {
        _id: "1",
        maKH: "KH001",
        maDonHang: "DH001, DH002",
        tenSanPham: "cafe rang xay arabica",
        soLuongNVL: 25300,
        soLuongThanhPham: 23000,
        ngayBatDau: "2025-01-05",
        ngayKetThuc: "2025-01-15",
        xuongSanXuat: "Xưởng arabica",
        trangThai: "Đang thực hiện",
      },
      {
        _id: "2",
        maKH: "KH002",
        maDonHang: "DH005",
        tenSanPham: "cafe robusta hạt",
        soLuongNVL: 16500,
        soLuongThanhPham: 15000,
        ngayBatDau: "2025-01-10",
        ngayKetThuc: "2025-01-20",
        xuongSanXuat: "Xưởng robusta",
        trangThai: "Đang thực hiện",
      },
      {
        _id: "3",
        maKH: "KH003",
        maDonHang: "DH003, DH004",
        tenSanPham: "cafe hòa tan 3in1",
        soLuongNVL: 33000,
        soLuongThanhPham: 30000,
        ngayBatDau: "2024-12-20",
        ngayKetThuc: "2025-01-03",
        xuongSanXuat: "Xưởng hòa tan",
        trangThai: "Hoàn thành",
      },
    ];
  }, [plans]);

  // 🔹 Sắp xếp theo lựa chọn
  const sortedPlans = useMemo(() => {
    const parseDate = (dateStr) => new Date(dateStr).getTime() || 0;

    const sorted = [...effectivePlans].sort((a, b) => {
      if (sortType === "product") {
        const tenA = a.tenSanPham?.toLowerCase() || "";
        const tenB = b.tenSanPham?.toLowerCase() || "";
        if (tenA !== tenB) return tenA.localeCompare(tenB);
        return parseDate(b.ngayBatDau) - parseDate(a.ngayBatDau);
      }

      if (sortType === "factory") {
        const xuongA = a.xuongSanXuat?.toLowerCase() || "";
        const xuongB = b.xuongSanXuat?.toLowerCase() || "";
        if (xuongA !== xuongB) return xuongA.localeCompare(xuongB);
        return parseDate(b.ngayBatDau) - parseDate(a.ngayBatDau);
      }

      // Mặc định: sắp theo ngày gần nhất
      return parseDate(b.ngayBatDau) - parseDate(a.ngayBatDau);
    });

    return sorted;
  }, [effectivePlans, sortType]);

  // 🔹 Lọc theo trạng thái
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
        ? prev.filter((planId) => planId !== id)
        : [...prev, id]
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === "NaN/NaN/NaN") return "Chưa có";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Chưa có";
    return date.toLocaleDateString("vi-VN");
  };

  const handleBulkDelete = () => {
    if (selectedPlans.length === 0) return;
    if (window.confirm(`Bạn có chắc muốn xóa ${selectedPlans.length} kế hoạch đã chọn?`)) {
      console.log("Deleting plans:", selectedPlans);
      setSelectedPlans([]);
      alert("Đã xóa thành công!");
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Header với filters và sort */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#5A2E0E]">
            Danh sách kế hoạch sản xuất
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng số: {filteredPlans.length} kế hoạch
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Filter theo trạng thái */}
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            {[
              { key: "all", label: "Tất cả" },
              { key: "inProgress", label: "Đang thực hiện" },
              { key: "completed", label: "Hoàn thành" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setFilterStatus(item.key)}
                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  filterStatus === item.key
                    ? "bg-[#8B4513] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Sort dropdown */}
          <div className="relative">
          <button
            onClick={() => setShowSortMenu((prev) => !prev)}
            className="w-full flex items-center justify-between gap-2 bg-[#8B4513] hover:bg-[#5A2E0E] text-white px-4 py-2 rounded-lg transition shadow-sm text-sm whitespace-nowrap"
          >
            <span className="truncate">
              {sortType === "date" && "Ngày gần nhất"}
              {sortType === "product" && "Tên sản phẩm"}
              {sortType === "factory" && "Xưởng sản xuất"}
            </span>
            <ChevronDown size={16} className="flex-shrink-0" />
          </button>

          {showSortMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-full">
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
        <table className="w-full border-collapse min-w-[1200px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#8B4513] text-white text-xs sm:text-sm uppercase">
              <th className="px-3 py-3 text-left whitespace-nowrap">Mã KH</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">Mã đơn hàng</th>
              <th className="px-3 py-3 text-left whitespace-nowrap min-w-[180px]">Tên sản phẩm</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">SL NVL</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">SL thành phẩm</th>
              <th className="px-3 py-3 text-left whitespace-nowrap min-w-[140px]">Xưởng SX</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">Ngày bắt đầu</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">Ngày kết thúc</th>
              <th className="px-3 py-3 text-left whitespace-nowrap">Trạng thái</th>
              <th className="px-3 py-3 text-center whitespace-nowrap">Thao tác</th>
              <th className="px-3 py-3 text-center whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={
                    selectedPlans.length === filteredPlans.length &&
                    filteredPlans.length > 0
                  }
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPlans(filteredPlans.map((p) => p._id));
                    } else {
                      setSelectedPlans([]);
                    }
                  }}
                  className="w-4 h-4 cursor-pointer"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.map((plan) => (
              <tr key={plan._id} className="border-b border-gray-200 hover:bg-amber-50 transition">
                <td className="px-3 py-3 font-medium text-[#8B4513] text-sm whitespace-nowrap">
                  {plan.maKH}
                </td>
                <td className="px-3 py-3 text-sm whitespace-nowrap">{plan.maDonHang}</td>
                <td className="px-3 py-3 text-sm">{plan.tenSanPham}</td>
                <td className="px-3 py-3 text-sm whitespace-nowrap">
                  {plan.soLuongNVL?.toLocaleString()}
                </td>
                <td className="px-3 py-3 text-sm whitespace-nowrap">
                  {plan.soLuongThanhPham?.toLocaleString()}
                </td>
                <td className="px-3 py-3">
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-md text-xs font-medium whitespace-nowrap inline-block">
                    {plan.xuongSanXuat}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm whitespace-nowrap">{formatDate(plan.ngayBatDau)}</td>
                <td className="px-3 py-3 text-sm whitespace-nowrap">{formatDate(plan.ngayKetThuc)}</td>
                <td className="px-3 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap inline-block ${
                      plan.trangThai === "Hoàn thành"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {plan.trangThai}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <button
                      onClick={() => onView && onView(plan)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => onEdit && onEdit(plan)}
                      className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition"
                      title="Chỉnh sửa"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Bạn có chắc muốn xóa kế hoạch này?")) {
                          onDelete && onDelete(plan._id);
                        }
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                      title="Xóa"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <button
                    onClick={() => toggleSelect(plan._id)}
                    className="text-[#8B4513] hover:text-[#5A2E0E] transition"
                  >
                    {selectedPlans.includes(plan._id) ? (
                      <CheckSquare size={18} />
                    ) : (
                      <Square size={18} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk actions */}
      {selectedPlans.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between sm:justify-end items-stretch sm:items-center gap-3 mt-4">
          <span className="text-sm text-gray-600 text-center sm:text-left">
            Đã chọn {selectedPlans.length} kế hoạch
          </span>
          <button
            onClick={handleBulkDelete}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-medium shadow-md transition flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 size={16} />
            Xóa đã chọn
          </button>
        </div>
      )}

      {/* Loading & Empty states */}
      {loading && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg">Đang tải dữ liệu...</p>
        </div>
      )}

      {!loading && filteredPlans.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-base sm:text-lg">Không có kế hoạch nào</p>
          <p className="text-xs sm:text-sm mt-2">
            Hãy tạo kế hoạch sản xuất mới từ menu "Kế hoạch sản xuất"
          </p>
        </div>
      )}
    </div>
  );
};

export default PlanListView;
