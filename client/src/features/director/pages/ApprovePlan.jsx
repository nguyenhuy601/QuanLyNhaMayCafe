// client/src/pages/director/ApprovePlan.jsx
import { useState } from "react";

export default function ApprovePlan() {
  const [plans, setPlans] = useState([
    {
      id: "KHSX001",
      product: "CF chồn DakLak",
      output: 2000,
      material: "Hạt CF chồn",
      input: 6000,
      start: "07/08/2025",
      end: "15/08/2025",
      factory: "Xưởng 1",
      status: "Chờ duyệt",
      note: "",
    },
    {
      id: "KHSX002",
      product: "CF hoà tan",
      output: 5000,
      material: "Hạt CF Robusta",
      input: 15000,
      start: "10/08/2025",
      end: "20/08/2025",
      factory: "Xưởng 2",
      status: "Chờ duyệt",
      note: "",
    },
    {
      id: "KHSX003",
      product: "CF bột cao cấp",
      output: 1000,
      material: "CF Arabica",
      input: 4000,
      start: "05/08/2025",
      end: "13/08/2025",
      factory: "Xưởng 3",
      status: "Chờ duyệt",
      note: "",
    },
  ]);

  const [rejectingPlan, setRejectingPlan] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // -------- helpers UI --------
  const StatusChip = ({ status }) => {
    const styles = {
      "Chờ duyệt": { bg: "#FEF3C7", fg: "#92400E", bd: "#FDE68A" }, // amber-100/900/200
      "Đã duyệt":  { bg: "#D1FAE5", fg: "#065F46", bd: "#A7F3D0" }, // emerald
      "Từ chối":   { bg: "#FEE2E2", fg: "#991B1B", bd: "#FECACA" }, // red
    }[status] || { bg: "#F3F4F6", fg: "#111827", bd: "#E5E7EB" };

    return (
      <span
        style={{
          backgroundColor: styles.bg,
          color: styles.fg,
          border: `1px solid ${styles.bd}`,
          borderRadius: 6,
          padding: "2px 8px",
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        {status}
      </span>
    );
  };

  const YellowBtn = ({ children, ...rest }) => {
    const base = { bg: "#FEF3C7", bd: "#FDE68A" }; // amber-100/200
    const hover = { bg: "#F59E0B", bd: "#F59E0B", fg: "#1F2937" }; // amber-500 + đậm hơn

    const [isHover, setHover] = useState(false);
    return (
      <button
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          backgroundColor: isHover ? hover.bg : base.bg,
          color: isHover ? hover.fg : "#78350F", // amber-900
          border: `1px solid ${isHover ? hover.bd : base.bd}`,
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

  // -------- actions --------
  const handleApprove = (id) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Đã duyệt", note: "" } : p))
    );
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
  };

  const handleReject = (plan) => {
    setRejectingPlan(plan);
    setRejectReason(plan.note || "");
  };

  const confirmReject = () => {
    if (!rejectingPlan) return;
    setPlans((prev) =>
      prev.map((p) =>
        p.id === rejectingPlan.id ? { ...p, status: "Từ chối", note: rejectReason } : p
      )
    );
    setRejectingPlan(null);
    setRejectReason("");
  };

  // -------- render --------
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Phê duyệt kế hoạch sản xuất</h2>

      <div className="rounded-2xl border border-black/10 bg-white p-4 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-200 text-black/80">
              <th className="p-2">Mã kế hoạch</th>
              <th className="p-2">Tên sản phẩm</th>
              <th className="p-2">Số lượng TP</th>
              <th className="p-2">Nguyên liệu</th>
              <th className="p-2">Số lượng NVL</th>
              <th className="p-2">Ngày BD</th>
              <th className="p-2">Ngày KT</th>
              <th className="p-2">Xưởng</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2">Ghi chú</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p.id} className="border-t text-center hover:bg-neutral-50 transition">
                <td className="p-2">{p.id}</td>
                <td className="p-2">{p.product}</td>
                <td className="p-2">{p.output}</td>
                <td className="p-2">{p.material}</td>
                <td className="p-2">{p.input}</td>
                <td className="p-2">{p.start}</td>
                <td className="p-2">{p.end}</td>
                <td className="p-2">{p.factory}</td>
                <td className="p-2"><StatusChip status={p.status} /></td>
                <td className="p-2 text-left">{p.note}</td>

                <td className="p-2 space-x-2">
                  {p.status === "Chờ duyệt" ? (
                    <>
                      <YellowBtn onClick={() => handleApprove(p.id)}>Duyệt</YellowBtn>
                      <YellowBtn onClick={() => handleReject(p)}>Từ chối</YellowBtn>
                    </>
                  ) : (
                    // Khi đã duyệt/từ chối -> hiển thị lại trạng thái ở cột Hành động (thay vì dấu —)
                    <StatusChip status={p.status} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal TỪ CHỐI — căn giữa, chữ trong ô MÀU ĐEN */}
      {rejectingPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,.4)",
          }}
        >
          <div
            className="rounded-2xl shadow-xl p-6 w-[380px]"
            style={{ background: "#6d3a14", color: "#fff" }}
          >
            <h3 className="text-lg font-semibold mb-3 text-center">Nhập lý do từ chối</h3>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-sm outline-none"
              style={{ color: "#111", backgroundColor: "#fff" }} // chữ đen
              placeholder="Nhập lý do từ chối..."
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRejectingPlan(null)}
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

      {/* Modal DUYỆT THÀNH CÔNG — căn giữa */}
      {showSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            left: 0,
            top: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,.3)",
          }}
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
