import React, { useState } from "react";

function PhanCong() {
  const [view, setView] = useState("list"); // "list" hoặc "form"

  const data = [
    {
      maTo: "A001",
      tenTo: "Tổ 1",
      tenCongViec: "Rang cà phê",
      nguoiPhanCong: "Xưởng trưởng A",
      ngayPhanCong: "2025-05-01",
      maKeHoach: "DH001",
    },
    {
      maTo: "A002",
      tenTo: "Tổ 2",
      tenCongViec: "Xay cà phê",
      nguoiPhanCong: "Xưởng trưởng A",
      ngayPhanCong: "2025-05-06",
      maKeHoach: "DH010",
    },
    {
      maTo: "A003",
      tenTo: "Tổ 3",
      tenCongViec: "Đóng gói",
      nguoiPhanCong: "Xưởng trưởng A",
      ngayPhanCong: "2025-05-10",
      maKeHoach: "DH011",
    },
  ];

  return (
    <div className="text-gray-900">
      <h1 className="text-2xl font-bold mb-4 text-[#5a3314]">
        📋 Phân công công việc
      </h1>

      {/* Hai nút chuyển chế độ */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setView("list")}
          className={`px-6 py-2 rounded-full shadow-md text-white transition ${
            view === "list"
              ? "bg-[#5a3314]"
              : "bg-[#a96738] hover:bg-[#8b5530]"
          }`}
        >
          Danh sách công việc
        </button>
        <button
          onClick={() => setView("form")}
          className={`px-6 py-2 rounded-full shadow-md text-white transition ${
            view === "form"
              ? "bg-[#5a3314]"
              : "bg-[#a96738] hover:bg-[#8b5530]"
          }`}
        >
          Phân công
        </button>
      </div>

      {/* Hiển thị theo chế độ */}
      {view === "list" ? (
        // ==== BẢNG DANH SÁCH ====
        <div className="bg-[#6b3e1d] text-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#814c25] text-white uppercase text-[13px]">
              <tr>
                <th className="py-3 px-4 text-left">Mã tổ</th>
                <th className="py-3 px-4 text-left">Tên tổ</th>
                <th className="py-3 px-4 text-left">Tên công việc</th>
                <th className="py-3 px-4 text-left">Người phân công</th>
                <th className="py-3 px-4 text-left">Ngày phân công</th>
                <th className="py-3 px-4 text-left">Mã kế hoạch</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-[#8b5530]" : "bg-[#a96738]"
                  } hover:bg-[#b67440] transition`}
                >
                  <td className="py-3 px-4">{item.maTo}</td>
                  <td className="py-3 px-4">{item.tenTo}</td>
                  <td className="py-3 px-4">{item.tenCongViec}</td>
                  <td className="py-3 px-4">{item.nguoiPhanCong}</td>
                  <td className="py-3 px-4">{item.ngayPhanCong}</td>
                  <td className="py-3 px-4">{item.maKeHoach}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // ==== FORM PHÂN CÔNG ====
        <div className="bg-white border border-gray-300 rounded-lg p-6 shadow-md max-w-4xl">
          <form className="grid grid-cols-2 gap-6">
            {/* Mã tổ */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#5a3314]">
                Mã tổ
              </label>
              <select className="w-full border rounded-md px-3 py-2 focus:outline-none">
                <option>A001</option>
                <option>A002</option>
                <option>A003</option>
              </select>
            </div>

            {/* Ngày phân công */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#5a3314]">
                Ngày phân công
              </label>
              <input
                type="date"
                className="w-full border rounded-md px-3 py-2 focus:outline-none"
              />
            </div>

            {/* Tên tổ */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#5a3314]">
                Tên tổ
              </label>
              <select className="w-full border rounded-md px-3 py-2 focus:outline-none">
                <option>Tổ 1</option>
                <option>Tổ 2</option>
                <option>Tổ 3</option>
              </select>
            </div>

            {/* Mã kế hoạch */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#5a3314]">
                Mã kế hoạch
              </label>
              <select className="w-full border rounded-md px-3 py-2 focus:outline-none">
                <option>DH001</option>
                <option>DH010</option>
                <option>DH011</option>
              </select>
            </div>

            {/* Tên công việc */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#5a3314]">
                Tên công việc
              </label>
              <input
                type="text"
                placeholder="Nhập công việc"
                className="w-full border rounded-md px-3 py-2 focus:outline-none"
              />
            </div>

            {/* Người phân công */}
            <div>
              <label className="block text-sm font-medium mb-2 text-[#5a3314]">
                Người phân công
              </label>
              <input
                type="text"
                placeholder="Nhập chức vụ người phân công"
                className="w-full border rounded-md px-3 py-2 focus:outline-none"
              />
            </div>

            {/* Nút Lưu */}
            <div className="col-span-2 flex justify-end mt-4">
              <button
                type="submit"
                className="bg-[#5a3314] text-white px-6 py-2 rounded-md hover:bg-[#4b2a10] transition"
              >
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default PhanCong;
