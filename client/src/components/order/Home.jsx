import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, List, TrendingUp } from 'lucide-react';

const OrderHome = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Chào mừng đến với Coffee App</h1>
      <p className="text-gray-600">Hệ thống quản lý đơn hàng cho nhân viên bán hàng</p> 
    </div>
  );
};

export default OrderHome;