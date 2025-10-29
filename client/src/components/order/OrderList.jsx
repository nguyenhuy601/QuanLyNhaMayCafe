import React, { useEffect, useState } from "react";
import { Plus, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchOrders } from "../../services/orderService";

const OrderList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleComplete = async (orderId) => {
    if (window.confirm("Xác nhận hoàn thành đơn hàng này? Đơn hàng sẽ được chuyển cho Ban giám đốc.")) {
      alert(`Đơn hàng ${orderId} đã được chuyển cho Ban giám đốc!`);
    }
  };

  const handleEdit = (orderId) => {
    navigate(`/orders/edit/${orderId}`);
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Danh sách đơn hàng</h2>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-amber-700 to-amber-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Mã đơn hàng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Khách hàng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Ngày đặt</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Ngày giao</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tổng tiền</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr
                    key={order._id}
                    className={`border-b hover:bg-amber-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-semibold">{order.maDH}</td>
                    <td className="px-4 py-3 text-sm">{order.khachHang?.tenKH}</td>
                    <td className="px-4 py-3 text-sm">{order.ngayDat}</td>
                    <td className="px-4 py-3 text-sm">{order.ngayYeuCauGiao}</td>
                    <td className="px-4 py-3 text-sm">{order.trangThai}</td>
                    <td className="px-4 py-3 text-sm">{order.tongTien.toLocaleString()}₫</td>
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
