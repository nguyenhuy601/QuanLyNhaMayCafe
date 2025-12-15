import { useState, useEffect, useCallback } from "react";
import {
  getPendingMaterialReceipts,
  approveMaterialReceiptApi,
  getPendingMaterialIssues,
  approveMaterialIssueApi,
} from "../../../api/directorAPI";
import useAutoRefresh from "../../../hooks/useAutoRefresh";
import { fetchPlanById } from "../../../services/factoryService";
import { fetchAllProducts } from "../../../services/productService";
import { fetchXuongs } from "../../../services/factoryService";
import axiosInstance from "../../../api/axiosConfig";

export default function ApproveMaterialTransactions() {
  const [activeTab, setActiveTab] = useState("nhap"); // "nhap" hoặc "xuat"
  
  // State cho phiếu nhập
  const [receipts, setReceipts] = useState([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  
  // State cho phiếu xuất
  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(false);
  
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Cache cho dữ liệu tham chiếu
  const [productsCache, setProductsCache] = useState({});
  const [plansCache, setPlansCache] = useState({});
  const [xuongsCache, setXuongsCache] = useState({});

  // Load cache dữ liệu tham chiếu
  const loadReferenceData = useCallback(async () => {
    try {
      // Load products
      const products = await fetchAllProducts();
      const productsMap = {};
      products.forEach(p => {
        productsMap[p._id] = p;
        if (p.productId) productsMap[p.productId] = p;
      });
      setProductsCache(productsMap);
      
      // Load xuongs
      const xuongs = await fetchXuongs();
      const xuongsMap = {};
      xuongs.forEach(x => {
        xuongsMap[x._id] = x;
      });
      setXuongsCache(xuongsMap);
    } catch (error) {
      console.error("❌ Lỗi tải dữ liệu tham chiếu:", error);
    }
  }, []);

  // Helper để lấy plan detail (sử dụng functional update)
  const getPlanDetail = useCallback(async (planId) => {
    if (!planId) return null;
    
    // Kiểm tra cache hiện tại
    setPlansCache(prev => {
      if (prev[planId]) return prev; // Không cần update nếu đã có
      return prev;
    });
    
    // Nếu chưa có trong cache, fetch
    try {
      const plan = await fetchPlanById(planId);
      if (plan) {
        setPlansCache(prev => ({ ...prev, [planId]: plan }));
        return plan;
      }
    } catch (err) {
      console.error(`❌ Error fetching plan ${planId}:`, err);
    }
    return null;
  }, []);

  // Load phiếu nhập
  const loadReceipts = useCallback(async () => {
    setLoadingReceipts(true);
    try {
      const rawList = await getPendingMaterialReceipts();
      console.log("📋 Raw material receipts from API:", rawList);
      
      if (!Array.isArray(rawList) || rawList.length === 0) {
        setReceipts([]);
        return;
      }
      
      // Enrich dữ liệu với thông tin chi tiết
      const enrichedReceipts = await Promise.all(
        rawList.map(async (receipt) => {
          const enriched = { ...receipt };
          
          // Fetch plan details
          if (receipt.keHoach) {
            // Kiểm tra cache trước
            if (plansCache[receipt.keHoach]) {
              enriched.keHoachDetail = plansCache[receipt.keHoach];
            } else {
              enriched.keHoachDetail = await getPlanDetail(receipt.keHoach);
            }
          }
          
          // Enrich chi tiết sản phẩm
          if (receipt.chiTiet && Array.isArray(receipt.chiTiet)) {
            enriched.chiTiet = receipt.chiTiet.map(item => ({
              ...item,
              productDetail: productsCache[item.sanPham] || null,
            }));
          }
          
          return enriched;
        })
      );
      
      setReceipts(enrichedReceipts);
    } catch (error) {
      console.error("❌ Lỗi tải phiếu nhập kho NVL:", error);
      if (error.response?.status !== 401) {
        setReceipts([]);
      }
    } finally {
      setLoadingReceipts(false);
    }
  }, [productsCache, plansCache, getPlanDetail]);

  // Load phiếu xuất
  const loadIssues = useCallback(async () => {
    setLoadingIssues(true);
    try {
      const rawList = await getPendingMaterialIssues();
      console.log("📋 Raw material issues from API:", rawList);
      
      if (!Array.isArray(rawList) || rawList.length === 0) {
        setIssues([]);
        return;
      }
      
      // Enrich dữ liệu với thông tin chi tiết
      const enrichedIssues = await Promise.all(
        rawList.map(async (issue) => {
          const enriched = { ...issue };
          
          // Fetch plan details
          if (issue.keHoach) {
            // Kiểm tra cache trước
            if (plansCache[issue.keHoach]) {
              enriched.keHoachDetail = plansCache[issue.keHoach];
            } else {
              enriched.keHoachDetail = await getPlanDetail(issue.keHoach);
            }
          }
          
          // Enrich xưởng nhận
          if (issue.xuongNhan) {
            enriched.xuongNhanDetail = xuongsCache[issue.xuongNhan] || null;
          }
          
          // Enrich chi tiết sản phẩm
          if (issue.chiTiet && Array.isArray(issue.chiTiet)) {
            enriched.chiTiet = issue.chiTiet.map(item => ({
              ...item,
              productDetail: productsCache[item.sanPham] || null,
            }));
          }
          
          return enriched;
        })
      );
      
      setIssues(enrichedIssues);
    } catch (error) {
      console.error("❌ Lỗi tải phiếu xuất kho NVL:", error);
      if (error.response?.status !== 401) {
        setIssues([]);
      }
    } finally {
      setLoadingIssues(false);
    }
  }, [productsCache, plansCache, xuongsCache, getPlanDetail]);

  // Load reference data khi component mount
  useEffect(() => {
    loadReferenceData();
  }, [loadReferenceData]);

  // Load data khi chuyển tab hoặc khi cache thay đổi
  useEffect(() => {
    if (activeTab === "nhap") {
      loadReceipts();
    } else {
      loadIssues();
    }
  }, [activeTab, loadReceipts, loadIssues]);

  // Auto refresh cho tab hiện tại
  useAutoRefresh(
    activeTab === "nhap" ? loadReceipts : loadIssues,
    { interval: 12000 }
  );

  // Xử lý Duyệt phiếu nhập
  const handleApproveReceipt = async (id) => {
    if(!window.confirm("Xác nhận duyệt phiếu nhập kho NVL này? Sau khi duyệt, nguyên vật liệu sẽ được cộng vào kho.")) return;
    try {
        await approveMaterialReceiptApi(id);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
        loadReceipts();
        // Đợi một chút để đảm bảo backend đã cập nhật xong trước khi phát event
        setTimeout(() => {
          console.log("📢 Phát event inventory-updated sau khi duyệt phiếu nhập");
          window.dispatchEvent(new CustomEvent("inventory-updated"));
        }, 500);
    } catch (error) {
        alert("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  // Xử lý Duyệt phiếu xuất
  const handleApproveIssue = async (id) => {
    if(!window.confirm("Xác nhận duyệt phiếu xuất kho NVL này? Sau khi duyệt, nguyên vật liệu sẽ được trừ khỏi kho.")) return;
    try {
        await approveMaterialIssueApi(id);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
        loadIssues();
        // Đợi một chút để đảm bảo backend đã cập nhật xong trước khi phát event
        setTimeout(() => {
          console.log("📢 Phát event inventory-updated sau khi duyệt phiếu xuất");
          window.dispatchEvent(new CustomEvent("inventory-updated"));
        }, 500);
    } catch (error) {
        alert("Lỗi: " + (error.response?.data?.message || error.message));
    }
  };

  const StatusChip = ({ status, type }) => {
    const map = type === "nhap" 
      ? {
          "Cho nhap": { bg: "#FEF3C7", fg: "#92400E" },
          "Da nhap": { bg: "#D1FAE5", fg: "#065F46" },
        }
      : {
          "Cho xuat": { bg: "#FEF3C7", fg: "#92400E" },
          "Da xuat": { bg: "#D1FAE5", fg: "#065F46" },
        };
    
    const style = map[status] || { bg: "#E5E7EB", fg: "#374151" };
    
    return (
      <span style={{ backgroundColor: style.bg, color: style.fg, padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
        {status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN");
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Phê duyệt nhập xuất NVL</h2>
      
      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("nhap")}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === "nhap"
              ? "text-amber-800 border-b-2 border-amber-800"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Phiếu nhập kho
          {receipts.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {receipts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("xuat")}
          className={`px-6 py-3 font-semibold transition-colors relative ${
            activeTab === "xuat"
              ? "text-amber-800 border-b-2 border-amber-800"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Phiếu xuất kho
          {issues.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {issues.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content: Phiếu nhập */}
      {activeTab === "nhap" && (
        <div className="rounded-2xl border border-black/10 bg-white p-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-200 text-black/80">
                <th className="p-2">Mã phiếu</th>
                <th className="p-2">Kế hoạch</th>
                <th className="p-2">Ngày nhập</th>
                <th className="p-2">Chi tiết NVL</th>
                <th className="p-2">Ghi chú</th>
                <th className="p-2">Trạng thái</th>
                <th className="p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loadingReceipts ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center">Đang tải...</td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-gray-500">Chưa có phiếu nhập kho NVL nào đang chờ duyệt</p>
                      <p className="text-xs text-gray-400">
                        Phiếu nhập kho NVL sẽ được tạo bởi quản lý kho nguyên vật liệu
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                receipts.map((receipt, i) => (
                  <tr key={i} className="border-t text-center hover:bg-neutral-50 transition">
                    <td className="p-2 font-bold">{receipt.maPhieu}</td>
                    <td className="p-2">
                      {receipt.keHoachDetail?.maKeHoach || receipt.keHoach || "N/A"}
                    </td>
                    <td className="p-2">{formatDate(receipt.ngayNhap)}</td>
                    <td className="p-2 text-left">
                      {receipt.chiTiet && receipt.chiTiet.length > 0 ? (
                        <ul className="list-disc list-inside text-xs">
                          {receipt.chiTiet.map((item, idx) => (
                            <li key={idx}>
                              {item.productDetail?.tenSP || item.productDetail?.tenSanPham || item.sanPham || "N/A"}: {item.soLuong || 0} {item.donViTinh || item.productDetail?.donViTinh || "kg"}
                              {item.loNhap && ` (Lô: ${item.loNhap})`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "Không có"
                      )}
                    </td>
                    <td className="p-2 text-left max-w-xs truncate" title={receipt.ghiChu}>
                      {receipt.ghiChu || "N/A"}
                    </td>
                    <td className="p-2">
                      <StatusChip status={receipt.trangThai} type="nhap" />
                    </td>
                    <td className="p-2 space-x-2">
                      {receipt.trangThai === 'Cho nhap' && (
                        <button 
                          onClick={() => handleApproveReceipt(receipt._id)} 
                          className="bg-green-100 text-green-800 px-3 py-1 rounded border border-green-200 hover:bg-green-200"
                        >
                          Duyệt
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content: Phiếu xuất */}
      {activeTab === "xuat" && (
        <div className="rounded-2xl border border-black/10 bg-white p-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-200 text-black/80">
                <th className="p-2">Mã phiếu</th>
                <th className="p-2">Kế hoạch</th>
                <th className="p-2">Xưởng nhận</th>
                <th className="p-2">Ngày xuất</th>
                <th className="p-2">Chi tiết NVL</th>
                <th className="p-2">Trạng thái</th>
                <th className="p-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loadingIssues ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center">Đang tải...</td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-gray-500">Chưa có phiếu xuất kho NVL nào đang chờ duyệt</p>
                      <p className="text-xs text-gray-400">
                        Phiếu xuất kho NVL sẽ được tạo bởi quản lý kho nguyên vật liệu
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                issues.map((issue, i) => (
                  <tr key={i} className="border-t text-center hover:bg-neutral-50 transition">
                    <td className="p-2 font-bold">{issue.maPhieuXuat}</td>
                    <td className="p-2">
                      {issue.keHoachDetail?.maKeHoach || issue.keHoach || "N/A"}
                    </td>
                    <td className="p-2">
                      {issue.xuongNhanDetail?.tenXuong || issue.xuongNhan || "N/A"}
                    </td>
                    <td className="p-2">{formatDate(issue.ngayXuat)}</td>
                    <td className="p-2 text-left">
                      {issue.chiTiet && issue.chiTiet.length > 0 ? (
                        <ul className="list-disc list-inside text-xs">
                          {issue.chiTiet.map((item, idx) => (
                            <li key={idx}>
                              {item.productDetail?.tenSP || item.productDetail?.tenSanPham || item.sanPham || "N/A"}: {item.soLuong || 0} {item.productDetail?.donViTinh || "kg"}
                              {item.loXuat && ` (Lô: ${item.loXuat})`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "Không có"
                      )}
                    </td>
                    <td className="p-2">
                      <StatusChip status={issue.trangThai} type="xuat" />
                    </td>
                    <td className="p-2 space-x-2">
                      {issue.trangThai === 'Cho xuat' && (
                        <button 
                          onClick={() => handleApproveIssue(issue._id)} 
                          className="bg-green-100 text-green-800 px-3 py-1 rounded border border-green-200 hover:bg-green-200"
                        >
                          Duyệt
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background: "rgba(0,0,0,.3)"}}>
          <div className="bg-white rounded-xl shadow-lg px-8 py-6 text-center">
            <div className="text-4xl mb-2">✅</div>
            <p>Thành công!</p>
          </div>
        </div>
      )}
    </div>
  );
}

