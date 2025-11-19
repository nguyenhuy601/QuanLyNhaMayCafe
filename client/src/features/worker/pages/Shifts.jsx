// client/src/pages/worker/Shifts.jsx
import { useMemo, useState } from "react";

/**
 * Giao diện XEM CA LÀM (chỉ UI, chưa nối API)
 * - Mặc định: hiện menu 4 lựa chọn
 * - Hôm nay: hiện card ca làm hôm nay
 * - Theo tuần: hiện 7 card (T2..CN)
 * - Chọn ngày: mở input date, sau khi chọn -> hiện card của ngày đó
 */

const VIEW = { MENU: "MENU", TODAY: "TODAY", WEEK: "WEEK", DATE: "DATE" };

export default function WorkerShifts() {
  const [view, setView] = useState(VIEW.MENU);
  const [picked, setPicked] = useState(""); // yyyy-mm-dd

  // format helper
  const humanDate = useMemo(() => {
    if (!picked) return "";
    const d = new Date(picked);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }, [picked]);

  return (
    <div className="mx-auto max-w-5xl">
      {/* Khung bo góc giống mock */}
      <div className="rounded-2xl border border-black/10 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)] bg-white p-6 sm:p-8">
        {/* Header theo view */}
        <div className="flex items-center gap-3 mb-4">
          {view !== VIEW.MENU && (
            <button
              onClick={() => setView(VIEW.MENU)}
              className="text-xl"
              title="Quay lại"
              aria-label="Quay lại"
            >
              ←
            </button>
          )}
          <h2 className="text-2xl font-semibold">
            {view === VIEW.MENU && "Xem ca làm"}
            {view === VIEW.TODAY && "Xem ca làm hôm nay"}
            {view === VIEW.WEEK && "Xem ca làm tuần 1 tháng 09/2025 (01/09–07/09)"}
            {view === VIEW.DATE && (picked ? `Xem ca làm ngày ${humanDate}` : "Chọn ngày")}
          </h2>
        </div>

        {/* ================= MENU ================= */}
        {view === VIEW.MENU && (
          <div className="grid gap-4 max-w-lg">
            {/* Chọn ngày / tháng / năm */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={picked}
                onChange={(e) => {
                  setPicked(e.target.value);
                  if (e.target.value) setView(VIEW.DATE);
                }}
                className="w-[280px] rounded-md border border-black/20 px-4 py-2 text-sm outline-none focus:ring focus:ring-amber-300/50"
                aria-label="Chọn ngày / tháng / năm"
              />
              <span className="text-lg"></span>
            </div>

            {/* Hôm nay */}
            <button
              onClick={() => setView(VIEW.TODAY)}
              className="w-[280px] rounded-md border border-black/20 bg-neutral-100 px-4 py-2 text-left hover:bg-neutral-200"
            >
              Xem ca làm hôm nay
            </button>

            {/* Theo tuần */}
            <button
              onClick={() => setView(VIEW.WEEK)}
              className="w-[280px] rounded-md border border-black/20 bg-neutral-100 px-4 py-2 text-left hover:bg-neutral-200"
            >
              Xem ca làm theo tuần
            </button>
          </div>
        )}

        {/* ================= TODAY ================= */}
        {view === VIEW.TODAY && (
          <div className="mt-4">
            <div className="rounded-xl border border-black/10 bg-white/80 p-4 shadow-sm max-w-sm">
              <div className="font-medium mb-2">Ca làm hôm nay</div>
              <div className="space-y-1 text-sm leading-5">
                <div>Ca: sáng, chiều</div>
                <div>Giờ làm: 7h–11h, 13h–17h</div>
                <div>Xưởng: 01</div>
                <div>Tổ: 02</div>
              </div>
            </div>
          </div>
        )}

        {/* ================= WEEK ================= */}
        {view === VIEW.WEEK && (
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
            {["T2","T3","T4","T5","T6","T7","CN"].map((day) => (
              <div
                key={day}
                className="rounded-xl border border-black/10 bg-white/80 p-4 shadow-sm"
              >
                <div className="text-center font-semibold mb-2">{day}</div>
                <div className="text-sm leading-5 space-y-1">
                  <div>Ca: sáng, chiều</div>
                  <div>
                    Giờ làm:<br/>7h–11h,<br/>1h–5h
                  </div>
                  <div>Dây chuyền: bao bì cà phê</div>
                  <div>Tổ: 01</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= DATE PICKED ================= */}
        {view === VIEW.DATE && (
          <div className="mt-2">
            {/* Thanh chọn ngày lại */}
            <div className="mb-4 flex items-center gap-2">
              <input
                type="date"
                value={picked}
                onChange={(e) => setPicked(e.target.value)}
                className="w-[280px] rounded-md border border-black/20 px-4 py-2 text-sm outline-none focus:ring focus:ring-amber-300/50"
                aria-label="Chọn ngày"
              />
              <span className="text-sm text-neutral-600">
                {picked ? `Đang xem: ${humanDate}` : "Hãy chọn ngày"}
              </span>
            </div>

            {/* Card kết quả của ngày đã chọn (mock) */}
            {picked && (
              <div className="rounded-xl border border-black/10 bg-white/80 p-4 shadow-sm max-w-sm">
                <div className="font-medium mb-2">Ca làm ngày {humanDate}</div>
                <div className="space-y-1 text-sm leading-5">
                  <div>Ca: sáng</div>
                  <div>Giờ làm: 7h–11h</div>
                  <div>Dây chuyền: bao bì cà phê</div>
                  <div>Xưởng: 01</div>
                  <div>Tổ: 02</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
