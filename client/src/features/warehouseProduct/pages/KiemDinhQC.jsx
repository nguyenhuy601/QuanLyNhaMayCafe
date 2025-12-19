import React, { useEffect, useMemo, useState } from 'react';
import QCResultTable from '../components/QCResultTable.jsx';
import axiosInstance from '../../../api/axiosConfig';

export default function KiemDinhQC() {
  // Filters
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Chưa kiểm định' | 'Đã kiểm định'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Dữ liệu từ backend (QC results)
  const [qcRequests, setQcRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQcResults = async () => {
      try {
        setLoading(true);
        // Gọi qua API gateway với axiosInstance để có token
        const res = await axiosInstance.get('/qc-result');
        setQcRequests(Array.isArray(res.data) ? res.data : []);
        setError(null);
      } catch (err) {
        setError('Không thể tải danh sách kết quả QC');
      } finally {
        setLoading(false);
      }
    };

    fetchQcResults();
  }, []);

  // Cột hiển thị
  const columns = [
    { key: 'qcRequest.maPhieuQC', label: 'Mã QC' },
    { key: 'qcRequest.sanPham.ProductName', label: 'Tên sản phẩm' },
    { key: 'ngayKiemTra', label: 'Ngày kiểm tra' },
    { key: 'soLuongDat', label: 'Số lượng đạt', align: 'right' },
    { key: 'ketQuaChung', label: 'Kết quả' },
    { key: 'ghiChu', label: 'Ghi chú' },
  ];

  // Lọc dữ liệu
  const filteredData = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : null;
    const to = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : null;

    return qcRequests.filter((row) => {
      // status filter: normalize stored values (Dat | Khong dat)
      if (statusFilter !== 'all') {
        const want = statusFilter === 'Đạt' ? 'Dat' : 'Khong dat';
        if ((row.ketQuaChung || '').toString() !== want) return false;
      }

      // date filter (ngayKiemTra)
      if (from || to) {
        const d = row.ngayKiemTra ? new Date(row.ngayKiemTra).getTime() : null;
        if (from && (!d || d < from)) return false;
        if (to && (!d || d > to)) return false;
      }

      return true;
    });
  }, [qcRequests, statusFilter, dateFrom, dateTo]);

  const resetFilters = () => {
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Kiểm định QC</h1>

          <section className="bg-white rounded shadow p-4 mb-6">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="text-sm text-gray-600 block">Trạng thái</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 block border rounded px-3 py-2"
                >
                  <option value="all">Tất cả</option>
                  <option value="Chưa kiểm định">Chưa kiểm định</option>
                  <option value="Đã kiểm định">Đã kiểm định</option>
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600 block">Từ ngày</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="mt-1 block border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600 block">Đến ngày</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="mt-1 block border rounded px-3 py-2"
                />
              </div>

              <div className="ml-auto flex gap-2">
                <button
                  onClick={resetFilters}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
                >
                  Reset
                </button>
              </div>
            </div>
          </section>

      <section className="bg-white rounded shadow p-4">
        {loading ? (
          <div className="py-8 text-center text-gray-600">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-600">{error}</div>
        ) : (
          <QCResultTable data={filteredData} columns={columns} />
        )}
      </section>
    </div>
  );
}
