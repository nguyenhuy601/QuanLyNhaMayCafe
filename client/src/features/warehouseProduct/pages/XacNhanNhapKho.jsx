import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../api/axiosConfig';
import { CheckCircle2, XCircle, Clock, Package } from 'lucide-react';

export default function XacNhanNhapKho() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/warehouse/products/issues/receipts');
      const allReceipts = Array.isArray(res.data) ? res.data : [];
      // Chỉ lấy các phiếu ở trạng thái "Cho duyet"
      const pendingReceipts = allReceipts.filter(r => r.trangThai === 'Cho duyet');
      setReceipts(pendingReceipts);
      setError(null);
    } catch (err) {
      setError('Không thể lấy danh sách phiếu nhập');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (receiptId) => {
    try {
      setConfirmingId(receiptId);
      await axiosInstance.put(`/warehouse/products/issues/receipts/${receiptId}/confirm`);
      alert('✅ Đã xác nhận nhập kho thành công!');
      // Refresh danh sách
      await fetchReceipts();
    } catch (err) {
      alert('❌ Lỗi xác nhận nhập kho: ' + (err.response?.data?.error || err.message));
    } finally {
      setConfirmingId(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Cho duyet': { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      'Da duyet': { label: 'Đã duyệt', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
      'Da nhap kho': { label: 'Đã nhập kho', color: 'bg-green-100 text-green-700', icon: Package },
      'Da huy': { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: XCircle },
    };
    const statusInfo = statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-700', icon: Clock };
    const Icon = statusInfo.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        <Icon size={14} />
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#5d2f18] mb-2">Xác nhận nhập kho thành phẩm</h1>
          <p className="text-sm text-gray-600">Danh sách phiếu nhập chờ xác nhận từ xưởng trưởng</p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-lg font-semibold">Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {receipts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">Không có phiếu nhập nào chờ xác nhận</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#8B4513] text-white text-sm">
                    <th className="py-3 px-4">Mã phiếu nhập</th>
                    <th className="py-3 px-4">Tên sản phẩm</th>
                    <th className="py-3 px-4">Số lượng</th>
                    <th className="py-3 px-4">Lô sản xuất</th>
                    <th className="py-3 px-4">Ngày sản xuất</th>
                    <th className="py-3 px-4">Hạn sử dụng</th>
                    <th className="py-3 px-4">Kho lưu trữ</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((receipt) => (
                    <tr
                      key={receipt._id}
                      className="border-b hover:bg-amber-50 transition"
                    >
                      <td className="py-3 px-4 font-semibold text-[#5A2E0E]">
                        {receipt.maPhieuNhapTP || 'N/A'}
                      </td>
                      <td className="py-3 px-4">{receipt.sanPhamName || 'N/A'}</td>
                      <td className="py-3 px-4">{receipt.soLuong || 0}</td>
                      <td className="py-3 px-4">{receipt.loSanXuat || 'N/A'}</td>
                      <td className="py-3 px-4">{formatDate(receipt.ngaySanXuat)}</td>
                      <td className="py-3 px-4">{formatDate(receipt.hanSuDung)}</td>
                      <td className="py-3 px-4">{receipt.khoLuuTru || 'N/A'}</td>
                      <td className="py-3 px-4">
                        {getStatusBadge(receipt.trangThai)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleConfirm(receipt._id)}
                          disabled={confirmingId === receipt._id}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                            confirmingId === receipt._id
                              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {confirmingId === receipt._id ? 'Đang xác nhận...' : 'Xác nhận nhập kho'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

