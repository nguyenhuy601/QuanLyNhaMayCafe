import React, { useState, useEffect } from "react";
import { ClipboardList, Plus, Calendar, Users, Package } from "lucide-react";
import { fetchPlans, fetchPlanById } from "../../../services/factoryService";
import { fetchTeams } from "../../../services/factoryService";
import axiosInstance from "../../../api/axiosConfig";

export default function PhanCongCongViec() {
  const [plans, setPlans] = useState([]);
  const [teams, setTeams] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    keHoach: null,
    teams: [],
    ngay: new Date().toISOString().split("T")[0],
    ghiChu: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [plansData, teamsData, assignmentsData] = await Promise.all([
        fetchPlans(),
        fetchTeams(),
        fetchAssignments(),
      ]);
      setPlans(plansData.filter(p => p.trangThai === "Đã duyệt" || p.trangThai === "Đang thực hiện"));
      setTeams(teamsData);
      setAssignments(assignmentsData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await axiosInstance.get("/factory/manager/assignments");
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      return [];
    }
  };

  const handleOpenModal = () => {
    setFormData({
      keHoach: null,
      teams: [],
      ngay: new Date().toISOString().split("T")[0],
      ghiChu: "",
    });
    setShowModal(true);
  };

  const handleToggleTeam = (team) => {
    setFormData((prev) => {
      const exists = prev.teams.find((t) => t.id === team._id || t.id === team.id);
      if (exists) {
        return {
          ...prev,
          teams: prev.teams.filter((t) => t.id !== (team._id || team.id)),
        };
      } else {
        return {
          ...prev,
          teams: [
            ...prev.teams,
            {
              id: team._id || team.id,
              tenTo: team.tenTo,
            },
          ],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.keHoach || formData.teams.length === 0) {
      alert("Vui lòng chọn kế hoạch và ít nhất một tổ");
      return;
    }

    try {
      const payload = {
        keHoach: {
          planId: formData.keHoach._id,
          maKeHoach: formData.keHoach.maKeHoach,
          soLuongCanSanXuat: formData.keHoach.soLuongCanSanXuat,
          soLuongNVLUocTinh: formData.keHoach.soLuongNVLUocTinh,
          ngayBatDauDuKien: formData.keHoach.ngayBatDauDuKien,
          ngayKetThucDuKien: formData.keHoach.ngayKetThucDuKien,
          sanPham: formData.keHoach.sanPham,
        },
        xuong: {
          id: "",
          tenXuong: formData.keHoach.xuongPhuTrach || "",
        },
        ngay: formData.ngay,
        congViec: formData.teams.map((team) => ({
          to: {
            id: team.id,
            tenTo: team.tenTo,
          },
          moTa: `Thực hiện kế hoạch ${formData.keHoach.maKeHoach}`,
          soLuong: Math.ceil(
            (formData.keHoach.soLuongCanSanXuat || 0) / formData.teams.length
          ),
        })),
        trangThai: "Dang thuc hien",
        ghiChu: formData.ghiChu,
      };

      await axiosInstance.post("/factory/manager/assignments", payload);
      alert("✅ Phân công công việc thành công!");
      setShowModal(false);
      loadData();
    } catch (error) {
      alert(`❌ Lỗi: ${error.response?.data?.error || error.message}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Chưa có";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 text-amber-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
              Assignment
            </p>
            <h1 className="text-3xl font-bold text-amber-900">
              Phân công công việc
            </h1>
          </div>
        </div>
        <button
          onClick={() => {
            if (plans.length === 0) {
              alert("Không có kế hoạch đã duyệt để phân công");
              return;
            }
            setShowModal(true);
          }}
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold shadow hover:shadow-lg transition flex items-center gap-2"
        >
          <Plus size={18} />
          Phân công mới
        </button>
      </div>

      {/* Danh sách phân công */}
      <div className="bg-white border border-amber-100 rounded-3xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-amber-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Mã phân công</th>
                <th className="px-4 py-3 text-left font-semibold">Kế hoạch</th>
                <th className="px-4 py-3 text-left font-semibold">Tổ được phân công</th>
                <th className="px-4 py-3 text-left font-semibold">Ngày</th>
                <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-amber-600">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : assignments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-amber-600">
                    Chưa có phân công nào
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => (
                  <tr key={assignment._id} className="hover:bg-amber-50/60">
                    <td className="px-4 py-3 font-semibold">
                      {assignment.maPhanCong || assignment._id?.slice(-6)}
                    </td>
                    <td className="px-4 py-3">
                      {assignment.keHoach?.maKeHoach || "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      {assignment.congViec?.map((cv, idx) => (
                        <span key={idx} className="inline-block mr-2 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
                          {cv.to?.tenTo || "N/A"}
                        </span>
                      ))}
                    </td>
                    <td className="px-4 py-3">{formatDate(assignment.ngay)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        assignment.trangThai === "Hoan thanh"
                          ? "bg-green-100 text-green-700"
                          : assignment.trangThai === "Dang thuc hien"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {assignment.trangThai || "Luu nhap"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal phân công */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-amber-100">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">
              Phân công công việc mới
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Chọn kế hoạch */}
              <div>
                <label className="block text-sm font-semibold text-amber-800 mb-2">
                  Kế hoạch sản xuất *
                </label>
                <select
                  value={formData.keHoach?._id || ""}
                  onChange={(e) => {
                    const plan = plans.find((p) => p._id === e.target.value);
                    setFormData({ ...formData, keHoach: plan || null });
                  }}
                  className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                >
                  <option value="">-- Chọn kế hoạch --</option>
                  {plans.map((plan) => (
                    <option key={plan._id} value={plan._id}>
                      {plan.maKeHoach} - {plan.sanPham?.tenSanPham || plan.sanPham}
                    </option>
                  ))}
                </select>
                {formData.keHoach && (
                  <div className="mt-2 p-3 bg-amber-50 rounded-lg text-xs text-amber-700">
                    <p><strong>Sản phẩm:</strong> {formData.keHoach.sanPham?.tenSanPham || formData.keHoach.sanPham}</p>
                    <p><strong>Số lượng:</strong> {formData.keHoach.soLuongCanSanXuat?.toLocaleString("vi-VN") || 0}</p>
                    <p><strong>Thời gian:</strong> {formatDate(formData.keHoach.ngayBatDauDuKien)} - {formatDate(formData.keHoach.ngayKetThucDuKien)}</p>
                  </div>
                )}
              </div>

              {/* Chọn tổ */}
              <div>
                <label className="block text-sm font-semibold text-amber-800 mb-2">
                  Tổ sản xuất * (chọn một hoặc nhiều tổ)
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-amber-200 rounded-2xl p-4">
                  {teams.map((team) => {
                    const isSelected = formData.teams.some(
                      (t) => t.id === (team._id || team.id)
                    );
                    return (
                      <label
                        key={team._id || team.id}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                          isSelected
                            ? "bg-amber-100 border-2 border-amber-500"
                            : "bg-white border-2 border-amber-200 hover:bg-amber-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleTeam(team)}
                          className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{team.tenTo}</p>
                          <p className="text-xs text-amber-600">
                            {team.thanhVien?.length || 0} thành viên
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Ngày phân công */}
              <div>
                <label className="block text-sm font-semibold text-amber-800 mb-2">
                  Ngày phân công *
                </label>
                <input
                  type="date"
                  value={formData.ngay}
                  onChange={(e) => setFormData({ ...formData, ngay: e.target.value })}
                  className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-semibold text-amber-800 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={formData.ghiChu}
                  onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                  rows={3}
                  className="w-full rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Nhập ghi chú (nếu có)..."
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 rounded-2xl border border-amber-300 text-amber-700 font-semibold hover:bg-amber-50 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold shadow hover:shadow-lg transition"
                >
                  Phân công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

