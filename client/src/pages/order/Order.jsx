import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { salesAPI } from "../../services/salesService";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

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

  const handleCreateOrder = async (orderData) => {
    try {
      await salesAPI.createOrder(orderData);
      await loadOrders();
      return true;
    } catch (error) {
      console.error("Error creating order:", error);
      return false;
    }
  };

  const handleUpdateOrder = async (orderId, orderData) => {
    try {
      await salesAPI.updateOrder(orderId, orderData);
      await loadOrders();
      setEditingOrder(null);
      return true;
    } catch (error) {
      console.error("Error updating order:", error);
      return false;
    }
  };

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
