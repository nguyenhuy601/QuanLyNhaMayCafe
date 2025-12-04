// ...existing code...
import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar.jsx";
import Header from "../components/header.jsx";
import ThongKeFilter from "../components/ThongKeFilter.jsx";
import ThongKeTable from "../components//ThongKeTable.jsx";
import axiosInstance from '../../../api/axiosConfig';

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
  const [allData, setAllData] = useState([]); // fetched data from backend
  const [columns, setColumns] = useState(COLUMN_SETS.tatca);
  const [loading, setLoading] = useState(false);

  // fetch data from backend products/materials
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // finished products and materials endpoints (sales-service)
        const [finishedRes, materialsRes] = await Promise.all([
          axiosInstance.get('/products/finished'),
          axiosInstance.get('/products/materials')
        ]);

        const finished = Array.isArray(finishedRes.data) ? finishedRes.data : [];
        const materials = Array.isArray(materialsRes.data) ? materialsRes.data : [];

        // normalize to common ui shape
        const normalize = (p, type) => ({
          code: p.maSP || p._id,
          name: p.tenSP || '',
          quantity: p.soLuong || 0,
          producedDate: p.ngaySanXuat || '',
          expiryDate: p.hanSuDung || '',
          warehouse: p.kho || '',
          note: type || p.loai || '',
        });

        const combined = [
          ...finished.map((p) => normalize(p, 'sanpham')),
          ...materials.map((p) => normalize(p, 'nguyenvatlieu')),
        ];

        setAllData(combined);
        setData(combined);
        setColumns(COLUMN_SETS.tatca);
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm/nguyên vật liệu:', err.response?.data || err.message || err);
        // fallback to empty
        setAllData([]);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = async (filters) => {
    setLoading(true);
    try {
      // filter by date range (producedDate) if provided
      let result = (allData || []).slice();

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