import React from 'react';
import OrdersTable from './OrdersTable';

export default function OrdersList({ orders = [], selectedIds = [], onToggleSelect, onSelectAll, onContinue }) {
  return (
    <section className="bg-white rounded shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Danh sách đơn hàng</h2>
        <div>
          <button
            onClick={onContinue}
            disabled={selectedIds.length === 0}
            className={`px-4 py-2 rounded text-white ${selectedIds.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
            Tiếp tục ({selectedIds.length})
          </button>
        </div>
      </div>

      <OrdersTable orders={orders} selectedIds={selectedIds} onToggleSelect={onToggleSelect} onSelectAll={onSelectAll} />
    </section>
  );
}
