import { useState, useEffect, useCallback } from "react";
import {
  getPendingMaterialIssues,
  approveMaterialIssueApi,
} from "../../../api/directorAPI";
import useAutoRefresh from "../../../hooks/useAutoRefresh";

export default function ApproveMaterialRequests() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const rawList = await getPendingMaterialIssues();
      console.log("📋 Raw material issues from API:", rawList);
      
      if (!Array.isArray(rawList) || rawList.length === 0) {
        console.warn("⚠️ No pending material issues found");
        setIssues([]);
        return;
      }
      
      setIssues(rawList);
    } catch (error) {
      console.error("❌ Lỗi tải phiếu xuất kho NVL:", error);
      if (error.response?.status !== 401) {
        setIssues([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useAutoRefresh(loadData, { interval: 12000 });

  // Xử lý Duyệt
  const handleApprove = async (id) => {
    if(!window.confirm("Xác nhận duyệt phiếu xuất kho NVL này? Sau khi duyệt, nguyên vật liệu sẽ được trừ khỏi kho.")) return;
    try {
        await approveMaterialIssueApi(id);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
        loadData();
    } catch (error) {
        alert("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  const StatusChip = ({ status }) => {
    const map = {
      "Cho xuat": { bg: "#FEF3C7", fg: "#92400E" },
      "Da xuat": { bg: "#D1FAE5", fg: "#065F46" },
    }[status] || { bg: "#E5E7EB", fg: "#374151" };
    
    return (
      <span style={{ backgroundColor: map.bg, color: map.fg, padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
        {status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Phê duyệt phiếu xuất kho NVL</h2>
      <div className="rounded-2xl border border-black/10 bg-white p-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-200 text-black/80">
              <th className="p-2">Mã phiếu</th>
              <th className="p-2">Kế hoạch</th>
              <th className="p-2">Xưởng nhận</th>
              <th className="p-2">Ngày xuất</th>
              <th className="p-2">Chi tiết NVL</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-4 text-center">Đang tải...</td>
              </tr>
            ) : issues.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-gray-500">Chưa có phiếu xuất kho NVL nào đang chờ duyệt</p>
                    <p className="text-xs text-gray-400">
                      Phiếu xuất kho NVL sẽ được tạo bởi quản lý kho nguyên vật liệu
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              issues.map((issue, i) => (
                <tr key={i} className="border-t text-center hover:bg-neutral-50 transition">
                  <td className="p-2 font-bold">{issue.maPhieuXuat}</td>
                  <td className="p-2">
                    {issue.keHoach || "N/A"}
                  </td>
                  <td className="p-2">
                    {issue.xuongNhan || "N/A"}
                  </td>
                  <td className="p-2">{formatDate(issue.ngayXuat)}</td>
                  <td className="p-2 text-left">
                    {issue.chiTiet && issue.chiTiet.length > 0 ? (
                      <ul className="list-disc list-inside text-xs">
                        {issue.chiTiet.map((item, idx) => (
                          <li key={idx}>
                            {item.sanPham || "N/A"}: {item.soLuong || 0} kg
                            {item.loXuat && ` (Lô: ${item.loXuat})`}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "Không có"
                    )}
                  </td>
                  <td className="p-2">
                    <StatusChip status={issue.trangThai} />
                  </td>
                  <td className="p-2 space-x-2">
                    {issue.trangThai === 'Cho xuat' && (
                      <button 
                        onClick={() => handleApprove(issue._id)} 
                        className="bg-green-100 text-green-800 px-3 py-1 rounded border border-green-200 hover:bg-green-200"
                      >
                        Duyệt
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: "rgba(0,0,0,.3)"}}>
          <div className="bg-white rounded-xl shadow-lg px-8 py-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <p>Thành công!</p>
          </div>
        </div>
      )}
    </div>
  );
}

