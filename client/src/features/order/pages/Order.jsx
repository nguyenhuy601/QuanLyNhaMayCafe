import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { salesAPI } from "../../../services/salesService";
import useRealtime from "../../../hooks/useRealtime";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔄 Tải danh sách đơn hàng
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await salesAPI.getOrders();
      setOrders(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Realtime updates
  useRealtime({
    eventHandlers: {
      ORDER_CREATED: loadOrders,
      ORDER_UPDATED: loadOrders,
      ORDER_APPROVED: loadOrders,
      ORDER_REJECTED: loadOrders,
      director_events: loadOrders, // Generic director events
      order_events: loadOrders,
    },
  });

  // 🟢 Tạo đơn hàng
  const handleCreateOrder = async (orderData) => {
    try {
      const result = await salesAPI.createOrder(orderData);
      // Nếu result là null, có nghĩa là đã redirect về login (401 handled)
      if (result === null) {
        return false;
      }
      await loadOrders();
      navigate("/orders/list"); // ✅ Chuyển về danh sách sau khi tạo
      return true;
    } catch (error) {
      // Nếu error đã được xử lý (401), không log lại
      if (error.isHandled || error.message === "Token đã hết hạn") {
        return false;
      }
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
