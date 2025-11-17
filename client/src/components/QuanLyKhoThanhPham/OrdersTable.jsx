import React from 'react';

export default function OrdersTable({ orders = [], selectedIds = [], onToggleSelect = () => {}, onSelectAll = () => {} }) {
  // allChecked should consider only selectable orders (exclude status 'Đã duyệt')
  const selectableOrders = orders.filter((o) => o.status !== 'Đã duyệt');
  const allChecked = selectableOrders.length > 0 && selectableOrders.every((o) => selectedIds.includes(o.id));

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">
              <input type="checkbox" checked={allChecked} onChange={(e) => onSelectAll(e.target.checked)} />
            </th>
            <th className="px-4 py-2 text-left">Mã đơn hàng</th>
            <th className="px-4 py-2 text-left">Mã sản phẩm</th>
            <th className="px-4 py-2 text-left">Tên sản phẩm</th>
            <th className="px-4 py-2 text-right">Số lượng xuất</th>
            <th className="px-4 py-2 text-left">Ngày tạo</th>
            <th className="px-4 py-2 text-left">Người tạo</th>
            <th className="px-4 py-2 text-left">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
            {orders.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="px-4 py-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(o.id)}
                  disabled={o.status === 'Đã duyệt'}
                  onChange={() => {
                    if (o.status === 'Đã duyệt') return;
                    onToggleSelect(o.id);
                  }}
                />
                {o.status === 'Đã duyệt' && (
                  <span className="ml-2 text-sm text-gray-500">(Đã duyệt)</span>
                )}
              </td>
              <td className="px-4 py-2">{o.orderCode}</td>
              <td className="px-4 py-2">{o.productCode}</td>
              <td className="px-4 py-2">{o.productName}</td>
              <td className="px-4 py-2 text-right">{o.quantity}</td>
              <td className="px-4 py-2">{o.createdAt}</td>
              <td className="px-4 py-2">{o.creator}</td>
              <td className="px-4 py-2">{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
