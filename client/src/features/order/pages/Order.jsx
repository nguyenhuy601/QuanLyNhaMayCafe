import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { salesAPI } from "../../../services/salesService";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  // 🔄 Tải danh sách đơn hàng
  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await salesAPI.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Tạo đơn hàng
  const handleCreateOrder = async (orderData) => {
    try {
      await salesAPI.createOrder(orderData);
      await loadOrders();
      navigate("/orders/list"); // ✅ Chuyển về danh sách sau khi tạo
      return true;
    } catch (error) {
      console.error("Error creating order:", error);
      return false;
    }
  };

  // 🟡 Cập nhật đơn hàng
  const handleUpdateOrder = async (orderId, orderData) => {
    try {
      await salesAPI.updateOrder(orderId, orderData);
      await loadOrders();
      setEditingOrder(null);
      navigate("/orders/list"); // ✅ Quay lại danh sách sau khi cập nhật
      return true;
    } catch (error) {
      console.error("Error updating order:", error);
      return false;
    }
  };

  // 🔵 Hoàn tất đơn hàng
  const handleCompleteOrder = async (orderId) => {
    try {
      await salesAPI.completeOrder(orderId);
      await loadOrders();
      return true;
    } catch (error) {
      console.error("Error completing order:", error);
      return false;
    }
  };

  return (
    <Outlet
      context={{
        orders,
        loading,
        editingOrder,
        setEditingOrder,
        handleCreateOrder,
        handleUpdateOrder,
        handleCompleteOrder,
      }}
    />
  );
};

export default Order;
