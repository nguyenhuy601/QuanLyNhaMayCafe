import { useState, useEffect, useCallback } from "react";
import {
  getPendingMaterialRequests,
  approveMaterialRequestApi,
  rejectMaterialRequestApi,
} from "../../../api/directorAPI";
import useAutoRefresh from "../../../hooks/useAutoRefresh";

export default function ApproveMaterialRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [rejectingRequest, setRejectingRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const rawList = await getPendingMaterialRequests();
      console.log("📋 Raw material requests from API:", rawList);
      
      if (!Array.isArray(rawList) || rawList.length === 0) {
        console.warn("⚠️ No pending material requests found");
        setRequests([]);
        return;
      }
      
      setRequests(rawList);
    } catch (error) {
      console.error("❌ Lỗi tải phiếu yêu cầu NVL:", error);
      if (error.response?.status !== 401) {
        setRequests([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useAutoRefresh(loadData, { interval: 12000 });

  // Xử lý Duyệt
  const handleApprove = async (id) => {
    if(!window.confirm("Xác nhận duyệt phiếu yêu cầu NVL này?")) return;
    try {
        await approveMaterialRequestApi(id);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
        loadData();
    } catch (error) {
        alert("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý Từ chối
  const handleRejectClick = (request) => { 
    setRejectingRequest(request); 
    setRejectReason(""); 
  };
  
  const confirmReject = async () => {
      if (!rejectReason.trim()) return alert("Nhập lý do!");
      try {
        await rejectMaterialRequestApi(rejectingRequest._id, rejectReason);
        setRejectingRequest(null);
        setRejectReason("");
        loadData();
      } catch (error) {
        alert("Lỗi: " + (error.response?.data?.message || error.message));
      }
  };

  const StatusChip = ({ status }) => {
    const map = {
      "Chờ phê duyệt": { bg: "#FEF3C7", fg: "#92400E" },
      "Đã duyệt": { bg: "#D1FAE5", fg: "#065F46" },
      "Từ chối": { bg: "#FEE2E2", fg: "#991B1B" },
      "Đã đặt hàng": { bg: "#DBEAFE", fg: "#1E40AF" },
      "Hoàn thành": { bg: "#D1FAE5", fg: "#065F46" },
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
      <h2 className="text-2xl font-semibold mb-4">Phê duyệt phiếu yêu cầu NVL</h2>
      <div className="rounded-2xl border border-black/10 bg-white p-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-200 text-black/80">
              <th className="p-2">Mã phiếu</th>
              <th className="p-2">Kế hoạch</th>
              <th className="p-2">Danh sách NVL</th>
              <th className="p-2">Ngày yêu cầu</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">Đang tải...</td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-4 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-gray-500">Chưa có phiếu yêu cầu NVL nào đang chờ duyệt</p>
                    <p className="text-xs text-gray-400">
                      Phiếu yêu cầu NVL sẽ được tạo tự động khi có kế hoạch sản xuất thiếu nguyên vật liệu
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              requests.map((req, i) => (
                <tr key={i} className="border-t text-center hover:bg-neutral-50 transition">
                  <td className="p-2 font-bold">{req.maPhieu}</td>
                  <td className="p-2">
                    {req.keHoach?.maKeHoach || "N/A"}
                  </td>
                  <td className="p-2 text-left">
                    {req.danhSachNVL && req.danhSachNVL.length > 0 ? (
                      <ul className="list-disc list-inside text-xs">
                        {req.danhSachNVL.map((item, idx) => (
                          <li key={idx}>
                            {item.nvl?.tenSP || "N/A"}: {item.soLuong || 0} {item.nvl?.donViTinh || "kg"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "Không có"
                    )}
                  </td>
                  <td className="p-2">{formatDate(req.ngayYeuCau)}</td>
                  <td className="p-2">
                    <StatusChip status={req.trangThai} />
                  </td>
                  <td className="p-2 space-x-2">
                    {req.trangThai === 'Chờ phê duyệt' && (
                      <>
                        <button 
                          onClick={() => handleApprove(req._id)} 
                          className="bg-green-100 text-green-800 px-3 py-1 rounded border border-green-200 hover:bg-green-200"
                        >
                          Duyệt
                        </button>
                        <button 
                          onClick={() => handleRejectClick(req)} 
                          className="bg-red-100 text-red-800 px-3 py-1 rounded border border-red-200 hover:bg-red-200"
                        >
                          Từ chối
                        </button>
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
      {rejectingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: "rgba(0,0,0,.5)"}}>
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-bold mb-4">Từ chối phiếu {rejectingRequest.maPhieu}?</h3>
            <textarea 
              className="w-full border p-2 rounded mb-4" 
              rows="3" 
              placeholder="Lý do..." 
              value={rejectReason} 
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => {
                  setRejectingRequest(null);
                  setRejectReason("");
                }} 
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Hủy
              </button>
              <button 
                onClick={confirmReject} 
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

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

