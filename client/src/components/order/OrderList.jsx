import React, { useContext } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderList = () => {
  const navigate = useNavigate();
  const { orders, setOrders, loading, handleCompleteOrder } = useContext(OrderContext);

  const handleComplete = async (orderId) => {
    if (window.confirm("Xác nhận hoàn thành đơn hàng này? Đơn hàng sẽ được chuyển cho Ban giám đốc.")) {
      const success = await handleCompleteOrder(orderId);
      if (success) alert("Đơn hàng đã được chuyển cho Ban giám đốc!");
    }
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
        <button
          onClick={() => navigate("/sales/create")}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <Plus size={20} />
          Tạo đơn mới
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-amber-700 to-amber-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Mã đơn hàng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Tên sản phẩm</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Số lượng</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Ngày giao</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Họ và tên</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Địa chỉ</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Số điện thoại</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Điều chỉnh</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <tr
                    key={order.id}
                    className={`border-b hover:bg-amber-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-semibold">{order.id}</td>
                    <td className="px-4 py-3 text-sm">{order.product}</td>
                    <td className="px-4 py-3 text-sm">{order.quantity}</td>
                    <td className="px-4 py-3 text-sm">{order.deliveryDate}</td>
                    <td className="px-4 py-3 text-sm">{order.customerName}</td>
                    <td
                      className="px-4 py-3 text-sm truncate max-w-xs"
                      title={order.email}
                    >
                      {order.email}
                    </td>
                    <td
                      className="px-4 py-3 text-sm truncate max-w-xs"
                      title={order.address}
                    >
                      {order.address}
                    </td>
                    <td className="px-4 py-3 text-sm">{order.phone}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => navigate(`/sales/create?id=${order.id}`)}
                          className="px-4 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleComplete(order.id)}
                          className="px-4 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
                        >
                          Xong
                        </button>
                      </div>
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
