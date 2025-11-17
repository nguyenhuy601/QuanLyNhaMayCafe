import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../../components/QuanLyKhoThanhPham/sidebar';
import Header from '../../components/QuanLyKhoThanhPham/header';
import OrdersList from '../../components/QuanLyKhoThanhPham/OrdersList';
import ExportSlip from '../../components/QuanLyKhoThanhPham/ExportSlip';

export default function XuatKhoThanhPham() {
  const [activeMenu, setActiveMenu] = useState('');
  const [orderCount, setOrderCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);

  // UI state
  const [step, setStep] = useState(1); // 1 = danh sách đơn, 2 = phiếu xuất
  const [selectedIds, setSelectedIds] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    setActiveMenu('XuatKhoThanhPham');
    // fetch dữ liệu nếu cần
  }, []);

  // Mock orders list for step 1
  const orders = useMemo(
    () => [
      {
        id: 'OD-001',
        orderCode: 'DH-1001',
        productCode: 'P-1001',
        productName: 'Cà phê Arabica 500g',
        quantity: 10,
        createdAt: '2025-11-01',
        creator: 'NV01',
        status: 'Chờ xuất',
        availableStock: 120,
        lot: 'L-20251101-1',
      },
      {
        id: 'OD-002',
        orderCode: 'DH-1002',
        productCode: 'P-1002',
        productName: 'Cà phê Robusta 1kg',
        quantity: 5,
        createdAt: '2025-11-03',
        creator: 'NV02',
        status: 'Chờ xuất',
        availableStock: 30,
        lot: 'L-20251102-2',
      },
      {
        id: 'OD-003',
        orderCode: 'DH-1003',
        productCode: 'P-1003',
        productName: 'Cà phê Blend 250g',
        quantity: 20,
        createdAt: '2025-11-04',
        creator: 'NV01',
        status: 'Đã duyệt',
        availableStock: 50,
        lot: 'L-20251103-3',
      },
    ],
    []
  );

  const toggleSelect = (id) => {
    // Prevent selecting orders that are already approved ('Đã duyệt')
    const order = orders.find((o) => o.id === id);
    if (!order || order.status === 'Đã duyệt') return;
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const selectAll = (checked) => {
    if (checked) setSelectedIds(orders.filter((o) => o.status !== 'Đã duyệt').map((o) => o.id));
    else setSelectedIds([]);
  };

  const selectedOrders = useMemo(() => orders.filter((o) => selectedIds.includes(o.id)), [orders, selectedIds]);

  // Step 2 editable rows (lot, note) kept in state
  const [issueRows, setIssueRows] = useState([]);

  useEffect(() => {
    if (step === 2) {
      // initialize issueRows from selectedOrders
      const init = selectedOrders.map((o) => ({
        id: o.id,
        orderCode: o.orderCode,
        productCode: o.productCode,
        productName: o.productName,
        lot: o.lot || '',
        quantity: o.quantity,
        availableStock: o.availableStock,
        note: '',
      }));
      setIssueRows(init);
    }
  }, [step]);

  const updateRow = (id, key, value) => {
    setIssueRows((prev) => prev.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  };

  const handleContinue = () => {
    if (selectedIds.length === 0) return;
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleConfirm = () => {
    // Here you would call API to create the export records
    setShowSuccess(true);
    // reset selections after confirm
    setSelectedIds([]);
    setIssueRows([]);
    setStep(1);
  };

  // Inline modal component (copied/adjusted from previous ConfirmSuccessModal)
  const InlineSuccessModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#fffdfb] p-8 rounded-xl shadow-xl border border-[#e5d2b2] w-[420px] text-center relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#8b4513] hover:text-[#b86b36] text-2xl transition"
        >
          ×
        </button>

        <div className="flex justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-[#4a9b5b]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-[#5a2e0f] mb-2">Xuất kho thành công!</h3>
        <p className="text-[#3e2a15] mb-6">Phiếu xuất đã được tạo và lưu vào hệ thống.</p>

        <button
          onClick={onClose}
          className="bg-[#8b4513] hover:bg-[#a0522d] text-white px-6 py-2.5 rounded-md shadow-md transition-all duration-200 hover:shadow-lg"
        >
          Đóng
        </button>
      </div>
    </div>
  );

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
          <h1 className="text-2xl font-semibold mb-4">Xuất kho thành phẩm</h1>

          {step === 1 && (
            <OrdersList
              orders={orders}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onSelectAll={selectAll}
              onContinue={handleContinue}
            />
          )}

          {step === 2 && (
            <ExportSlip issueRows={issueRows} updateRow={updateRow} onBack={handleBack} onConfirm={handleConfirm} />
          )}

          {showSuccess && <InlineSuccessModal onClose={() => setShowSuccess(false)} />}
        </main>
      </div>
    </div>
  );
}