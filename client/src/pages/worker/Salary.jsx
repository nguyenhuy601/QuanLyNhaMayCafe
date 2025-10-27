// client/src/pages/worker/Salary.jsx
import { useEffect, useMemo, useState } from "react";

/**
 * Giao diện XEM LƯƠNG cho Công nhân (chỉ UI, chưa nối API)
 * - Mặc định: hiển thị lương tháng gần nhất (tháng trước)
 * - Bấm "Xem chi tiết" để xem chi tiết lương
 * - Bấm chọn tháng/năm => mở lịch chọn tháng, bấm vào ngày để hiển thị lương tháng đó
 */

const VIEW = { SUMMARY: "SUMMARY", DETAIL: "DETAIL" };

export default function WorkerSalary() {
  const [view, setView] = useState(VIEW.SUMMARY);
  const [selectedDate, setSelectedDate] = useState("");

  // Lấy tháng gần nhất (tháng trước hiện tại)
  const [latestMonth, setLatestMonth] = useState(() => {
    const now = new Date();
    now.setMonth(now.getMonth() - 1);
    return now.toISOString().slice(0, 7); // yyyy-MM
  });

  // Dùng để hiển thị dạng mm/yyyy
  const humanMonth = useMemo(() => {
    const [y, m] = (selectedDate || latestMonth).split("-");
    return `${m}/${y}`;
  }, [selectedDate, latestMonth]);

  // Khi chọn tháng mới thì update state
  const handleDateChange = (e) => {
    const val = e.target.value; // yyyy-mm
    setSelectedDate(val);
    setView(VIEW.DETAIL);
  };

  useEffect(() => {
    document.title = "Xem lương - Công nhân";
  }, []);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-2xl border border-black/10 bg-white p-6 sm:p-8 shadow-inner">
        <h2 className="text-2xl font-semibold mb-4">Xem lương</h2>

        {/* Thanh chọn tháng / năm */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="month"
            className="w-[240px] rounded-md border border-black/30 px-4 py-2 text-sm outline-none focus:ring focus:ring-amber-300/50"
            onChange={handleDateChange}
            value={selectedDate || ""}
          />
          <span className="text-lg"></span>
        </div>

        {/* ================== TỔNG LƯƠNG ================== */}
        {view === VIEW.SUMMARY && (
          <div className="max-w-sm">
            <div className="rounded-xl border border-black/10 bg-white/80 p-4 shadow-sm text-center">
              <div className="font-medium mb-1">
                Tổng lương tháng {humanMonth}
              </div>
              <div className="text-2xl font-bold text-neutral-800">
                8,484,000 VND
              </div>
              <button
                onClick={() => setView(VIEW.DETAIL)}
                className="mt-4 rounded-md bg-amber-50 px-4 py-2 text-sm font-medium hover:bg-amber-100"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        )}

        {/* ================== CHI TIẾT LƯƠNG ================== */}
        {view === VIEW.DETAIL && (
          <div className="max-w-sm">
            <div className="rounded-xl border border-black/10 bg-white/80 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => setView(VIEW.SUMMARY)}
                  className="text-lg"
                  title="Quay lại"
                >
                  ←
                </button>
                <div className="font-medium">
                  Chi tiết lương tháng {humanMonth}
                </div>
              </div>

              <div className="space-y-1 text-sm leading-5">
                <div>Số giờ công: 220</div>
                <div>Số ngày công: 27.5</div>
                <div>Số giờ tăng ca: 12</div>
                <div>Tiền lương: 7,122,000</div>
                <div>Tiền phụ cấp tăng ca: 1,362,000</div>
                <div className="font-semibold mt-1">
                  Tổng lương: 8,484,000
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
