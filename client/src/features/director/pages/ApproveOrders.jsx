// client/src/pages/director/ApproveOrders.jsx
import { useState } from "react";

export default function ApproveOrders() {
  const [orders, setOrders] = useState([
    {
      id: "DCFDD001",
      customer: "Công ty A",
      phone: "0936127397",
      email: "ctya@gmail.com",
      product: "Hạt cf chồn",
      detail:
        "• Mã đơn hàng: DCFDD001\n• Khách hàng: Công ty A\n• SĐT: 0936127397\n• Email: ctya@gmail.com\n• Tên sản phẩm: Hạt cf chồn\n• Số lượng: 5000 gói\n• Ngày giao: 10/11/2025",
      status: "Chờ duyệt",
      note: "",
    },
    {
      id: "DCFDD002",
      customer: "Công ty B",
      phone: "0911222333",
      email: "ctyb@gmail.com",
      product: "CF hòa tan DakLak",
      detail:
        "• Mã đơn hàng: DCFDD002\n• Khách hàng: Công ty B\n• SĐT: 0911222333\n• Email: ctyb@gmail.com\n• Tên sản phẩm: CF hòa tan DakLak\n• Số lượng: 8000 hộp\n• Ngày giao: 12/11/2025",
      status: "Chờ duyệt",
      note: "",
    },
  ]);

  const [showDetail, setShowDetail] = useState(null);
  const [rejectingOrder, setRejectingOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // component chip trạng thái
  const StatusChip = ({ status }) => {
    const map = {
      "Chờ duyệt": { bg: "#FEF3C7", fg: "#92400E", bd: "#FDE68A" },
      "Đã duyệt": { bg: "#D1FAE5", fg: "#065F46", bd: "#A7F3D0" },
      "Từ chối": { bg: "#FEE2E2", fg: "#991B1B", bd: "#FECACA" },
    }[status];
    return (
      <span
        style={{
          backgroundColor: map.bg,
          color: map.fg,
          border: `1px solid ${map.bd}`,
          padding: "2px 8px",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        {status}
      </span>
    );
  };

  // nút vàng nhạt + hover vàng đậm
  const YellowBtn = ({ children, ...rest }) => {
    const [hover, setHover] = useState(false);
    return (
      <button
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          backgroundColor: hover ? "#F59E0B" : "#FEF3C7",
          color: hover ? "#1F2937" : "#78350F",
          border: `1px solid ${hover ? "#F59E0B" : "#FDE68A"}`,
          borderRadius: 6,
          padding: "4px 12px",
          fontSize: 12,
          fontWeight: 600,
          transition: "all .15s ease",
        }}
        {...rest}
      >
        {children}
      </button>
    );
  };

  // xử lý Duyệt
  const handleApprove = (id) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "Đã duyệt", note: "" } : o
      )
    );
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1000);
  };

  // mở modal Từ chối
  const handleReject = (order) => {
    setRejectingOrder(order);
    setRejectReason(order.note || "");
  };

  // xác nhận từ chối
  const confirmReject = () => {
    if (!rejectingOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === rejectingOrder.id
          ? { ...o, status: "Từ chối", note: rejectReason }
          : o
      )
    );
    setRejectingOrder(null);
    setRejectReason("");
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Phê duyệt đơn hàng</h2>

      <div className="rounded-2xl border border-black/10 bg-white p-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-200 text-black/80">
              <th className="p-2">Mã đơn hàng</th>
              <th className="p-2">Khách hàng</th>
              <th className="p-2">Số điện thoại</th>
              <th className="p-2">Email</th>
              <th className="p-2">Tên sản phẩm</th>
              <th className="p-2">Chi tiết</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-t text-center hover:bg-neutral-50 transition"
              >
                <td className="p-2">{o.id}</td>
                <td className="p-2">{o.customer}</td>
                <td className="p-2">{o.phone}</td>
                <td className="p-2">{o.email}</td>
                <td className="p-2">{o.product}</td>

                <td className="p-2 text-blue-600 underline cursor-pointer"
                    onClick={() => setShowDetail(o)}>
                  Xem chi tiết
                </td>

                <td className="p-2">
                  <StatusChip status={o.status} />
                </td>

                <td className="p-2 space-x-2">
                  {o.status === "Chờ duyệt" ? (
                    <>
                      <YellowBtn onClick={() => handleApprove(o.id)}>Duyệt</YellowBtn>
                      <YellowBtn onClick={() => handleReject(o)}>Từ chối</YellowBtn>
                    </>
                  ) : (
                    <StatusChip status={o.status} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* popup chi tiết */}
      {showDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,.3)",
          }}
          onClick={() => setShowDetail(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-lg p-4 text-left"
            style={{ minWidth: 320 }}
          >
            <h3 className="text-base font-semibold mb-2">Chi tiết đơn hàng</h3>
            <pre className="text-sm whitespace-pre-wrap leading-5">
              {showDetail.detail}
            </pre>
            <div className="flex justify-end mt-3">
              <YellowBtn onClick={() => setShowDetail(null)}>Đóng</YellowBtn>
            </div>
          </div>
        </div>
      )}

      {/* modal nhập lý do từ chối */}
      {rejectingOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            background: "rgba(0,0,0,.4)",
          }}
        >
          <div
            className="rounded-2xl shadow-xl p-6 w-[380px]"
            style={{ background: "#6d3a14", color: "#fff" }}
          >
            <h3 className="text-lg font-semibold mb-3 text-center">
              Nhập lý do từ chối
            </h3>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none"
              style={{ color: "#111", backgroundColor: "#fff" }}
              placeholder="Nhập lý do từ chối..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-1 rounded bg-gray-400 text-white hover:bg-gray-500"
              >
                Hủy
              </button>
              <button
                onClick={confirmReject}
                className="px-4 py-1 rounded bg-amber-500 text-white hover:bg-amber-600"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal duyệt thành công */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,.3)" }}
        >
          <div className="bg-white rounded-xl shadow-lg px-8 py-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <p className="font-semibold text-lg">Duyệt thành công!</p>
          </div>
        </div>
      )}
    </div>
  );
}
