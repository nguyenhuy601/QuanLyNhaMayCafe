import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import Header from '../components/Header.jsx';
import PlanTable from '../components/PlanTable.jsx';
import PlanListView from '../components/PlanListView.jsx';
import { fetchOrders, approveOrders } from '../../../services/orderService';
import { fetchProductionPlans } from "../../../services/planService";
import useAutoRefresh from "../../../hooks/useAutoRefresh";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";
import { getToken } from "../../../utils/auth";

const REALTIME_URL = import.meta.env.VITE_REALTIME_URL || "http://localhost:4100";

const PlanManagement = () => {
  const [activeMenu, setActiveMenu] = useState('production');
  const [activeFilter, setActiveFilter] = useState('approved');
  const [orders, setOrders] = useState([]);
  const [planList, setPlanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [isPlanModalOpen, setPlanModalOpen] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const socketRef = useRef(null);
  const ordersRefreshTimeoutRef = useRef(null);
  const plansRefreshTimeoutRef = useRef(null);
  const authStore = useSelector((state) => state.user);

  const loadPlans = useCallback(async () => {
    try {
      const data = await fetchProductionPlans();
      setPlanList(data);
    } catch (err) {
      console.error("Lỗi tải kế hoạch:", err);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      alert('Có lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
    loadPlans();
  }, [loadOrders, loadPlans]);

  // Khi socket connected, tăng interval lên (vì đã có realtime updates)
  // Khi socket disconnected, dùng interval ngắn hơn (fallback polling)
  const ordersInterval = isSocketConnected ? 60000 : 15000; // 60s nếu có socket, 15s nếu không
  const plansInterval = isSocketConnected ? 60000 : 20000; // 60s nếu có socket, 20s nếu không
  
  useAutoRefresh(loadOrders, { interval: ordersInterval, runOnFocus: !isPlanModalOpen });
  useAutoRefresh(loadPlans, { interval: plansInterval, runOnFocus: !isPlanModalOpen });

  useEffect(() => {
    // Lấy token bằng helper function (từ sessionStorage/localStorage/window)
    const token = authStore?.token || getToken();
    
    if (!token) {
      console.warn("⚠️ No token available for WebSocket connection");
      // Nếu không có token nhưng đã có socket, cleanup
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Nếu đã có socket và đang connected với cùng token, không tạo mới
    if (socketRef.current?.connected) {
      console.log("ℹ️ Socket already connected, skipping...");
      return;
    }

    // Nếu đã có socket nhưng chưa connected hoặc token thay đổi, cleanup trước
    if (socketRef.current) {
      console.log("🔄 Cleaning up existing socket connection...");
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    console.log("🔌 Connecting to realtime service with token...");
    
    // Thử kết nối với polling trước, sau đó upgrade lên websocket nếu có thể
    // Điều này tránh lỗi "WebSocket is closed before connection established"
    const socket = io(REALTIME_URL, {
      transports: ["polling", "websocket"], // Polling trước để tránh websocket error
      withCredentials: true,
      auth: { token },
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: Infinity,
      timeout: 20000,
      forceNew: false,
      upgrade: true, // Tự động upgrade từ polling lên websocket khi có thể
      rememberUpgrade: true, // Nhớ transport đã upgrade
    });
    socketRef.current = socket;

    // Debounce để tránh refresh quá nhanh khi có nhiều events
    const debouncedRefreshOrders = () => {
      if (ordersRefreshTimeoutRef.current) clearTimeout(ordersRefreshTimeoutRef.current);
      ordersRefreshTimeoutRef.current = setTimeout(() => {
        loadOrders();
      }, 500); // Debounce 500ms
    };
    
    const debouncedRefreshPlans = () => {
      if (plansRefreshTimeoutRef.current) clearTimeout(plansRefreshTimeoutRef.current);
      plansRefreshTimeoutRef.current = setTimeout(() => {
        loadPlans();
      }, 500); // Debounce 500ms
    };

    // Sử dụng functions trực tiếp để luôn dùng version mới nhất
    socket.on("connect", () => {
      console.log("✅ Connected to realtime service");
      setIsSocketConnected(true);
    });

    socket.on("ORDER_APPROVED", debouncedRefreshOrders);
    socket.on("ORDER_UPDATED", debouncedRefreshOrders);
    socket.on("PLAN_READY", debouncedRefreshPlans);
    socket.on("PLAN_UPDATED", debouncedRefreshPlans);
    socket.on("PLAN_DELETED", debouncedRefreshPlans);

    socket.on("connect_error", (err) => {
      // Chỉ log error nghiêm trọng, bỏ qua websocket connection errors vì đã có polling fallback
      if (err.message.includes("token") || err.message.includes("Invalid")) {
        console.error("❌ Realtime socket authentication error:", err.message);
        console.error("⚠️ Authentication failed. Please login again.");
      } else if (err.message.includes("websocket error") || err.message.includes("WebSocket is closed")) {
        // Suppress websocket errors vì đã có polling fallback
        console.log("ℹ️ WebSocket unavailable, using polling transport...");
      } else {
        console.warn("⚠️ Realtime service connection issue:", err.message);
        console.warn("⚠️ Continuing with polling refresh...");
      }
    });

    socket.on("disconnect", (reason) => {
      console.warn(`⚠️ Disconnected from realtime service: ${reason}`);
      setIsSocketConnected(false);
      
      // Tự động reconnect cho các lý do có thể recover được
      if (reason === "io server disconnect") {
        // Server force disconnect - cần reconnect manually
        console.log("🔄 Server disconnected. Reconnecting...");
        socket.connect();
      } else if (reason === "transport close" || reason === "ping timeout" || reason === "transport error") {
        // Transport issues - sẽ tự động reconnect nhờ reconnection config
        console.log("🔄 Connection lost due to transport issue. Will auto-reconnect...");
      } else {
        // Các lý do khác - vẫn thử reconnect
        console.log("🔄 Will attempt to reconnect...");
      }
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Reconnecting to realtime service (attempt ${attemptNumber})...`);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`✅ Reconnected to realtime service after ${attemptNumber} attempts`);
    });

    socket.on("reconnect_failed", () => {
      console.warn("⚠️ Failed to reconnect to realtime service. Using polling fallback.");
    });

    // Track transport changes
    socket.on("upgrade", () => {
      console.log("⬆️ Transport upgraded to websocket");
    });

    socket.on("upgradeError", (err) => {
      console.warn("⚠️ Transport upgrade failed, staying on polling:", err.message);
    });

    return () => {
      // Cleanup chỉ khi component unmount hoặc token thay đổi
      if (socketRef.current === socket) {
        console.log("🧹 Cleaning up socket connection...");
        // Clear debounce timeouts
        if (ordersRefreshTimeoutRef.current) clearTimeout(ordersRefreshTimeoutRef.current);
        if (plansRefreshTimeoutRef.current) clearTimeout(plansRefreshTimeoutRef.current);
        socket.removeAllListeners(); // Remove tất cả listeners để đảm bảo cleanup sạch
        socket.disconnect();
        socketRef.current = null;
        setIsSocketConnected(false);
      }
    };
  }, [authStore?.token, loadOrders, loadPlans]); // Include loadOrders và loadPlans để đảm bảo handlers luôn mới nhất

  const getFilteredOrders = () => {
    return orders.filter(o => o.trangThai === 'Đã duyệt');
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      }
      return [...prev, orderId];
    });
  };

  const handleApproveOrders = async () => {
    try {
      await approveOrders(selectedOrders);
      setOrders(orders.map(order => 
        selectedOrders.includes(order._id) 
          ? { ...order, trangThai: 'Đã duyệt' }
          : order
      ));
      setSelectedOrders([]);
      alert('Đã duyệt kế hoạch thành công!');
    } catch (error) {
      console.error('Error approving orders:', error);
      alert('Có lỗi xảy ra khi duyệt kế hoạch');
    }
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeMenu={activeMenu} 
        setActiveMenu={setActiveMenu}
        orderCount={orders.length}
        approvedCount={planList.length}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 overflow-auto p-6">
          {activeMenu === 'home' && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-700 mb-2">
                  CHÀO MỪNG ĐẾN VỚI QUẢN LÝ KẾ HOẠCH
                </h1>
                <p className="text-gray-500">Hệ thống quản lý kế hoạch sản xuất</p>
              </div>
            </div>
          )}

          {/* Hiển thị PlanTable cho menu 'production' */}
          {activeMenu === 'production' && (
            <PlanTable
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              orders={filteredOrders}
              loading={loading}
              selectedOrders={selectedOrders}
              onSelectOrder={handleSelectOrder}
              onApprove={handleApproveOrders}
              activeMenu={activeMenu}
              onModalStateChange={setPlanModalOpen}
            />
          )}

          {/* Hiển thị PlanListView cho menu 'list' */}
          {activeMenu === 'list' && (
            <PlanListView
              onView={(plan) => console.log('View:', plan)}
              onEdit={(plan) => console.log('Edit:', plan)}
              onDelete={(id) => console.log('Delete:', id)}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default PlanManagement;