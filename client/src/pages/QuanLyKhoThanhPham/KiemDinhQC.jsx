import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/QuanLyKhoThanhPham/sidebar';
import Header from '../../components/QuanLyKhoThanhPham/header';
import QCResultTable from '../../components/QuanLyKhoThanhPham/QCResultTable';

export default function KiemDinhQC() {
  const [activeMenu, setActiveMenu] = useState('');
  const [orderCount, setOrderCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Đạt' | 'Không đạt'
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    setActiveMenu('KiemDinhQC');
    // fetch dữ liệu kiểm định nếu cần, cập nhật approvedCount...
  }, []);

  // Mock data for testing
  const mockData = [
    {
      qcCode: 'QC-001',
      productCode: 'P-1001',
      productName: 'Cà phê Arabica 500g',
      date: '2025-10-25',
      standard: 'Độ ẩm <= 12%',
      result: 'Đạt',
      quantity: 100,
      note: 'OK',
    },
    {
      qcCode: 'QC-002',
      productCode: 'P-1002',
      productName: 'Cà phê Robusta 1kg',
      date: '2025-10-30',
      standard: 'Hương vị chuẩn',
      result: 'Không đạt',
      quantity: 20,
      note: 'Mùi lạ',
    },
    {
      qcCode: 'QC-003',
      productCode: 'P-1003',
      productName: 'Cà phê Blend 250g',
      date: '2025-11-02',
      standard: 'Kích thước hạt',
      result: 'Đạt',
      quantity: 50,
      note: '',
    },
  ];

  const columns = [
    { key: 'qcCode', label: 'Mã QC' },
    { key: 'productCode', label: 'Mã sản phẩm' },
    { key: 'productName', label: 'Tên sản phẩm' },
    { key: 'date', label: 'Ngày kiểm định' },
    { key: 'standard', label: 'Tiêu chuẩn' },
    { key: 'result', label: 'Kết quả' },
    { key: 'quantity', label: 'Số lượng', align: 'right' },
    { key: 'note', label: 'Ghi chú' },
  ];

  // Filtering logic
  const filteredData = useMemo(() => {
    const from = dateFrom ? new Date(dateFrom).setHours(0, 0, 0, 0) : null;
    const to = dateTo ? new Date(dateTo).setHours(23, 59, 59, 999) : null;

    return mockData.filter((row) => {
      // status filter
      if (statusFilter !== 'all' && row.result !== statusFilter) return false;

      // date filter
      if (from || to) {
        const d = new Date(row.date).getTime();
        if (from && d < from) return false;
        if (to && d > to) return false;
      }

      return true;
    });
  }, [mockData, statusFilter, dateFrom, dateTo]);

  const resetFilters = () => {
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        orderCount={orderCount}
        approvedCount={approvedCount}
      />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-6">
          <h1 className="text-2xl font-semibold mb-4">Kiểm định QC</h1>

          <section className="bg-white rounded shadow p-4 mb-6">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="text-sm text-gray-600 block">Trạng thái</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="mt-1 block border rounded px-3 py-2">
                  <option value="all">Tất cả</option>
                  <option value="Đạt">Đạt</option>
                  <option value="Không đạt">Không đạt</option>
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
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
                  Reset
                </button>
              </div>
            </div>
          </section>

          <section className="bg-white rounded shadow p-4">
            <QCResultTable data={filteredData} columns={columns} />
          </section>
        </main>
      </div>
    </div>
  );
}