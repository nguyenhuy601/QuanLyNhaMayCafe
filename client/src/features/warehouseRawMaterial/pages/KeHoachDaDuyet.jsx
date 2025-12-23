import React, { useEffect, useState, useCallback } from 'react';
import { getApprovedPlans } from '../../../services/warehouseRawMaterialService';
import useRealtime from '../../../hooks/useRealtime';

export default function KeHoachDaDuyet() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getApprovedPlans();
      setPlans(data);
      setError(null);
    } catch (err) {
      setError('Không thể tải danh sách kế hoạch đã duyệt');
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
      PLAN_APPROVED: fetchPlans,
      PLAN_UPDATED: fetchPlans,
      PLAN_READY: fetchPlans,
      PLAN_DELETED: fetchPlans,
      plan_events: fetchPlans, // Generic plan events
    },
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Danh sách kế hoạch đã duyệt</h1>

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

      {!loading && (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#8B4513] text-white text-sm">
                <th className="py-3 px-4">Mã kế hoạch</th>
                <th className="py-3 px-4">Tên kế hoạch</th>
                <th className="py-3 px-4">Ngày bắt đầu</th>
                <th className="py-3 px-4">Ngày kết thúc</th>
                <th className="py-3 px-4">Xưởng phụ trách</th>
                <th className="py-3 px-4">Ngày duyệt</th>
                <th className="py-3 px-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {plans.length > 0 ? (
                plans.map((plan) => (
                  <tr
                    key={plan._id}
                    className="border-b hover:bg-[#f9f4ef] transition"
                  >
                    <td className="py-2 px-4">{plan.maKeHoach || plan._id}</td>
                    <td className="py-2 px-4">
                      {plan.sanPham?.tenSanPham || plan.maKeHoach || 'Kế hoạch sản xuất'}
                    </td>
                    <td className="py-2 px-4">
                      {plan.ngayBatDauDuKien
                        ? new Date(plan.ngayBatDauDuKien).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </td>
                    <td className="py-2 px-4">
                      {plan.ngayKetThucDuKien
                        ? new Date(plan.ngayKetThucDuKien).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </td>
                    <td className="py-2 px-4">{plan.xuongPhuTrach || 'N/A'}</td>
                    <td className="py-2 px-4">
                      {plan.ngayDuyet
                        ? new Date(plan.ngayDuyet).toLocaleDateString('vi-VN')
                        : 'N/A'}
                    </td>
                    <td className="py-2 px-4">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {plan.trangThai || 'Đã duyệt'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-4 px-4 text-center text-gray-500">
                    Không có kế hoạch nào đã được duyệt
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

