import React, { useEffect, useState } from 'react';
import { getMaterialReceipts, getMaterialIssues } from '../../../services/warehouseRawMaterialService';

export default function ThongKe() {
  const [receipts, setReceipts] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('receipts'); // 'receipts' or 'issues'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [receiptsData, issuesData] = await Promise.all([
        getMaterialReceipts(),
        getMaterialIssues(),
      ]);
      setReceipts(receiptsData);
      setIssues(issuesData);
      setError(null);
    } catch (err) {
      setError('Không thể tải dữ liệu thống kê');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Thống kê kho nguyên vật liệu</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('receipts')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'receipts'
                  ? 'border-b-2 border-[#8B4513] text-[#8B4513]'
                  : 'text-gray-600 hover:text-[#8B4513]'
              }`}
            >
              Phiếu nhập ({receipts.length})
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'issues'
                  ? 'border-b-2 border-[#8B4513] text-[#8B4513]'
                  : 'text-gray-600 hover:text-[#8B4513]'
              }`}
            >
              Phiếu xuất ({issues.length})
            </button>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">Đang tải dữ liệu...</div>
          ) : (
            <>
              {activeTab === 'receipts' && (
                <table className="w-full text-left border-collapse">
              <thead>
                    <tr className="bg-[#8B4513] text-white text-sm">
                      <th className="py-3 px-4">Mã phiếu</th>
                      <th className="py-3 px-4">Ngày nhập</th>
                      <th className="py-3 px-4">Kế hoạch</th>
                      <th className="py-3 px-4">Số lượng NVL</th>
                  <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.length > 0 ? (
                      receipts.map((receipt) => (
                        <tr key={receipt._id} className="border-b hover:bg-[#f9f4ef]">
                          <td className="py-2 px-4">{receipt.maPhieu || receipt._id}</td>
                          <td className="py-2 px-4">
                            {receipt.ngayNhap
                              ? new Date(receipt.ngayNhap).toLocaleDateString('vi-VN')
                              : 'N/A'}
                          </td>
                          <td className="py-2 px-4">
                        {receipt.keHoach?.maKeHoach || receipt.keHoach?.tenKeHoach || receipt.keHoach || 'N/A'}
                          </td>
                          <td className="py-2 px-4">
                            {receipt.chiTiet?.length || 0} loại
                          </td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                          {receipt.trangThai || '—'}
                        </span>
                      </td>
                          <td className="py-2 px-4">{receipt.ghiChu || '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-4 px-4 text-center text-gray-500">
                          Chưa có phiếu nhập nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}

              {activeTab === 'issues' && (
                <table className="w-full text-left border-collapse">
              <thead>
                    <tr className="bg-[#8B4513] text-white text-sm">
                      <th className="py-3 px-4">Mã phiếu</th>
                      <th className="py-3 px-4">Ngày xuất</th>
                      <th className="py-3 px-4">Kế hoạch</th>
                      <th className="py-3 px-4">Số lượng NVL</th>
                  <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.length > 0 ? (
                      issues.map((issue) => (
                        <tr key={issue._id} className="border-b hover:bg-[#f9f4ef]">
                          <td className="py-2 px-4">{issue.maPhieu || issue._id}</td>
                          <td className="py-2 px-4">
                            {issue.ngayXuat
                              ? new Date(issue.ngayXuat).toLocaleDateString('vi-VN')
                              : 'N/A'}
                          </td>
                          <td className="py-2 px-4">
                        {issue.keHoach?.maKeHoach || issue.keHoach?.tenKeHoach || issue.keHoach || 'N/A'}
                          </td>
                          <td className="py-2 px-4">
                            {issue.chiTiet?.length || 0} loại
                          </td>
                      <td className="py-2 px-4">
                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                          {issue.trangThai || '—'}
                        </span>
                      </td>
                          <td className="py-2 px-4">{issue.ghiChu || '—'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-4 px-4 text-center text-gray-500">
                          Chưa có phiếu xuất nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


