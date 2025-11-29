import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchOrders } from "../../../services/orderService";
import formatDate from "../../../utils/formatDate";
import useAutoRefresh from "../../../hooks/useAutoRefresh";
import { normalizeStatusKey } from "../../../utils/statusMapper";

const OrderList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useAutoRefresh(loadOrders, { interval: 15000 });

  const filteredOrders = useMemo(() => {
    const allowed = new Set([
      "cho duyet",
      "chua duyet",
      "dang cho duyet",
      "pending",
      "tu choi",
      "da tu choi",
      "reject",
    ]);

    return orders.filter((order) =>
      allowed.has(normalizeStatusKey(order.trangThai))
    );
  }, [orders]);

  const handleComplete = async (orderId) => {
    if (window.confirm("Xác nhận hoàn thành đơn hàng này? Đơn hàng sẽ được chuyển cho Ban giám đốc.")) {
      alert(`Đơn hàng ${orderId} đã được chuyển cho Ban giám đốc!`);
    }
  };

  const handleEdit = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-bold text-gray-800">Danh sách đơn hàng</h2>
        <button
          onClick={loadOrders}
          className="px-4 py-2 text-sm font-semibold text-amber-700 border border-amber-700 rounded hover:bg-amber-50"
        >
          Làm mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-amber-700 to-amber-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Mã đơn hàng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Khách hàng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Sản phẩm</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Số lượng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Ngày đặt</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Ngày giao</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tổng tiền</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    Chưa có đơn hàng chờ duyệt / bị từ chối nào
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr
                    key={order._id}
                    className={`border-b hover:bg-amber-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-semibold">{order.maDH}</td>
                    <td className="px-4 py-3 text-sm">{order.khachHang?.tenKH}</td>
                    <td className="px-4 py-3 text-sm">
                      {order.chiTiet?.[0]?.sanPham?.tenSP || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm">
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
                    <td className="px-4 py-3 text-sm">{formatDate(order.ngayDat)}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(order.ngayYeuCauGiao)}</td>
                    <td className="px-4 py-3 text-sm">{order.trangThai}</td>
                    <td className="px-4 py-3 text-sm">{(order.tongTien ?? 0).toLocaleString()}₫</td>
                    <td className="px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(order._id)}
                        className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                      >
                        <Edit size={16} className="inline mr-1" />
                        Chỉnh sửa
                      </button>
                      <button
                        onClick={() => handleComplete(order._id)}
                        className="px-4 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                      >
                        Xong
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderList;
