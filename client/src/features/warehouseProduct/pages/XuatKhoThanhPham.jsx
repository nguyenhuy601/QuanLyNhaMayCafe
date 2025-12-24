import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axiosInstance from '../../../api/axiosConfig';
import OrdersList from '../components/OrdersList.jsx';
import ExportSlip from '../components/ExportSlip.jsx';
import { fetchProductionPlans, fetchPlanById } from '../../../services/planService';
import { fetchOrders } from '../../../services/orderService';
import useRealtime from '../../../hooks/useRealtime';

export default function XuatKhoThanhPham() {

  // UI state
  const [step, setStep] = useState(1); // 1 = danh sách kế hoạch, 2 = danh sách đơn hàng, 3 = phiếu xuất
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [plans, setPlans] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchProductionPlans();
      // Chỉ lấy kế hoạch đã hoàn thành
      const filteredPlans = data.filter(plan => 
        plan.trangThai === 'Hoàn thành'
      );
      setPlans(filteredPlans);
      setError(null);
    } catch (err) {
      setError('Không thể lấy danh sách kế hoạch');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Realtime updates
  useRealtime({
    eventHandlers: {
      PLAN_UPDATED: fetchPlans,
      PLAN_APPROVED: fetchPlans,
      PLAN_READY: fetchPlans,
      PLAN_DELETED: fetchPlans,
      ORDER_UPDATED: fetchPlans,
      ORDER_APPROVED: fetchPlans,
      plan_events: fetchPlans, // Generic plan events
    },
  });

  const handlePlanSelect = async (planId) => {
    try {
      setLoading(true);
      setSelectedPlanId(planId);
      
      // Lấy chi tiết kế hoạch
      const plan = await fetchPlanById(planId);
      if (!plan || !plan.donHangLienQuan || plan.donHangLienQuan.length === 0) {
        alert('Kế hoạch này không có đơn hàng liên quan');
        setLoading(false);
        return;
      }

      // Lấy danh sách đơn hàng
      const allOrders = await fetchOrders();
      
      // Lọc đơn hàng thuộc kế hoạch này (chỉ lấy đơn đã duyệt và chưa xuất kho)
      const planOrderIds = plan.donHangLienQuan.map(dh => dh.orderId);
      const planOrders = allOrders.filter(order => {
        const orderId = order._id?.toString() || order.maDH;
        const isInPlan = planOrderIds.includes(orderId);
        const isApproved = order.trangThai === 'Đã duyệt';
        const notExported = order.trangThai !== 'Đã xuất kho' && order.trangThai !== 'Đã giao';
        return isInPlan && isApproved && notExported;
      });

      // Transform order data to match component structure
      const transformedOrders = planOrders.map(order => {
        const firstItem = order.chiTiet?.[0];
        const product = firstItem?.sanPham;
        
        return {
          id: order._id,
          orderCode: order.maDH,
          productCode: product?.maSP || '',
          productName: product?.tenSP || '',
          productId: product?._id || '',
          quantity: firstItem?.soLuong || 0,
          createdAt: order.ngayDat ? new Date(order.ngayDat).toLocaleDateString('vi-VN') : '',
          creator: order.nguoiTao?.username || 'N/A',
          status: order.trangThai || 'Chờ xuất',
          availableStock: product?.soLuong || 0,
          customerName: order.khachHang?.tenKH || '',
          customerPhone: order.khachHang?.sdt || '',
          deliveryDate: order.ngayYeuCauGiao ? new Date(order.ngayYeuCauGiao).toLocaleDateString('vi-VN') : '',
          deliveryAddress: order.diaChiGiao || '',
          note: order.ghiChu || '',
        };
      });
      
      setOrders(transformedOrders);
      setStep(2); // Chuyển sang step 2: danh sách đơn hàng
      setError(null);
    } catch (err) {
      setError('Không thể lấy đơn hàng của kế hoạch');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    // Cho phép chọn đơn hàng "Đã duyệt" vì đây là đơn sẵn sàng xuất kho
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const selectAll = (checked) => {
    if (checked) {
      // Cho phép chọn tất cả đơn hàng (đều là "Đã duyệt" và sẵn sàng xuất kho)
      setSelectedIds(orders.map((o) => o.id));
    } else {
      setSelectedIds([]);
    }
  };

  const selectedOrders = useMemo(() => orders.filter((o) => selectedIds.includes(o.id)), [orders, selectedIds]);

  // Step 2 editable rows (note) kept in state
  const [issueRows, setIssueRows] = useState([]);

  useEffect(() => {
    if (step === 3) {
      // initialize issueRows from selectedOrders
      const init = selectedOrders.map((o) => ({
        id: o.id,
        orderCode: o.orderCode,
        productCode: o.productCode,
        productName: o.productName,
        productId: o.productId || o.id, // Add productId for API
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
    setStep(3); // Chuyển sang step 3: phiếu xuất
  };

  const handleBack = () => {
    if (step === 3) {
      setStep(2); // Từ phiếu xuất về danh sách đơn hàng
    } else if (step === 2) {
      setStep(1); // Từ danh sách đơn hàng về danh sách kế hoạch
      setSelectedPlanId(null);
      setOrders([]);
      setSelectedIds([]);
    }
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
            }
          ],
          ghiChu: row.note,
        };
        await axiosInstance.post('/warehouse/products/issues', payload);
      }
      
      setShowSuccess(true);
      // reset selections after confirm
      setSelectedIds([]);
      setIssueRows([]);
      
      // Refresh danh sách đơn hàng để loại bỏ đơn đã xuất
      if (selectedPlanId) {
        // Reload đơn hàng của kế hoạch để cập nhật danh sách (loại bỏ đơn đã xuất)
        await handlePlanSelect(selectedPlanId);
      } else {
        setStep(1);
        setSelectedPlanId(null);
        setOrders([]);
        // Refresh plans list
        await fetchPlans();
      }
    } catch (err) {
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
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Xuất kho thành phẩm</h1>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-lg font-semibold">
            {step === 1 ? 'Đang tải danh sách kế hoạch...' : 'Đang tải đơn hàng...'}
          </p>
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
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 bg-[#8B4513] text-white">
                <h2 className="text-lg font-semibold">Danh sách kế hoạch</h2>
                <p className="text-sm text-amber-200 mt-1">Chọn kế hoạch để xem đơn hàng</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã kế hoạch</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày bắt đầu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày kết thúc</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số đơn hàng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {plans.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                          Không có kế hoạch nào
                        </td>
                      </tr>
                    ) : (
                      plans.map((plan) => {
                        const productName = plan.sanPham?.tenSanPham || plan.sanPham?.tenSP || 'N/A';
                        const orderCount = plan.donHangLienQuan?.length || 0;
                        return (
                          <tr key={plan._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#5A2E0E]">
                              {plan.maKeHoach || plan._id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{productName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{plan.soLuongCanSanXuat || 0}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {plan.ngayBatDauDuKien ? new Date(plan.ngayBatDauDuKien).toLocaleDateString('vi-VN') : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {plan.ngayKetThucDuKien ? new Date(plan.ngayKetThucDuKien).toLocaleDateString('vi-VN') : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{orderCount}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                plan.trangThai === 'Đã duyệt' ? 'bg-green-100 text-green-800' :
                                plan.trangThai === 'Đang thực hiện' ? 'bg-blue-100 text-blue-800' :
                                plan.trangThai === 'Hoàn thành' ? 'bg-gray-100 text-gray-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {plan.trangThai || 'Chờ duyệt'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                              <button
                                onClick={() => handlePlanSelect(plan._id)}
                                disabled={orderCount === 0}
                                className={`px-4 py-2 rounded-md text-white ${
                                  orderCount === 0 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-[#8B4513] hover:bg-[#A0522D]'
                                }`}
                              >
                                {orderCount === 0 ? 'Không có đơn hàng' : 'Xem đơn hàng'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  ← Quay lại danh sách kế hoạch
                </button>
                <h2 className="text-xl font-semibold">Danh sách đơn hàng</h2>
                <div className="w-32"></div>
              </div>
              <OrdersList
                orders={orders}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelect}
                onSelectAll={selectAll}
                onContinue={handleContinue}
              />
            </div>
          )}

          {step === 3 && (
            <ExportSlip issueRows={issueRows} updateRow={updateRow} onBack={handleBack} onConfirm={handleConfirm} />
          )}
        </>
      )}

      {showSuccess && <InlineSuccessModal onClose={() => setShowSuccess(false)} />}
    </div>
  );
}