import React from "react";

/** Lấy giá trị từ object theo chuỗi key dạng "a.b.c" */
function getNestedValue(obj, path) {
  if (!obj) return "";
  return path.split(".").reduce((acc, key) => {
    return acc ? acc[key] : "";
  }, obj);
}

export default function QCResultTable({ data = [], columns = [] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full table-auto divide-y divide-gray-100">
        <thead className="bg-[#8B4513]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-white text-sm font-semibold uppercase tracking-wider ${
                    col.align === "right" ? "text-right" : ""
                  }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 italic">
                Không có dữ liệu
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row._id || idx} className="border-t odd:bg-white even:bg-gray-50 hover:bg-[#f9f4ef]">
                {columns.map((col) => {
                  let raw = getNestedValue(row, col.key);
                  let value = raw;

                  // Format ngày
                  if (col.key === "ngayKiemTra" && value) {
                    value = new Date(value).toLocaleDateString("vi-VN");
                  }

                  // Format kết quả (Dat -> Đạt)
                  if (col.key === "ketQuaChung") {
                    value = value === "Dat" ? "Đạt" : value === "Khong dat" || value === "KhongDat" ? "Không đạt" : value;
                  }

                  return (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-sm text-gray-700 ${col.align === "right" ? "text-right" : ""}`}
                    >
                      {col.key === "ketQuaChung" ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (value === "Đạt" || value === "Dat") ? 'bg-[#f1dfc6] text-[#5d2f18]' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {value ?? ""}
                        </span>
                      ) : (
                        value ?? ""
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
