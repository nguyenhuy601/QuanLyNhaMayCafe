import React, { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../../../api/axiosConfig';
import Sidebar from '../components/sidebar.jsx';
import Header from '../components/header.jsx';
import OrdersList from '../components/OrdersList.jsx';
import ExportSlip from '../components/ExportSlip.jsx';

export default function XuatKhoThanhPham() {
  const [activeMenu, setActiveMenu] = useState('');
  const [orderCount, setOrderCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);

  // UI state
  const [step, setStep] = useState(1); // 1 = danh sách đơn, 2 = phiếu xuất
  const [selectedIds, setSelectedIds] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setActiveMenu('XuatKhoThanhPham');
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Call sales service directly to get orders (use axios instance so token is attached)
      const res = await axiosInstance.get('http://localhost:3008/orders');
      
      // Transform order data to match component structure
      const transformedOrders = (Array.isArray(res.data) ? res.data : []).map(order => {
        // Get first product from chiTiet
        const firstItem = order.chiTiet?.[0];
        const product = firstItem?.sanPham;
        
        return {
          id: order._id,
          orderCode: order.maDH,
          productCode: product?.maSP || '',
          productName: product?.tenSP || '',
          productId: product?._id || '', // Add productId for API calls
          quantity: firstItem?.soLuong || 0,
          createdAt: order.ngayDat ? new Date(order.ngayDat).toLocaleDateString('vi-VN') : '',
          creator: order.nguoiTao?.username || 'N/A',
          status: order.trangThai || 'Chờ xuất',
          availableStock: product?.soLuong || 0,
          lot: product?.loSanXuat || '',
          customerName: order.khachHang?.tenKH || '',
          customerPhone: order.khachHang?.sdt || '',
          deliveryDate: order.ngayYeuCauGiao ? new Date(order.ngayYeuCauGiao).toLocaleDateString('vi-VN') : '',
          deliveryAddress: order.diaChiGiao || '',
          note: order.ghiChu || '',
        };
      });
      
      setOrders(transformedOrders);
      setError(null);
    } catch (err) {
      console.error('Lỗi lấy danh sách đơn hàng:', err.response?.data || err.message || err);
      setError('Không thể lấy danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

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
        productId: o.productId || o.id, // Add productId for API
        lot: o.lot || '',
        quantity: o.quantity,
        availableStock: o.availableStock,
        note: '',
      }));
      setIssueRows(init);
    }
  }, [step, selectedOrders]);

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

  const handleConfirm = async () => {
    try {
      // Create export slip for each selected order
      for (const row of issueRows) {
        const payload = {
          donHang: row.id,
          chiTiet: [
            {
              sanPham: row.productId,
              soLuong: row.quantity,
              loXuat: row.lot,
            }
          ],
          ghiChu: row.note,
        };
        await axiosInstance.post('http://localhost:3009/warehouse/issues', payload);
      }
      
      setShowSuccess(true);
      // reset selections after confirm
      setSelectedIds([]);
      setIssueRows([]);
      setStep(1);
      
      // Refresh orders list
      await fetchOrders();
    } catch (err) {
      console.error("Lỗi tạo phiếu xuất:", err.response?.data || err.message || err);
      alert("Lỗi tạo phiếu xuất: " + (err.response?.data?.error || err.message));
    }
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

          {loading && (
            <div className="flex items-center justify-center py-12">
              <p className="text-lg font-semibold">Đang tải danh sách đơn hàng...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!loading && (
            <>
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}