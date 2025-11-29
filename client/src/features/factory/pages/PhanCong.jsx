import React, { useState } from "react";

export default function PhanCong() {
  const [tab, setTab] = useState("danh-sach");
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    maTo: "",
    ngay: "",
    tenTo: "",
    maKH: "",
    congViec: "",
    nguoi: "",
  });

  const [jobs, setJobs] = useState([
    { maTo: "A001", tenTo: "Tổ 1", congViec: "Rang cà phê", nguoi: "Xưởng trưởng A", ngay: "2025-05-01", maKH: "DH001" },
    { maTo: "A002", tenTo: "Tổ 2", congViec: "Xay cà phê", nguoi: "Xưởng trưởng A", ngay: "2025-06-05", maKH: "DH010" },
    { maTo: "A003", tenTo: "Tổ 3", congViec: "Đóng gói", nguoi: "Xưởng trưởng A", ngay: "2025-05-10", maKH: "DH011" },
  ]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { maTo, ngay, tenTo, maKH, congViec, nguoi } = formData;
    if (!maTo || !ngay || !tenTo || !maKH || !congViec || !nguoi) {
      setError("⚠️ Vui lòng nhập đầy đủ tất cả thông tin trước khi lưu!");
      return;
    }

    setJobs((prev) => [...prev, { ...formData }]);
    setError("");
    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setTab("danh-sach");
    }, 1500);

    setFormData({
      maTo: "",
      ngay: "",
      tenTo: "",
      maKH: "",
      congViec: "",
      nguoi: "",
    });
  };

  const tabButtonClass = (current) =>
    `px-5 py-2.5 rounded-2xl font-semibold transition ${
      tab === current
        ? "bg-amber-600 text-white shadow"
        : "bg-amber-100 text-amber-800 hover:bg-amber-200"
    }`;

  const inputClass =
    "mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button className={tabButtonClass("danh-sach")} onClick={() => setTab("danh-sach")}>
          Danh sách công việc
        </button>
        <button className={tabButtonClass("tao")} onClick={() => setTab("tao")}>
          Phân công
        </button>
      </div>

      {tab === "danh-sach" && (
        <div className="bg-white border border-amber-100 rounded-3xl shadow">
          <div className="overflow-x-auto rounded-3xl">
            <table className="min-w-full text-sm text-amber-900">
              <thead className="bg-amber-700 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Mã tổ</th>
                  <th className="px-4 py-3 text-left font-semibold">Tên tổ</th>
                  <th className="px-4 py-3 text-left font-semibold">Công việc</th>
                  <th className="px-4 py-3 text-left font-semibold">Người phân công</th>
                  <th className="px-4 py-3 text-left font-semibold">Ngày</th>
                  <th className="px-4 py-3 text-left font-semibold">Mã kế hoạch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 bg-white">
                {jobs.map((row, index) => (
                  <tr key={index} className="hover:bg-amber-50/60">
                    <td className="px-4 py-3 font-semibold">{row.maTo}</td>
                    <td className="px-4 py-3">{row.tenTo}</td>
                    <td className="px-4 py-3">{row.congViec}</td>
                    <td className="px-4 py-3">{row.nguoi}</td>
                    <td className="px-4 py-3">{row.ngay}</td>
                    <td className="px-4 py-3">{row.maKH}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "tao" && (
        <div className="bg-white border border-amber-100 rounded-3xl shadow p-6">
          <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-amber-800">Mã tổ</label>
              <select
                name="maTo"
                value={formData.maTo}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">-- Chọn mã tổ --</option>
                <option value="A001">A001</option>
                <option value="A002">A002</option>
                <option value="A003">A003</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-amber-800">Ngày phân công</label>
              <input
                type="date"
                name="ngay"
                value={formData.ngay}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-amber-800">Tên tổ</label>
              <select
                name="tenTo"
                value={formData.tenTo}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">-- Chọn tổ --</option>
                <option value="Tổ 1">Tổ 1</option>
                <option value="Tổ 2">Tổ 2</option>
                <option value="Tổ 3">Tổ 3</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-amber-800">Mã kế hoạch</label>
              <select
                name="maKH"
                value={formData.maKH}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">-- Chọn mã kế hoạch --</option>
                <option value="DH001">DH001</option>
                <option value="DH010">DH010</option>
                <option value="DH011">DH011</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-amber-800">Tên công việc</label>
              <input
                type="text"
                name="congViec"
                value={formData.congViec}
                onChange={handleChange}
                placeholder="Nhập công việc..."
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-amber-800">Người phân công</label>
              <input
                type="text"
                name="nguoi"
                value={formData.nguoi}
                onChange={handleChange}
                placeholder="Tên người phân công..."
                className={inputClass}
              />
            </div>

            {error && (
              <div className="md:col-span-2 text-center text-red-600 font-semibold">{error}</div>
            )}

            <div className="md:col-span-2 flex justify-center">
              <button
                type="submit"
                className="px-10 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 font-semibold text-white shadow hover:shadow-lg transition"
              >
                Lưu phân công
              </button>
            </div>
          </form>
        </div>
      )}

      {showPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-amber-900 text-white px-6 py-3 rounded-full font-semibold shadow-lg">
            ✅ Tạo bảng phân công thành công
          </div>
        </div>
      )}
    </div>
  );
}
