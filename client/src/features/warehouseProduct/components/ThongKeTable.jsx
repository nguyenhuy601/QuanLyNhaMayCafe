// ...existing code...
import React from "react";

export default function ThongKeTable({ data = [], columns = [] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full table-auto divide-y divide-gray-100">
        <thead className="bg-[#8B4513]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-white text-sm font-semibold uppercase tracking-wider ${col.align === "right" ? "text-right" : ""}`}
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
              <tr key={row.code ?? idx} className={`border-t odd:bg-white even:bg-gray-50 hover:bg-[#f9f4ef]`}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 text-sm text-gray-700 ${col.align === "right" ? "text-right" : ""}`}
                  >
                    {row[col.key] ?? ""}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}