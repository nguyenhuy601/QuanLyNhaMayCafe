import React, { useState } from "react";

export default function ThongKe() {
  const [tab, setTab] = useState("tong-hop");
  const [showPopup, setShowPopup] = useState(false);
  const [filter, setFilter] = useState({
    tuNgay: "",
    denNgay: "",
    toSX: "",
  });

  const dataTongHop = [
    { toSX: "Tổ 1", soLuong: 500, datChuan: 480, loi: 20, tiLeDat: "96%" },
    { toSX: "Tổ 2", soLuong: 420, datChuan: 410, loi: 10, tiLeDat: "97.6%" },
    { toSX: "Tổ 3", soLuong: 600, datChuan: 570, loi: 30, tiLeDat: "95%" },
  ];

  const [dataLoHang] = useState([
    { maLo: "LH001", toSX: "Tổ 1", sanPham: "Cà phê hạt", soLuong: 200, datChuan: 190, loi: 10, ngay: "2025-10-30" },
    { maLo: "LH002", toSX: "Tổ 2", sanPham: "Cà phê bột", soLuong: 300, datChuan: 295, loi: 5, ngay: "2025-10-29" },
    { maLo: "LH003", toSX: "Tổ 3", sanPham: "Cà phê hòa tan", soLuong: 150, datChuan: 140, loi: 10, ngay: "2025-10-29" },
    { maLo: "LH004", toSX: "Tổ 1", sanPham: "Cà phê hạt đặc biệt", soLuong: 250, datChuan: 245, loi: 5, ngay: "2025-10-31" },
  ]);

  const filteredLoHang = dataLoHang.filter((row) => {
    const ngay = new Date(row.ngay);
    const tu = filter.tuNgay ? new Date(filter.tuNgay) : null;
    const den = filter.denNgay ? new Date(filter.denNgay) : null;
    const matchNgay = (!tu || ngay >= tu) && (!den || ngay <= den);
    const matchTo = !filter.toSX || row.toSX === filter.toSX;
    return matchNgay && matchTo;
  });

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 1200);
  };

  const tabButtonClass = (current) =>
    `px-5 py-2.5 rounded-2xl font-semibold transition ${
      tab === current ? "bg-amber-600 text-white shadow" : "bg-amber-100 text-amber-800 hover:bg-amber-200"
    }`;

  const controlClass =
    "mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500";

  return (
    <div className="space-y-6 text-amber-900">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-amber-400">Analytics</p>
        <h1 className="text-3xl font-bold text-amber-900 mt-2">Thống kê kết quả sản xuất</h1>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className={tabButtonClass("tong-hop")} onClick={() => setTab("tong-hop")}>
          Báo cáo tổng hợp
        </button>
        <button className={tabButtonClass("chi-tiet")} onClick={() => setTab("chi-tiet")}>
          Chi tiết theo lô hàng
        </button>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow p-6">
        <div className="grid gap-6 md:grid-cols-4">
          <div>
            <label className="text-sm font-semibold text-amber-800">Từ ngày</label>
            <input
              type="date"
              name="tuNgay"
              value={filter.tuNgay}
              onChange={handleFilterChange}
              className={controlClass}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-amber-800">Đến ngày</label>
            <input
              type="date"
              name="denNgay"
              value={filter.denNgay}
              onChange={handleFilterChange}
              className={controlClass}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-amber-800">Tổ sản xuất</label>
            <select
              name="toSX"
              value={filter.toSX}
              onChange={handleFilterChange}
              className={controlClass}
            >
              <option value="">-- Tất cả tổ --</option>
              <option value="Tổ 1">Tổ 1</option>
              <option value="Tổ 2">Tổ 2</option>
              <option value="Tổ 3">Tổ 3</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              type="button"
              className="w-full rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold py-3 shadow hover:shadow-lg transition"
            >
              🔍 Tìm lô hàng
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-amber-700 text-white">
              {tab === "tong-hop" ? (
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Tổ sản xuất</th>
                  <th className="px-4 py-3 text-left font-semibold">Tổng sản lượng</th>
                  <th className="px-4 py-3 text-left font-semibold">Đạt chuẩn</th>
                  <th className="px-4 py-3 text-left font-semibold">Lỗi</th>
                  <th className="px-4 py-3 text-left font-semibold">Tỷ lệ đạt</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Mã lô</th>
                  <th className="px-4 py-3 text-left font-semibold">Tổ sản xuất</th>
                  <th className="px-4 py-3 text-left font-semibold">Sản phẩm</th>
                  <th className="px-4 py-3 text-left font-semibold">Số lượng</th>
                  <th className="px-4 py-3 text-left font-semibold">Đạt chuẩn</th>
                  <th className="px-4 py-3 text-left font-semibold">Lỗi</th>
                  <th className="px-4 py-3 text-left font-semibold">Ngày sản xuất</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-amber-50 bg-white">
              {tab === "tong-hop"
                ? dataTongHop.map((row, index) => (
                    <tr key={index} className="hover:bg-amber-50/60">
                      <td className="px-4 py-3 font-semibold">{row.toSX}</td>
                      <td className="px-4 py-3">{row.soLuong}</td>
                      <td className="px-4 py-3">{row.datChuan}</td>
                      <td className="px-4 py-3">{row.loi}</td>
                      <td className="px-4 py-3 text-amber-700 font-bold">{row.tiLeDat}</td>
                    </tr>
                  ))
                : filteredLoHang.length > 0
                ? filteredLoHang.map((row, index) => (
                    <tr key={index} className="hover:bg-amber-50/60">
                      <td className="px-4 py-3 font-semibold">{row.maLo}</td>
                      <td className="px-4 py-3">{row.toSX}</td>
                      <td className="px-4 py-3">{row.sanPham}</td>
                      <td className="px-4 py-3">{row.soLuong}</td>
                      <td className="px-4 py-3">{row.datChuan}</td>
                      <td className="px-4 py-3">{row.loi}</td>
                      <td className="px-4 py-3">{row.ngay}</td>
                    </tr>
                  ))
                : (
                    <tr>
                      <td colSpan="7" className="px-4 py-6 text-center text-amber-700">
                        Không tìm thấy lô hàng trong khoảng thời gian này.
                      </td>
                    </tr>
                  )}
            </tbody>
          </table>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-amber-900 text-white px-6 py-3 rounded-full font-semibold shadow-lg">
            ✅ Đã lọc lô hàng thành công
          </div>
        </div>
      )}
    </div>
  );
}
