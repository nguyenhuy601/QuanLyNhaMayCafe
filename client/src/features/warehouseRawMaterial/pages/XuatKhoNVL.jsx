import React, { useEffect, useState, useCallback } from "react";
import { getApprovedPlans, createMaterialIssue, getMaterialIssues } from '../../../services/warehouseRawMaterialService';
import useRealtime from '../../../hooks/useRealtime';

const XuatKhoNVL = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [usedPlanIds, setUsedPlanIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ngayXuat: new Date().toISOString().split('T')[0],
    ghiChu: '',
  });

  // Lấy danh sách phiếu xuất đã tạo để kiểm tra kế hoạch đã dùng cho xuất
  const fetchUsedPlans = useCallback(async () => {
    try {
      const issues = await getMaterialIssues();
      // Lấy danh sách ID kế hoạch đã có phiếu xuất (mỗi kế hoạch chỉ được xuất 1 lần)
      const usedIds = new Set(
        issues
          .filter(issue => issue.keHoach)
          .map(issue => issue.keHoach.toString())
      );
      setUsedPlanIds(usedIds);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách phiếu xuất:', err);
    }
  }, []);

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
    fetchUsedPlans();
  }, [fetchPlans, fetchUsedPlans]);

  // Realtime updates
  useRealtime({
    eventHandlers: {
      PLAN_APPROVED: () => {
        fetchPlans();
        fetchUsedPlans();
      },
      PLAN_UPDATED: () => {
        fetchPlans();
        fetchUsedPlans();
      },
      PLAN_READY: () => {
        fetchPlans();
        fetchUsedPlans();
      },
      PLAN_DELETED: () => {
        fetchPlans();
        fetchUsedPlans();
      },
      MATERIAL_ISSUE_CREATED: fetchUsedPlans,
      MATERIAL_ISSUE_APPROVED: fetchUsedPlans,
      plan_events: () => {
        fetchPlans();
        fetchUsedPlans();
      },
      warehouse_events: fetchUsedPlans,
    },
  });

  const handleSelectPlan = (plan) => {
    // Chỉ cho phép chọn kế hoạch chưa được dùng
    if (!usedPlanIds.has(plan._id.toString())) {
      setSelectedPlan(plan);
    }
  };

  const handleCreatePhieuXuat = async () => {
    if (!selectedPlan) {
      alert("Vui lòng chọn một kế hoạch để tạo phiếu xuất.");
      return;
    }

    try {
      // Lấy thông tin nguyên vật liệu từ kế hoạch (từ nvlCanThiet)
      const nvlCanThiet = selectedPlan.nvlCanThiet || [];
      const materialDetails = nvlCanThiet.map(item => ({
        sanPham: item.productId || item._id, // Map đúng với model MaterialIssue
        soLuong: item.soLuong || 0,
        loXuat: `KH-${selectedPlan.maKeHoach}`, // Lô xuất từ kế hoạch
      }));

      // Tạo mã phiếu tự động
      const now = new Date();
      const dateCode = now.toISOString().split('T')[0].replace(/-/g, '');
      const maPhieuXuat = `PX-${dateCode}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const issueData = {
        maPhieuXuat: maPhieuXuat,
        keHoach: selectedPlan._id,
        ngayXuat: formData.ngayXuat || new Date(),
        chiTiet: materialDetails,
        ghiChu: formData.ghiChu,
        trangThai: "Cho xuat", // Mặc định là "Chờ xuất", cần duyệt trước khi trừ kho
      };

      await createMaterialIssue(issueData);
      alert("Tạo phiếu xuất kho thành công!");
      setShowModal(false);
      setSelectedPlan(null);
      setFormData({
        ngayXuat: new Date().toISOString().split('T')[0],
        ghiChu: '',
      });
      // Refresh danh sách kế hoạch đã dùng
      fetchUsedPlans();
    } catch (err) {
      alert("Lỗi khi tạo phiếu xuất: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-[#5d2f18] mb-4">Xuất kho nguyên vật liệu</h2>

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
        <>
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <h3 className="text-lg font-semibold mb-3">Chọn kế hoạch đã duyệt</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#8B4513] text-white text-sm">
                  <th className="py-3 px-4"></th>
                  <th className="py-3 px-4">Mã kế hoạch</th>
                  <th className="py-3 px-4">Tên kế hoạch</th>
                  <th className="py-3 px-4">Ngày bắt đầu</th>
                  <th className="py-3 px-4">Ngày kết thúc</th>
                  <th className="py-3 px-4">Xưởng phụ trách</th>
                </tr>
              </thead>
              <tbody>
                {plans.length > 0 ? (
                  plans
                    .filter(plan => !usedPlanIds.has(plan._id.toString())) // Chỉ hiển thị kế hoạch chưa được xuất
                    .map((plan) => {
                    return (
                      <tr
                        key={plan._id}
                        className={`border-b transition ${
                          selectedPlan?._id === plan._id 
                            ? "bg-[#f1dfc6]" 
                            : "hover:bg-[#f9f4ef]"
                        }`}
                      >
                        <td className="py-2 px-4 text-center">
                          <input
                            type="radio"
                            name="plan"
                            checked={selectedPlan?._id === plan._id}
                            onChange={() => handleSelectPlan(plan)}
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="py-2 px-4">
                          {plan.maKeHoach || plan._id}
                        </td>
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
                        <td className="py-2 px-4">
                          {plan.xuongPhuTrach || 'N/A'}
                        </td>
                      </tr>
                    );
                  })
                ) : plans.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                      Không có kế hoạch nào đã được duyệt
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 px-4 text-center text-gray-500">
                      Tất cả kế hoạch đã được xuất kho
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {selectedPlan && (
            <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
              <h3 className="text-lg font-semibold mb-3">Chi tiết nguyên vật liệu</h3>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200 text-sm">
                    <th className="py-2 px-4">Tên nguyên vật liệu</th>
                    <th className="py-2 px-4">Số lượng</th>
                    <th className="py-2 px-4">Đơn vị</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPlan.nvlCanThiet && selectedPlan.nvlCanThiet.length > 0 ? (
                    selectedPlan.nvlCanThiet.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2 px-4">
                          {item.tenNVL || item.ten || 'N/A'}
                        </td>
                        <td className="py-2 px-4">{item.soLuong || 0}</td>
                        <td className="py-2 px-4">kg</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-4 px-4 text-center text-gray-500">
                        Không có nguyên vật liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={() => setShowModal(true)}
              disabled={!selectedPlan}
              className="px-6 py-3 rounded-lg text-white font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#8B4513" }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = "#A0522D";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = "#8B4513";
                }
              }}
            >
              Tạo phiếu xuất kho NVL
            </button>
          </div>
        </>
      )}

      {/* Modal tạo phiếu xuất */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <h3 className="text-xl font-bold mb-4">Thông tin phiếu xuất</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ngày xuất</label>
                <input
                  type="date"
                  value={formData.ngayXuat}
                  onChange={(e) => setFormData({ ...formData, ngayXuat: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ghi chú</label>
                <textarea
                  value={formData.ghiChu}
                  onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreatePhieuXuat}
                className="flex-1 px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-[#A0522D]"
              >
                Xác nhận
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default XuatKhoNVL;

