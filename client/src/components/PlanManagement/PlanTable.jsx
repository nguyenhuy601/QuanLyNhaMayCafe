import React, { useState, useMemo } from "react";
import { CheckSquare, Square, ChevronDown } from "lucide-react";
import { formatDate } from '../../utils/dateUtils';

const PlanTable = ({ orders, onCreatePlan }) => {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [sortType, setSortType] = useState("date"); // "date" | "product"
  const [showSortMenu, setShowSortMenu] = useState(false);

  // ✅ Sắp xếp theo lựa chọn
  const sortedOrders = useMemo(() => {
    if (!orders) return [];

    const parseDate = (dateStr) => new Date(dateStr).getTime() || 0;

    const sorted = [...orders].sort((a, b) => {
      if (sortType === "product") {
        const tenA = a.chiTiet?.[0]?.sanPham?.tenSP?.toLowerCase() || "";
        const tenB = b.chiTiet?.[0]?.sanPham?.tenSP?.toLowerCase() || "";
        if (tenA !== tenB) return tenA.localeCompare(tenB);
        return parseDate(b.ngayBatDau) - parseDate(a.ngayBatDau);
      }

      // Mặc định: sắp theo ngày gần nhất
      return parseDate(b.ngayBatDau) - parseDate(a.ngayBatDau);
    });

    return sorted;
  }, [orders, sortType]);

  const toggleSelect = (maDH) => {
    setSelectedOrders((prev) =>
      prev.includes(maDH) ? prev.filter((id) => id !== maDH) : [...prev, maDH]
    );
  };

  const handleCreatePlan = () => {
    const selected = orders.filter((o) => selectedOrders.includes(o.maDH));
    onCreatePlan(selected);
  };

  return (
    <div className="relative mt-6">
      {/* --- Nút sắp xếp --- */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-[#5A2E0E]">
          Danh sách đơn hàng đã duyệt
        </h2>

        <div className="relative">
          <button
            onClick={() => setShowSortMenu((prev) => !prev)}
            className="flex items-center gap-2 bg-[#8B4513] hover:bg-[#5A2E0E] text-white px-4 py-2 rounded-full transition"
          >
            <span>
              {sortType === "date"
                ? "Sắp theo ngày gần nhất"
                : "Sắp theo tên sản phẩm"}
            </span>
            <ChevronDown size={18} />
          </button>

          {showSortMenu && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-md z-10 w-56">
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

      {/* --- Bảng đơn hàng --- */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#8B4513] text-white text-sm uppercase">
              <th className="px-4 py-3 text-left">Mã đơn hàng</th>
              <th className="px-4 py-3 text-left">Tên sản phẩm</th>
              <th className="px-4 py-3 text-left">Số lượng sản phẩm</th>
              <th className="px-4 py-3 text-left">Ngày bắt đầu</th>
              <th className="px-4 py-3 text-left">Ngày kết thúc</th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-center">Lập kế hoạch</th>
            </tr>
          </thead>
          <tbody>
            {sortedOrders.map((order) => (
              <tr
                key={order._id}
                className="border-b border-gray-200 hover:bg-amber-50 transition"
              >
                <td className="px-4 py-3">{order.maDH}</td>
                <td className="px-4 py-3">{order.chiTiet[0]?.sanPham?.tenSP}</td>
                <td className="px-4 py-3">{order.chiTiet[0]?.soLuong}/Túi</td>
                <td className="px-4 py-3">{formatDate(order.ngayBatDau)}</td>
                <td className="px-4 py-3">{formatDate(order.ngayKetThuc)}</td>
                <td className="px-4 py-3 text-red-500 font-medium">Đã duyệt</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => toggleSelect(order.maDH)}
                    className="text-[#8B4513] hover:text-[#5A2E0E] transition"
                  >
                    {selectedOrders.includes(order.maDH) ? (
                      <CheckSquare size={22} />
                    ) : (
                      <Square size={22} />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Nút tạo kế hoạch --- */}
      {selectedOrders.length > 0 && (
        <div className="flex justify-end mt-5">
          <button
            onClick={handleCreatePlan}
            className="bg-[#8B4513] hover:bg-[#5A2E0E] text-white px-5 py-2 rounded-full font-medium shadow-md transition"
          >
            Tạo kế hoạch
          </button>
        </div>
      )}
    </div>
  );
};

export default PlanTable;
