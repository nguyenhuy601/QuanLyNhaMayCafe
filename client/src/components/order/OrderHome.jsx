import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, List, TrendingUp } from 'lucide-react';

const OrderHome = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gradient-to-b from-amber-50 to-amber-100 rounded-2">
      <h1 className="text-4xl font-bold text-amber-800 mb-3">
        Chào mừng đến với Coffee App
      </h1>
      <p className="text-gray-700 text-lg max-w-md">
        Hệ thống quản lý đơn hàng cho nhân viên bán hàng
      </p>
    </div>
  );
};

export default OrderHome;
