import { useState, useEffect, useCallback } from "react";
import OrderModal from "../components/OrderModal";
import {
  getPendingOrders,
  approveOrderApi,
  rejectOrderApi,
} from "../../../api/directorAPI";
import { enrichOrderData } from "../utils/dataMapper";
import { toVietnameseStatus } from "../../../utils/statusMapper";
import useAutoRefresh from "../../../hooks/useAutoRefresh";

export default function ApproveOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Modal xử lý
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Hàm tải dữ liệu
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const rawList = await getPendingOrders();
      console.log("📦 Raw orders from API:", rawList);
      
      if (!Array.isArray(rawList) || rawList.length === 0) {
        console.warn("⚠️ No pending orders found");
        setOrders([]);
        return;
      }
      
      const fullList = await Promise.all(rawList.map(async (order) => {
          return await enrichOrderData(order);
      }));
      console.log("✅ Enriched orders:", fullList);
      setOrders(fullList);
    } catch (error) {
      console.error("❌ Lỗi tải đơn hàng:", error);
      // Nếu đã xử lý 401, không set orders
      if (error.response?.status !== 401) {
        setOrders([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useAutoRefresh(loadData, { interval: 12000 });

  // XỬ LÝ DUYỆT
  const handleApprove = async (id) => { 
      if(!window.confirm("Bạn có chắc muốn duyệt đơn hàng này?")) return;
      try {
        await approveOrderApi(id); // Gọi API thật
        setShowSuccess(true); 
        setTimeout(() => setShowSuccess(false), 1500);
        loadData(); // Tải lại danh sách để cập nhật trạng thái
      } catch (error) {
        alert("Lỗi khi duyệt: " + error.message);
      }
  };

  // XỬ LÝ TỪ CHỐI
  const handleRejectClick = (order) => { setRejectingOrder(order); setRejectReason(""); };
  
  const confirmReject = async () => {
      if (!rejectReason.trim()) return alert("Vui lòng nhập lý do!");
      try {
        await rejectOrderApi(rejectingOrder._id, rejectReason); // Gọi API thật
        setRejectingOrder(null);
        loadData(); // Tải lại danh sách
      } catch (error) {
        alert("Lỗi khi từ chối: " + error.message);
      }
  };

  const StatusChip = ({ status }) => {
    const label = toVietnameseStatus(status);
    const map = {
      "Chờ duyệt": { bg: "#FEF3C7", fg: "#92400E", bd: "#FDE68A" },
      "Đã duyệt": { bg: "#D1FAE5", fg: "#065F46", bd: "#A7F3D0" },
      "Từ chối": { bg: "#FEE2E2", fg: "#991B1B", bd: "#FECACA" },
      "Đã hủy": { bg: "#FEE2E2", fg: "#991B1B", bd: "#FECACA" },
      "Đang giao": { bg: "#DBEAFE", fg: "#1E40AF", bd: "#BFDBFE" },
    }[label] || { bg: "#E5E7EB", fg: "#374151", bd: "#D1D5DB" };
    
    return (
      <span style={{ backgroundColor: map.bg, color: map.fg, border: `1px solid ${map.bd}`, padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
        {label}
      </span>
    );
  };

  const YellowBtn = ({ children, ...rest }) => (
      <button style={{ backgroundColor: "#FEF3C7", color: "#78350F", border: "1px solid #FDE68A", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }} {...rest}>
        {children}
      </button>
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Phê duyệt đơn hàng</h2>
      <div className="rounded-2xl border border-black/10 bg-white p-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-200 text-black/80">
              <th className="p-2">Mã đơn hàng</th>
              <th className="p-2">Khách hàng</th>
              <th className="p-2">SĐT</th>
              <th className="p-2">Sản phẩm</th>
              <th className="p-2">Số lượng</th>
              <th className="p-2">Tổng tiền</th>
              <th className="p-2">Chi tiết</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (<tr><td colSpan="9" className="p-4 text-center">Đang tải...</td></tr>) : orders.length === 0 ? (<tr><td colSpan="9" className="p-4 text-center text-gray-500">Không có dữ liệu</td></tr>) : (
                orders.map((o) => (
                <tr key={o._id} className="border-t text-center hover:bg-neutral-50 transition">
                    <td className="p-2 font-bold">{o.maDH}</td>
                    <td className="p-2">{o.customerName}</td> 
                    <td className="p-2">{o.customerPhone}</td>
                    <td className="p-2 max-w-[200px] truncate">{o.chiTiet?.map(i => i.productName).join(', ')}</td>
                    <td className="p-2">
                      {o.chiTiet?.map((i, idx) => {
                        const soLuong = i.soLuong || 0;
                        const donVi = i.donVi;
                        const loaiTui = i.loaiTui;
                        // Nếu loaiTui = "hop" thì hiển thị "Hộp"
                        const displayUnit = loaiTui === "hop" ? "Hộp" : (donVi !== null && donVi !== undefined ? donVi : "null");
                        return (
                          <span key={idx}>
                            {soLuong} {displayUnit}
                            {idx < (o.chiTiet?.length || 0) - 1 ? ", " : ""}
                          </span>
                        );
                      })}
                    </td>
                    <td className="p-2 text-right">{o.tongTien?.toLocaleString()} đ</td>
                    <td className="p-2 text-blue-600 underline cursor-pointer hover:text-blue-800" onClick={() => setSelectedOrderId(o._id)}>Xem</td>
                    <td className="p-2"><StatusChip status={o.trangThai} /></td>
                    <td className="p-2 space-x-2">
                        {/* Chỉ hiện nút nếu chưa duyệt */}
                        {(toVietnameseStatus(o.trangThai) === 'Chờ duyệt') && (
                            <>
                                <YellowBtn onClick={() => handleApprove(o._id)}>Duyệt</YellowBtn>
                                <YellowBtn onClick={() => handleRejectClick(o)}>Từ chối</YellowBtn>
                            </>
                        )}
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
      {selectedOrderId && <OrderModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />}
      
      {/* Modal Từ Chối */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: "rgba(0,0,0,.5)"}}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-lg font-bold mb-4">Lý do từ chối đơn {rejectingOrder.maDH}?</h3>
                <textarea className="w-full border p-2 rounded mb-4" rows="3" placeholder="Nhập lý do..." value={rejectReason} onChange={e => setRejectReason(e.target.value)}></textarea>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setRejectingOrder(null)} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
                    <button onClick={confirmReject} className="px-4 py-2 bg-red-500 text-white rounded">Xác nhận từ chối</button>
                </div>
            </div>
        </div>
      )}

      {showSuccess && <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: "rgba(0,0,0,.3)"}}><div className="bg-white rounded-xl shadow-lg px-8 py-6 text-center"><div className="text-4xl mb-2">✅</div><p>Thao tác thành công!</p></div></div>}
    </div>
  );
}