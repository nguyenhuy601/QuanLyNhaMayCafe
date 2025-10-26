import React from 'react';
import { Check, Plus } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

const PlanTable = ({ 
  activeFilter, 
  setActiveFilter, 
  orders, 
  loading, 
  selectedOrders, 
  onSelectOrder, 
  onApprove,
  activeMenu 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-amber-700 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveFilter('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeFilter === 'approved'
                ? 'bg-amber-700 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Sản phẩm
          </button>
        </div>

        <div className="grid grid-cols-12 gap-4 bg-amber-700 text-white px-4 py-3 rounded-lg text-sm font-medium">
          <div className="col-span-1">Mã đơn hàng</div>
          <div className="col-span-2">Tên sản phẩm</div>
          <div className="col-span-2">Số lượng sản phẩm</div>
          <div className="col-span-2">Ngày bắt đầu</div>
          <div className="col-span-2">Ngày kết thúc</div>
          <div className="col-span-1">Trạng thái</div>
          <div className="col-span-2 text-center">Điều chỉnh</div>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Không có đơn hàng nào</div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order._id}
                className="grid grid-cols-12 gap-4 items-center px-4 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="col-span-1 font-medium text-gray-900">
                  {order.maDH}
                </div>
                <div className="col-span-2 text-gray-700">
                  {order.chiTiet[0]?.sanPham.tenSP}
                </div>
                <div className="col-span-2 text-gray-700">
                  {order.chiTiet[0]?.soLuong}/{order.chiTiet[0]?.sanPham.donViTinh}
                </div>
                <div className="col-span-2 text-gray-700">
                  {formatDate(order.ngayDat)}
                </div>
                <div className="col-span-2 text-gray-700">
                  {formatDate(order.ngayYeuCauGiao)}
                </div>
                <div className="col-span-1">
                  <span className={`text-sm font-medium ${
                    order.trangThai === 'Da duyet' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {order.trangThai === 'Da duyet' ? 'Đã duyệt' : 'Đã duyệt'}
                  </span>
                </div>
                <div className="col-span-2 flex justify-center">
                  <button
                    onClick={() => onSelectOrder(order._id)}
                    className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-colors ${
                      selectedOrders.includes(order._id)
                        ? 'bg-green-600 border-green-600'
                        : order.trangThai === 'Da duyet'
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {(selectedOrders.includes(order._id) || order.trangThai === 'Da duyet') && (
                      <Check size={16} className="text-white" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeMenu === 'production' && selectedOrders.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={onApprove}
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium transition-colors"
            >
              Tạo kế hoạch
            </button>
          </div>
        )}

        {activeMenu === 'list' && (
          <div className="mt-6 flex justify-end">
            <button
              className="px-6 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={18} />
              Tạo kế hoạch
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanTable;