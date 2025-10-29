import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/PlanManagement/Sidebar';
import Header from '../../components/PlanManagement/Header';
import PlanTable from '../../components/PlanManagement/PlanTable';
import PlanListView from '../../components/PlanManagement/PlanListView';
import { fetchOrders, approveOrders } from '../../services/orderService';

const PlanManagement = () => {
  const [activeMenu, setActiveMenu] = useState('production');
  const [activeFilter, setActiveFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
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
  };

  const getFilteredOrders = () => {
    if (activeFilter === 'all') return orders;
    if (activeFilter === 'approved') return orders.filter(o => o.trangThai === 'Da duyet');
    return orders;
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
          ? { ...order, trangThai: 'Da duyet' }
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
        approvedCount={orders.filter(o => o.trangThai === 'Da duyet').length}
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
            />
          )}

          {/* Hiển thị PlanListView cho menu 'list' */}
          {activeMenu === 'list' && (
            <PlanListView
              plans={orders}
              loading={loading}
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