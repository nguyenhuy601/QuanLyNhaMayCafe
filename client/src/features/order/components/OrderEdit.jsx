import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { fetchOrderById, updateOrder } from "../../../services/orderService";

const OrderEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const data = await fetchOrderById(id);
        setOrder(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    loadOrder();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
  if (!window.confirm("Xác nhận lưu thay đổi đơn hàng này?")) return;

  try {
    setLoading(true);
    const result = await updateOrder(id, order);

    if (result?.success === false) {
      throw new Error(result.message);
    }

    alert("✅ Cập nhật đơn hàng thành công!");
    navigate("/orders");
  } catch (error) {
    alert("❌ Không thể cập nhật đơn hàng!");
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (!order) {
    return <p className="text-center text-gray-500 mt-10">Không tìm thấy đơn hàng.</p>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center text-amber-700 hover:text-amber-800 transition"
        >
          <ArrowLeft className="mr-1" size={18} /> Quay lại
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa đơn hàng</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Khách hàng</label>
          <input
            type="text"
            name="khachHang"
            value={order.khachHang?.tenKH || ""}
            onChange={(e) =>
              setOrder((prev) => ({
                ...prev,
                khachHang: { ...prev.khachHang, tenKH: e.target.value },
              }))
            }
            className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Ngày đặt</label>
          <input
            type="date"
            name="ngayDat"
            value={order.ngayDat?.split("T")[0] || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Ngày giao dự kiến</label>
          <input
            type="date"
            name="ngayYeuCauGiao"
            value={order.ngayYeuCauGiao?.split("T")[0] || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 ">Tổng tiền (₫)</label>
          <input
            type="number"
            name="tongTien"
            value={order.tongTien || 0}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg p-2 mt-1 focus:ring-amber-500 focus:border-amber-500" disabled
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          onClick={() => navigate("/orders")}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
        >
          Hủy
        </button>
        <button
          onClick={handleSave}
          className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
        >
          <Save size={18} className="mr-2" />
          Lưu thay đổi
        </button>
      </div>
    </div>
  );
};

export default OrderEdit;
