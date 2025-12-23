import { useState, useEffect, useCallback } from "react";
import {
  getPendingFinishedIssues,
  approveFinishedIssueApi,
  rejectFinishedIssueApi,
} from "../../../api/directorAPI";
import useRealtime from "../../../hooks/useRealtime";

export default function ApproveFinishedIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const rawList = await getPendingFinishedIssues();
      
      if (!Array.isArray(rawList) || rawList.length === 0) {
        setIssues([]);
        return;
      }
      
      setIssues(rawList);
    } catch (error) {
      if (error.response?.status !== 401) {
        setIssues([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  
  // Realtime updates
  useRealtime({
    eventHandlers: {
      FINISHED_ISSUE_CREATED: loadData,
      FINISHED_ISSUE_APPROVED: loadData,
      FINISHED_ISSUE_REJECTED: loadData,
      warehouse_events: loadData, // Generic warehouse events
    },
  });

  // Xử lý Duyệt
  const handleApprove = async (id) => {
    if(!window.confirm("Xác nhận duyệt phiếu xuất kho thành phẩm này? Sau khi duyệt, số lượng sản phẩm sẽ được trừ khỏi kho.")) return;
    try {
        await approveFinishedIssueApi(id);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
        loadData();
    } catch (error) {
        alert("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý Từ chối
  const handleReject = async (id) => {
    if(!window.confirm("Xác nhận từ chối phiếu xuất kho thành phẩm này?")) return;
    try {
        await rejectFinishedIssueApi(id);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
        loadData();
    } catch (error) {
        alert("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  const StatusChip = ({ status }) => {
    const map = {
      "Cho duyet": { bg: "#FEF3C7", fg: "#92400E" },
      "Cho xuat": { bg: "#FEF3C7", fg: "#92400E" },
      "Da xuat": { bg: "#D1FAE5", fg: "#065F46" },
      "Da giao": { bg: "#DBEAFE", fg: "#1E40AF" },
      "Tu choi": { bg: "#FEE2E2", fg: "#991B1B" },
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
      <h2 className="text-2xl font-semibold mb-4">Phê duyệt phiếu xuất kho thành phẩm</h2>
      <div className="rounded-2xl border border-black/10 bg-white p-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-200 text-black/80">
              <th className="p-2">Mã phiếu</th>
              <th className="p-2">Đơn hàng</th>
              <th className="p-2">Ngày xuất</th>
              <th className="p-2">Loại xuất</th>
              <th className="p-2">Chi tiết sản phẩm</th>
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
                    <p className="text-gray-500">Chưa có phiếu xuất kho thành phẩm nào đang chờ duyệt</p>
                    <p className="text-xs text-gray-400">
                      Phiếu xuất kho thành phẩm sẽ được tạo bởi quản lý kho thành phẩm
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              issues.map((issue, i) => (
                <tr key={i} className="border-t text-center hover:bg-neutral-50 transition">
                  <td className="p-2 font-bold">{issue.maPhieuXuatTP}</td>
                  <td className="p-2">
                    {issue.donHang || "N/A"}
                  </td>
                  <td className="p-2">{formatDate(issue.ngayXuat)}</td>
                  <td className="p-2">
                    {issue.loaiXuat === "GiaoKhachHang" ? "Giao khách hàng" :
                     issue.loaiXuat === "DieuChuyen" ? "Điều chuyển" :
                     issue.loaiXuat || "Khác"}
                  </td>
                  <td className="p-2 text-left">
                    {issue.chiTiet && issue.chiTiet.length > 0 ? (
                      <ul className="list-disc list-inside text-xs">
                        {issue.chiTiet.map((item, idx) => (
                          <li key={idx}>
                            Sản phẩm {item.sanPham || "N/A"}: {item.soLuong || 0} {item.donGia ? `(${item.donGia.toLocaleString('vi-VN')} đ)` : ''}
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
                    {issue.trangThai === 'Cho duyet' && (
                      <>
                        <button 
                          onClick={() => handleApprove(issue._id)} 
                          className="bg-green-100 text-green-800 px-3 py-1 rounded border border-green-200 hover:bg-green-200 mr-2"
                        >
                          Duyệt
                        </button>
                        <button 
                          onClick={() => handleReject(issue._id)} 
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

