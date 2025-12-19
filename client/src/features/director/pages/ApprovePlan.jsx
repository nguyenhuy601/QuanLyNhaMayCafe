import { useState, useEffect, useCallback } from "react";
import {
  getPendingPlans,
  approvePlanApi,
  rejectPlanApi,
} from "../../../api/directorAPI";
import { enrichPlanData } from "../utils/dataMapper";
import { toVietnameseStatus } from "../../../utils/statusMapper";
import useAutoRefresh from "../../../hooks/useAutoRefresh";

export default function ApprovePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [rejectingPlan, setRejectingPlan] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const rawList = await getPendingPlans();
      
      if (!Array.isArray(rawList) || rawList.length === 0) {
        setPlans([]);
        return;
      }
      
      const fullList = await Promise.all(rawList.map(async (plan) => {
          return await enrichPlanData(plan);
      }));
      setPlans(fullList);
    } catch (error) {
      // Nếu đã xử lý 401, không set plans
      if (error.response?.status !== 401) {
        setPlans([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useAutoRefresh(loadData, { interval: 12000 });

  // Xử lý Duyệt
  const handleApprove = async (id) => {
    if(!window.confirm("Xác nhận duyệt kế hoạch này?")) return;
    try {
        await approvePlanApi(id);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
        loadData();
    } catch (error) {
        alert("Lỗi: " + error.message);
    }
  };

  // Xử lý Từ chối
  const handleRejectClick = (plan) => { setRejectingPlan(plan); setRejectReason(""); };
  const confirmReject = async () => {
      if (!rejectReason.trim()) return alert("Nhập lý do!");
      try {
        await rejectPlanApi(rejectingPlan._id, rejectReason);
        setRejectingPlan(null);
        loadData();
      } catch (error) {
        alert("Lỗi: " + error.message);
      }
  };

  const StatusChip = ({ status }) => {
    const label = toVietnameseStatus(status);
    const map = {
      "Chờ duyệt": { bg: "#FEF3C7", fg: "#92400E" },
      "Đã duyệt": { bg: "#D1FAE5", fg: "#065F46" },
      "Từ chối": { bg: "#FEE2E2", fg: "#991B1B" },
      "Đã hủy": { bg: "#FEE2E2", fg: "#991B1B" },
    }[label] || { bg: "#E5E7EB", fg: "#374151" };
    
    return (
      <span style={{ backgroundColor: map.bg, color: map.fg, padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
        {label}
      </span>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Phê duyệt kế hoạch sản xuất</h2>
      <div className="rounded-2xl border border-black/10 bg-white p-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-200 text-black/80">
              <th className="p-2">Mã KH</th>
              <th className="p-2">Tên sản phẩm</th>
              <th className="p-2">SL Sản xuất</th>
              <th className="p-2">Nguyên liệu</th>
              <th className="p-2">Xưởng</th>
              <th className="p-2">Ngày BĐ - KT</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (<tr><td colSpan="8" className="p-4 text-center">Đang tải...</td></tr>) : plans.length === 0 ? (<tr><td colSpan="8" className="p-4 text-center text-gray-500">Chưa có kế hoạch nào</td></tr>) : (
                plans.map((p, i) => (
                <tr key={i} className="border-t text-center hover:bg-neutral-50 transition">
                    <td className="p-2 font-bold">{p.maKeHoach}</td>
                    <td className="p-2">{p.productName}</td>
                    <td className="p-2">{p.soLuongCanSanXuat?.toLocaleString()}</td>
                    <td className="p-2">{p.materialName}</td>
                    <td className="p-2">{p.workshopName}</td>
                    <td className="p-2">{p.startDate} - {p.endDate}</td>
                    <td className="p-2"><StatusChip status={p.trangThai} /></td>
                    <td className="p-2 space-x-2">
                        {p.trangThai === 'Chờ duyệt' && (
                            <>
                                <button onClick={() => handleApprove(p._id)} className="bg-green-100 text-green-800 px-3 py-1 rounded border border-green-200 hover:bg-green-200">Duyệt</button>
                                <button onClick={() => handleRejectClick(p)} className="bg-red-100 text-red-800 px-3 py-1 rounded border border-red-200 hover:bg-red-200">Từ chối</button>
                            </>
                        )}
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

       {/* Modal Từ Chối */}
       {rejectingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: "rgba(0,0,0,.5)"}}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-lg font-bold mb-4">Từ chối kế hoạch {rejectingPlan.maKeHoach}?</h3>
                <textarea className="w-full border p-2 rounded mb-4" rows="3" placeholder="Lý do..." value={rejectReason} onChange={e => setRejectReason(e.target.value)}></textarea>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setRejectingPlan(null)} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
                    <button onClick={confirmReject} className="px-4 py-2 bg-red-500 text-white rounded">Xác nhận</button>
                </div>
            </div>
        </div>
      )}

      {showSuccess && <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: "rgba(0,0,0,.3)"}}><div className="bg-white rounded-xl shadow-lg px-8 py-6 text-center"><div className="text-4xl mb-2">✅</div><p>Thành công!</p></div></div>}
    </div>
  );
}