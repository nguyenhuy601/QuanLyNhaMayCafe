import React, { useEffect, useState, useCallback } from "react";
import ThongKeFilter from "../components/ThongKeFilter.jsx";
import ThongKeTable from "../components/ThongKeTable.jsx";
import axiosInstance from '../../../api/axiosConfig';
import useRealtime from '../../../hooks/useRealtime';

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

export default function ThongKeWP() {
  const [data, setData] = useState([]);
  const [allData, setAllData] = useState([]); // fetched data from backend
  const [allProducts, setAllProducts] = useState([]); // chỉ sản phẩm
  const [allMaterials, setAllMaterials] = useState([]); // chỉ nguyên vật liệu
  const [columns, setColumns] = useState(COLUMN_SETS.tatca);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("sanpham"); // "sanpham" hoặc "nguyenvatlieu"

  // fetch data from backend products/materials
  const loadData = useCallback(async () => {
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

      const productsData = finished.map((p) => normalize(p, 'sanpham'));
      const materialsData = materials.map((p) => normalize(p, 'nguyenvatlieu'));
      const combined = [...productsData, ...materialsData];

      setAllData(combined);
      setAllProducts(productsData);
      setAllMaterials(materialsData);
    } catch (err) {
      // fallback to empty
      setAllData([]);
      setAllProducts([]);
      setAllMaterials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật data và columns khi activeTab hoặc allProducts/allMaterials thay đổi
  useEffect(() => {
    if (activeTab === "sanpham") {
      setData(allProducts);
      setColumns(COLUMN_SETS.tatca);
    } else {
      setData(allMaterials);
      setColumns(COLUMN_SETS.nguyenvatlieu);
    }
  }, [activeTab, allProducts, allMaterials]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime updates
  useRealtime({
    eventHandlers: {
      FINISHED_RECEIPT_APPROVED: loadData,
      FINISHED_ISSUE_APPROVED: loadData,
      FINISHED_RECEIPT_CREATED: loadData,
      FINISHED_ISSUE_CREATED: loadData,
      MATERIAL_RECEIPT_APPROVED: loadData,
      MATERIAL_ISSUE_APPROVED: loadData,
      MATERIAL_RECEIPT_CREATED: loadData,
      MATERIAL_ISSUE_CREATED: loadData,
      warehouse_events: loadData, // Generic warehouse events
    },
  });

  const handleSearch = async (filters) => {
    setLoading(true);
    try {
      // Chọn dữ liệu nguồn dựa trên tab hiện tại
      let sourceData = activeTab === "sanpham" ? [...allProducts] : [...allMaterials];
      
      // filter by date range (producedDate) if provided
      let result = sourceData.slice();

      if (filters.startDate) {
        result = result.filter((r) => (r.producedDate ?? "") >= filters.startDate);
      }
      if (filters.endDate) {
        result = result.filter((r) => (r.producedDate ?? "") <= filters.endDate);
      }

      // change columns and further processing depending on type
      const type = filters.type || "tatca";
      
      // Áp dụng columns phù hợp với tab
      if (activeTab === "sanpham") {
        setColumns(COLUMN_SETS[type] || COLUMN_SETS.tatca);
      } else {
        setColumns(COLUMN_SETS.nguyenvatlieu);
      }

      if (type === "han_san_xuat" && activeTab === "sanpham") {
        // sort by expiryDate ascending (oldest first)
        result = result.sort((a, b) => (a.expiryDate ?? "").localeCompare(b.expiryDate ?? ""));
      } else if (type === "kho_luu_tru" && activeTab === "sanpham") {
        // group/priority by warehouse (no grouping UI here, just sort by warehouse)
        result = result.sort((a, b) => (a.warehouse ?? "").localeCompare(b.warehouse ?? ""));
      } else if (type === "tonkho" && activeTab === "sanpham") {
        // show products with quantity > 0
        result = result.filter((r) => Number(r.quantity) > 0);
      }
      // for 'tatca' leave as is

      setData(result);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi chuyển tab
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Data và columns sẽ tự động cập nhật qua useEffect
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Thống kê</h1>

      {/* Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => handleTabChange("sanpham")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "sanpham"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Sản phẩm
            {allProducts.length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-800 py-0.5 px-2 rounded-full text-xs">
                {allProducts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange("nguyenvatlieu")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "nguyenvatlieu"
                ? "border-amber-600 text-amber-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Nguyên vật liệu
            {allMaterials.length > 0 && (
              <span className="ml-2 bg-amber-100 text-amber-800 py-0.5 px-2 rounded-full text-xs">
                {allMaterials.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      <ThongKeFilter onSearch={handleSearch} />

      {loading ? (
        <div className="p-4 bg-white rounded shadow">Đang tải...</div>
      ) : (
        <ThongKeTable data={data} columns={columns} />
      )}
    </div>
  );
}