// ...existing code...
import React, { useState } from "react";

const STAT_TYPES = [
  { value: "tatca", label: "Tất cả" },
  { value: "tonkho", label: "Sản phẩm tồn kho" },
  { value: "nguyenvatlieu", label: "Nguyên vật liệu" },
  { value: "han_san_xuat", label: "Hạn sản xuất" },
  { value: "kho_luu_tru", label: "Kho lưu trữ" },
];

export default function ThongKeFilter({ initial = {}, onSearch }) {
  const [type, setType] = useState(initial.type || "tatca");
  const [startDate, setStartDate] = useState(initial.startDate || "");
  const [endDate, setEndDate] = useState(initial.endDate || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ type, startDate, endDate });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-4">
      <div className="flex flex-col md:flex-row md:items-end md:gap-4">
        <div className="w-full md:w-1/4">
          <label className="text-sm block mb-1">Loại thống kê</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border rounded px-2 py-1"
          >
            {STAT_TYPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/4">
          <label className="text-sm block mb-1">Ngày bắt đầu</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div className="w-full md:w-1/4">
          <label className="text-sm block mb-1">Ngày kết thúc</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border rounded px-2 py-1"
          />
        </div>

        <div className="mt-3 md:mt-0 md:w-1/6">
          <button
            type="submit"
            className="w-full bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
          >
            Tìm kiếm
          </button>
        </div>
      </div>
    </form>
  );
}