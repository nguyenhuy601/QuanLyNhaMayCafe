import React from 'react';

export default function OrdersTable({ orders = [], selectedIds = [], onToggleSelect = () => {}, onSelectAll = () => {} }) {
  // Cho phép chọn tất cả đơn hàng (đơn "Đã duyệt" là đơn sẵn sàng xuất kho)
  const allChecked = orders.length > 0 && orders.every((o) => selectedIds.includes(o.id));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full table-auto divide-y divide-gray-100">
        <thead className="bg-[#8B4513]">
          <tr>
            <th className="px-4 py-3">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="accent-emerald-600"
              />
            </th>
            <th className="px-4 py-3 text-left text-white text-sm font-semibold uppercase tracking-wider">Mã đơn hàng</th>
            <th className="px-4 py-3 text-left text-white text-sm font-semibold uppercase tracking-wider">Mã sản phẩm</th>
            <th className="px-4 py-3 text-left text-white text-sm font-semibold uppercase tracking-wider">Tên sản phẩm</th>
            <th className="px-4 py-3 text-right text-white text-sm font-semibold uppercase tracking-wider">Số lượng xuất</th>
            <th className="px-4 py-3 text-left text-white text-sm font-semibold uppercase tracking-wider">Ngày tạo</th>
            <th className="px-4 py-3 text-left text-white text-sm font-semibold uppercase tracking-wider">Người tạo</th>
            <th className="px-4 py-3 text-left text-white text-sm font-semibold uppercase tracking-wider">Trạng thái</th>
          </tr>
        </thead>
        <tbody className="bg-white">
            {orders.map((o) => (
            <tr key={o.id} className="border-t odd:bg-white even:bg-gray-50 hover:bg-[#f9f4ef]">
              <td className="px-4 py-3 align-top">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(o.id)}
                  onChange={() => onToggleSelect(o.id)}
                  style={{ accentColor: '#8B4513' }}
                />
              </td>
              <td className="px-4 py-3 text-sm text-gray-700">{o.orderCode}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{o.productCode}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{o.productName}</td>
              <td className="px-4 py-3 text-sm text-gray-700 text-right">{o.quantity}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{o.createdAt}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{o.creator}</td>
              <td className="px-4 py-3 text-sm">
                {o.status === 'Đã duyệt' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f1dfc6] text-[#5d2f18]">Đã duyệt</span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f1dfc6] text-[#5d2f18]">{o.status}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
