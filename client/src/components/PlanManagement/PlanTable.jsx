import React, { useState, useMemo } from "react";
import { CheckSquare, Square, ChevronDown } from "lucide-react";
import CreatePlanModal from "./CreatePlanModal";

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "NaN/NaN/NaN") return "Chưa có";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Chưa có";
  return date.toLocaleDateString("vi-VN");
};

const PlanTable = ({ orders = [] }) => {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [sortType, setSortType] = useState("date");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    const parseDate = (dateStr) => new Date(dateStr).getTime() || 0;

    const sorted = [...orders].sort((a, b) => {
      if (sortType === "product") {
        const tenA = a.chiTiet?.[0]?.sanPham?.tenSP?.toLowerCase() || "";
        const tenB = b.chiTiet?.[0]?.sanPham?.tenSP?.toLowerCase() || "";
        if (tenA !== tenB) return tenA.localeCompare(tenB);
        return parseDate(b.ngayDat) - parseDate(a.ngayDat);
      }
      return parseDate(b.ngayDat) - parseDate(a.ngayDat);
    });

    return sorted;
  }, [orders, sortType]);

  const toggleSelect = (maDH) => {
    setSelectedOrders((prev) =>
      prev.includes(maDH)
        ? prev.filter((id) => id !== maDH)
        : [...prev, maDH]
    );
  };

  const handleCreatePlan = () => {
    if (selectedOrders.length === 0) return;
    setShowModal(true);
  };

  const selectedData = orders.filter((o) =>
    selectedOrders.includes(o.maDH)
  );

  return (
    <div className="relative h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-[#5A2E0E]">
          Danh sách đơn hàng đã duyệt
        </h2>

        {/* Nút sắp xếp */}
        <div className="relative w-full sm:w-auto">
          <button
            onClick={() => setShowSortMenu((prev) => !prev)}
            className="w-full flex items-center justify-between gap-2 bg-[#8B4513] hover:bg-[#5A2E0E] text-white px-4 py-2 rounded-full transition text-sm whitespace-nowrap"
          >
            <span className="truncate">
              {sortType === "date"
                ? "Sắp theo ngày gần nhất"
                : "Sắp theo tên sản phẩm"}
            </span>
            <ChevronDown size={16} className="flex-shrink-0" />
          </button>

          {showSortMenu && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-md z-20 w-full sm:w-56">
              <button
                onClick={() => {
                  setSortType("date");
                  setShowSortMenu(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-amber-50 ${
                  sortType === "date" ? "bg-amber-100 font-medium" : ""
                }`}
              >
                📅 Sắp theo ngày gần nhất
              </button>
              <button
                onClick={() => {
                  setSortType("product");
                  setShowSortMenu(false);
                }}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-amber-50 ${
                  sortType === "product" ? "bg-amber-100 font-medium" : ""
                }`}
              >
                🏷️ Sắp theo tên sản phẩm
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bảng đơn hàng */}
      <div className="flex-1 overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full border-collapse min-w-[900px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#8B4513] text-white text-xs sm:text-sm uppercase">
              <th className="px-3 py-3 text-left">Mã đơn hàng</th>
              <th className="px-3 py-3 text-left min-w-[150px]">Tên sản phẩm</th>
              <th className="px-3 py-3 text-left">Số lượng SP</th>
              <th className="px-3 py-3 text-left">Ngày bắt đầu</th>
              <th className="px-3 py-3 text-left">Ngày kết thúc</th>
              <th className="px-3 py-3 text-left">Trạng thái</th>
              <th className="px-3 py-3 text-center">Lập kế hoạch</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order) => (
              <tr
                key={order._id}
                className="border-b border-gray-200 hover:bg-amber-50 transition"
              >
                <td className="px-3 py-3 text-sm font-medium">{order.maDH}</td>
                <td className="px-3 py-3 text-sm">{order.chiTiet[0]?.sanPham?.tenSP}</td>
                <td className="px-3 py-3 text-sm whitespace-nowrap">{order.chiTiet[0]?.soLuong}/Túi</td>
                <td className="px-3 py-3 text-sm whitespace-nowrap">{formatDate(order.ngayDat)}</td>
                <td className="px-3 py-3 text-sm whitespace-nowrap">{formatDate(order.ngayYeuCauGiao)}</td>
                <td className="px-3 py-3 text-sm text-red-500 font-medium">Đã duyệt</td>
                <td className="px-3 py-3 text-center">
                  <button
                    onClick={() => toggleSelect(order.maDH)}
                    className="text-[#8B4513] hover:text-[#5A2E0E] transition"
                  >
                    {selectedOrders.includes(order.maDH) ? (
                      <CheckSquare size={20} />
                    ) : (
                      <Square size={20} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nút tạo kế hoạch */}
      {selectedOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between sm:justify-end items-stretch sm:items-center gap-3 mt-4">
          <span className="text-sm text-gray-600">
            Đã chọn {selectedOrders.length} đơn hàng
          </span>
          <button
            onClick={handleCreatePlan}
            className="bg-[#8B4513] hover:bg-[#5A2E0E] text-white px-5 py-2 rounded-full font-medium shadow-md transition text-sm"
          >
            Tạo kế hoạch
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CreatePlanModal
          onClose={() => setShowModal(false)}
          orders={selectedData}
        />
      )}
    </div>
  );
};

export default PlanTable;
