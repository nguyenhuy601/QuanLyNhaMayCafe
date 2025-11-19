import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, List, TrendingUp } from 'lucide-react';

const OrderHome = () => {
  return (
    <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-700 mb-2">
                  CHÀO MỪNG ĐẾN VỚI QUẢN LÝ ĐƠN HÀNG
                </h1>
                <p className="text-gray-500">Hệ thống quản lý đơn hàng</p>
              </div>
            </div>
  );
};

export default OrderHome;
