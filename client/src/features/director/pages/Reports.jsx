// client/src/pages/director/Reports.jsx
import { useMemo, useState } from "react";

/**
 * UI Báo cáo tổng hợp cho Ban Giám Đốc
 * - Chọn Xưởng (1..5)
 * - Mặc định hiển thị báo cáo THÁNG GẦN NHẤT (tháng trước hiện tại)
 * - Nút "Chọn tháng" -> input month, cập nhật báo cáo theo tháng chọn
 * - Dữ liệu MOCK, sinh ra theo (xưởng, tháng)
 */

const FACTORIES = ["Xưởng 1", "Xưởng 2", "Xưởng 3", "Xưởng 4", "Xưởng 5"];

function getLatestMonthYYYYMM() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 7); // yyyy-mm
}

// tạo dữ liệu mock theo xưởng + month (yyyy-mm)
function makeReport(factory, ym) {
  // seed nhẹ để mỗi xưởng/tháng khác nhau
  const seed =
    factory.charCodeAt(factory.length - 1) * 13 +
    parseInt(ym.slice(5, 7), 10) * 7;

  const productionTons = 250 + ((seed * 17) % 120); // 250..369
  const revenueBn = 30 + ((seed * 19) % 25);        // 30..54 (tỷ)
  const qcDefect = (0.5 + ((seed * 23) % 6) / 10).toFixed(1); // 0.5..1.0 %
  const orders = 80 + ((seed * 29) % 40);           // 80..119
  const overtimeH = 400 + ((seed * 31) % 200);      // 400..599

  return {
    productionTons,
    revenueBn,
    qcDefect,
    orders,
    overtimeH,
    topProducts: [
      { name: "CF hòa tan", value: Math.round(productionTons * 0.42) + " tấn" },
      { name: "CF bột cao cấp", value: Math.round(productionTons * 0.33) + " tấn" },
      { name: "Hạt CF chồn", value: Math.round(productionTons * 0.25) + " tấn" },
    ],
  };
}

export default function Reports() {
  const [factory, setFactory] = useState(FACTORIES[0]);
  const [month, setMonth] = useState(getLatestMonthYYYYMM());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const humanMonth = useMemo(() => {
    const [y, m] = month.split("-");
    return `${m}/${y}`;
  }, [month]);

  const report = useMemo(() => makeReport(factory, month), [factory, month]);

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="text-2xl font-semibold">Báo cáo tổng hợp</h2>

        {/* Chọn tháng */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMonthPicker((v) => !v)}
            className="rounded px-3 py-1 text-sm font-semibold border"
            style={{
              backgroundColor: "#FEF3C7",
              color: "#78350F",
              borderColor: "#FDE68A",
            }}
          >
            Chọn tháng
          </button>
          {showMonthPicker && (
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-md border px-3 py-1 text-sm"
            />
          )}
        </div>
      </div>

      {/* Chọn Xưởng */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FACTORIES.map((x) => {
          const active = x === factory;
          return (
            <button
              key={x}
              onClick={() => setFactory(x)}
              className="px-3 py-1 rounded-md border text-sm font-medium"
              style={{
                backgroundColor: active ? "#F59E0B" : "#FEF3C7",
                color: active ? "#1F2937" : "#78350F",
                borderColor: active ? "#F59E0B" : "#FDE68A",
              }}
            >
              {x}
            </button>
          );
        })}
      </div>

      {/* Header tháng đang xem */}
      <div className="mb-3 text-sm text-neutral-700">
        Đang xem báo cáo của <b>{factory}</b> — <b>tháng {humanMonth}</b>
      </div>

      {/* Cards KPI */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <KpiCard title="Sản lượng tháng" value={`${report.productionTons} tấn`} note="+5% so với T-1" />
        <KpiCard title="Doanh thu tháng" value={`${report.revenueBn} tỷ`} note="+8% MoM (mock)" />
        <KpiCard title="Tỉ lệ lỗi QC" value={`${report.qcDefect}%`} note="Mục tiêu < 1.2%" />
        <KpiCard title="Đơn hàng hoàn tất" value={`${report.orders}`} note="Bao gồm nội địa & xuất khẩu" />
      </div>

      {/* 2 khối chi tiết nhỏ */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <div className="rounded-xl border border-black/10 bg-white p-4">
          <div className="font-semibold mb-2">Top sản phẩm theo sản lượng</div>
          <div className="divide-y">
            {report.topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 text-sm">
                <span>{p.name}</span>
                <span className="font-semibold">{p.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-black/10 bg-white p-4">
          <div className="font-semibold mb-2">Tổng giờ tăng ca</div>
          <div className="text-3xl font-bold">{report.overtimeH} h</div>
          <div className="text-xs text-neutral-500 mt-1">
            *Số liệu minh họa (mock) cho UI — sẽ thay bằng dữ liệu thật khi nối API.
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, note }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
      {note && <div className="text-xs mt-1 text-emerald-600">{note}</div>}
    </div>
  );
}
