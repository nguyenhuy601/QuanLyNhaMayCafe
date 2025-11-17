// ...existing code...
import React, { useEffect, useState } from "react";
import Sidebar from "../../components/QuanLyKhoThanhPham/sidebar";
import Header from "../../components/QuanLyKhoThanhPham/header";
import ThongKeFilter from "../../components/QuanLyKhoThanhPham/ThongKeFilter";
import ThongKeTable from "../../components/QuanLyKhoThanhPham/ThongKeTable";

const COLUMN_SETS = {
  tatca: [
    { key: "code", label: "Mã sản phẩm" },
    { key: "name", label: "Tên sản phẩm" },
    { key: "quantity", label: "Số lượng", align: "right" },
    { key: "producedDate", label: "Ngày sản xuất" },
    { key: "expiryDate", label: "Hạn sử dụng" },
    { key: "warehouse", label: "Kho" },
    { key: "note", label: "Ghi chú" },
  ],
  tonkho: [
    { key: "code", label: "Mã sản phẩm" },
    { key: "name", label: "Tên sản phẩm" },
    { key: "quantity", label: "Số lượng", align: "right" },
    { key: "warehouse", label: "Kho" },
    { key: "note", label: "Ghi chú" },
  ],
  nguyenvatlieu: [
    { key: "code", label: "Mã nguyên vật liệu" },
    { key: "name", label: "Tên nguyên vật liệu" },
    { key: "quantity", label: "Số lượng", align: "right" },
    { key: "producedDate", label: "Ngày sản xuất" },
    { key: "expiryDate", label: "Hạn sử dụng" },
    { key: "warehouse", label: "Kho" },
    { key: "note", label: "Ghi chú" },
  ],
  han_san_xuat: [
    { key: "code", label: "Mã sản phẩm" },
    { key: "name", label: "Tên sản phẩm" },
    { key: "expiryDate", label: "Hạn sử dụng" },
    { key: "quantity", label: "Số lượng", align: "right" },
    { key: "warehouse", label: "Kho" },
    { key: "note", label: "Ghi chú" },
  ],
  kho_luu_tru: [
    { key: "warehouse", label: "Kho" },
    { key: "code", label: "Mã sản phẩm" },
    { key: "name", label: "Tên sản phẩm" },
    { key: "quantity", label: "Số lượng", align: "right" },
    { key: "note", label: "Ghi chú" },
  ],
};

export default function ThongKe() {
  const [activeMenu, setActiveMenu] = useState("ThongKe");
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState(COLUMN_SETS.tatca);
  const [loading, setLoading] = useState(false);

  // expanded mock data for testing
  const MOCK = [
    { code: "SP001", name: "Cà phê rang xay 500g", quantity: 120, producedDate: "2025-09-01", expiryDate: "2026-03-01", warehouse: "Kho A", note: "" },
    { code: "SP002", name: "Cà phê hạt 1kg", quantity: 45, producedDate: "2025-08-15", expiryDate: "2026-02-15", warehouse: "Kho B", note: "Lô mẫu" },
    { code: "NV001", name: "Đường kính", quantity: 500, producedDate: "2025-06-10", expiryDate: "2026-06-10", warehouse: "Kho NVL", note: "Nguyên vật liệu" },
    { code: "SP003", name: "Cà phê hòa tan 250g", quantity: 10, producedDate: "2024-12-01", expiryDate: "2025-06-01", warehouse: "Kho A", note: "Sắp hết hạn" },
    { code: "SP004", name: "Cà phê pha phin 250g", quantity: 300, producedDate: "2025-10-05", expiryDate: "2026-04-05", warehouse: "Kho C", note: "" },
    { code: "NV002", name: "Bao bì", quantity: 2000, producedDate: "2025-01-20", expiryDate: "2027-01-20", warehouse: "Kho NVL", note: "" },
    { code: "SP005", name: "Cà phê decaf 500g", quantity: 2, producedDate: "2024-11-10", expiryDate: "2025-05-10", warehouse: "Kho B", note: "Kiểm tra hạn" },
    { code: "SP006", name: "Cà phê đặc biệt 750g", quantity: 50, producedDate: "2025-02-14", expiryDate: "2025-08-14", warehouse: "Kho A", note: "" },
  ];

  useEffect(() => {
    setData(MOCK);
    setColumns(COLUMN_SETS.tatca);
  }, []);

  const handleSearch = async (filters) => {
    setLoading(true);
    try {
      // filter by date range (producedDate) if provided
      let result = MOCK.slice();

      if (filters.startDate) {
        result = result.filter((r) => (r.producedDate ?? "") >= filters.startDate);
      }
      if (filters.endDate) {
        result = result.filter((r) => (r.producedDate ?? "") <= filters.endDate);
      }

      // change columns and further processing depending on type
      const type = filters.type || "tatca";
      setColumns(COLUMN_SETS[type] || COLUMN_SETS.tatca);

      if (type === "han_san_xuat") {
        // sort by expiryDate ascending (oldest first)
        result = result.sort((a, b) => (a.expiryDate ?? "").localeCompare(b.expiryDate ?? ""));
      } else if (type === "nguyenvatlieu") {
        // simple filter to show items that look like raw materials (codes starting with NV)
        result = result.filter((r) => String(r.code).toUpperCase().startsWith("NV"));
      } else if (type === "kho_luu_tru") {
        // group/priority by warehouse (no grouping UI here, just sort by warehouse)
        result = result.sort((a, b) => (a.warehouse ?? "").localeCompare(b.warehouse ?? ""));
      } else if (type === "tonkho") {
        // show products with quantity > 0
        result = result.filter((r) => Number(r.quantity) > 0);
      }
      // for 'tatca' leave as is

      setData(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="p-6">
          <h1 className="text-2xl font-semibold mb-4">Thống kê</h1>

          <ThongKeFilter onSearch={handleSearch} />

          {loading ? (
            <div className="p-4 bg-white rounded shadow">Đang tải...</div>
          ) : (
            <ThongKeTable data={data} columns={columns} />
          )}
        </main>
      </div>
    </div>
  );
}