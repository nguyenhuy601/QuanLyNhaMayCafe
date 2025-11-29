import React, { useState, useMemo, useEffect } from "react";
import { CheckSquare, Square, ChevronDown } from "lucide-react";
import CreatePlanModal from "./CreatePlanModal";

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === "NaN/NaN/NaN") return "Chưa có";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Chưa có";
  return date.toLocaleDateString("vi-VN");
};

const PlanTable = ({ orders = [], onModalStateChange }) => {
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [sortType, setSortType] = useState("date");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    onModalStateChange?.(showModal);
  }, [showModal, onModalStateChange]);

  const sortedOrders = useMemo(() => {
    const parseDate = (dateStr) => new Date(dateStr).getTime() || 0;

    return [...orders].sort((a, b) => {
      if (sortType === "product") {
        const tenA = a.chiTiet?.[0]?.sanPham?.tenSP?.toLowerCase() || "";
        const tenB = b.chiTiet?.[0]?.sanPham?.tenSP?.toLowerCase() || "";
        if (tenA !== tenB) return tenA.localeCompare(tenB);
        return parseDate(b.ngayDat) - parseDate(a.ngayDat);
      }
      return parseDate(b.ngayDat) - parseDate(a.ngayDat);
    });
  }, [orders, sortType]);

  const toggleSelect = (maDH) => {
    setSelectedOrders((prev) =>
      prev.includes(maDH)
        ? prev.filter((id) => id !== maDH)
        : [...prev, maDH]
    );
  };

  const selectedData = orders.filter((o) =>
    selectedOrders.includes(o.maDH)
  );

  return (
    <div className="relative h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#5A2E0E]">
            Danh sách đơn hàng đã duyệt
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Tổng số: {orders.length} đơn hàng
          </p>
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
            </span>
            <ChevronDown size={16} />
          </button>

          {showSortMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
              <button
                onClick={() => {
                  setSortType("date");
                  setShowSortMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Ngày gần nhất
              </button>

              <button
                onClick={() => {
                  setSortType("product");
                  setShowSortMenu(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Tên sản phẩm
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full border-collapse min-w-[1100px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#8B4513] text-white text-xs sm:text-sm uppercase">
              <th className="px-3 py-3 text-left">Mã đơn hàng</th>
              <th className="px-3 py-3 text-left">Tên sản phẩm</th>
              <th className="px-3 py-3 text-left">Số lượng SP</th>
              <th className="px-3 py-3 text-left">Ngày tạo đơn</th>
              <th className="px-3 py-3 text-left">Ngày giao</th>
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
                <td className="px-3 py-3 text-sm text-[#5A2E0E] font-semibold">
                  {order.maDH}
                </td>

                <td className="px-3 py-3 text-sm">
                  {order.chiTiet?.[0]?.sanPham?.tenSP}
                </td>

                <td className="px-3 py-3 text-sm">
                  {(() => {
                    const chiTiet = order.chiTiet?.[0];
                    const soLuong = chiTiet?.soLuong || 0;
                    const donVi = chiTiet?.donVi;
                    const loaiTui = chiTiet?.loaiTui;
                    
                    // Nếu loaiTui = "hop" thì hiển thị "Hộp"
                    if (loaiTui === "hop") {
                      return `${soLuong} Hộp`;
                    }
                    
                    // Nếu có donVi thì hiển thị donVi
                    if (donVi !== null && donVi !== undefined) {
                      return `${soLuong} ${donVi}`;
                    }
                    
                    // Mặc định hiển thị "null"
                    return `${soLuong} null`;
                  })()}
                </td>

                <td className="px-3 py-3 text-sm">
                  {formatDate(order.ngayDat)}
                </td>

                <td className="px-3 py-3 text-sm">
                  {formatDate(order.ngayYeuCauGiao)}
                </td>

                <td
                  className={`px-3 py-3 text-sm font-semibold ${
                    order.trangThai === "Chờ duyệt"
                      ? "text-amber-600"
                      : order.trangThai === "Đã duyệt"
                      ? "text-green-600"
                      : "text-blue-700"
                  }`}
                >
                  {order.trangThai || "Chờ duyệt"}
                </td>

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

      {/* Footer Action */}
      {selectedOrders.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between sm:justify-end items-stretch sm:items-center gap-3 mt-4">
          <span className="text-sm text-gray-600">
            Đã chọn {selectedOrders.length} đơn hàng
          </span>

          <button
            onClick={() => setShowModal(true)}
            className="bg-[#8B4513] hover:bg-[#5A2E0E] text-white px-5 py-2 rounded-lg font-medium shadow-md transition text-sm"
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
