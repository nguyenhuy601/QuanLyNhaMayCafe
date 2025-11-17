import React from 'react';

export default function ExportSlip({ issueRows = [], updateRow = () => {}, onBack = () => {}, onConfirm = () => {} }) {
  return (
    <section className="bg-white rounded shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Phiếu xuất thành phẩm</h2>
        <div className="flex gap-2">
          <button onClick={onBack} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Quay lại</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700">Xác nhận</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Mã đơn hàng</th>
              <th className="px-4 py-2 text-left">Mã sản phẩm</th>
              <th className="px-4 py-2 text-left">Tên sản phẩm</th>
              <th className="px-4 py-2 text-left">Lô sản xuất</th>
              <th className="px-4 py-2 text-right">Số lượng xuất</th>
              <th className="px-4 py-2 text-right">Số lượng tồn kho</th>
              <th className="px-4 py-2 text-left">Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {issueRows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">Không có sản phẩm</td>
              </tr>
            ) : (
              issueRows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2">{r.orderCode}</td>
                  <td className="px-4 py-2">{r.productCode}</td>
                  <td className="px-4 py-2">{r.productName}</td>
                  <td className="px-4 py-2">
                    <input value={r.lot} onChange={(e) => updateRow(r.id, 'lot', e.target.value)} className="border rounded px-2 py-1 w-40" />
                  </td>
                  <td className="px-4 py-2 text-right">{r.quantity}</td>
                  <td className="px-4 py-2 text-right">{r.availableStock}</td>
                  <td className="px-4 py-2">
                    <input value={r.note} onChange={(e) => updateRow(r.id, 'note', e.target.value)} className="border rounded px-2 py-1 w-full" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
