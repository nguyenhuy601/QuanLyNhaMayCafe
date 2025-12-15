import { useEffect, useState, useCallback } from "react";
import { getIssuesWaitingWarehouseHead, confirmIssueReceivedApi } from "../../../api/warehouseHeadAPI";
import { fetchAllProducts } from "../../../services/productService";

export default function WarehouseHeadConfirmIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productsMap, setProductsMap] = useState({});

  const loadProducts = useCallback(async () => {
    try {
      const products = await fetchAllProducts();
      const map = {};
      products.forEach((p) => {
        map[p._id] = p;
        if (p.productId) map[p.productId] = p;
      });
      setProductsMap(map);
    } catch (err) {
      console.error("❌ Lỗi tải sản phẩm:", err);
    }
  }, []);

  const loadIssues = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getIssuesWaitingWarehouseHead();
      setIssues(data);
    } catch (err) {
      console.error("❌ Lỗi tải phiếu chờ xác nhận:", err);
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadIssues();
  }, [loadProducts, loadIssues]);

  const handleConfirm = async (id) => {
    if (!window.confirm("Xác nhận NVL đã đến xưởng?")) return;
    try {
      await confirmIssueReceivedApi(id);
      loadIssues();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  const renderProductName = (id) => productsMap[id]?.name || productsMap[id]?.tenSP || id;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Phiếu xuất NVL chờ xác nhận</h2>
      {loading && <div>Đang tải...</div>}
      {!loading && issues.length === 0 && <div>Không có phiếu cần xác nhận.</div>}

      {issues.length > 0 && (
        <div className="overflow-x-auto bg-white shadow rounded">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Mã phiếu</th>
                <th className="px-4 py-2 text-left">Kế hoạch</th>
                <th className="px-4 py-2 text-left">Ngày xuất</th>
                <th className="px-4 py-2 text-left">Xưởng nhận</th>
                <th className="px-4 py-2 text-left">Chi tiết</th>
                <th className="px-4 py-2 text-left">Trạng thái</th>
                <th className="px-4 py-2 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue._id} className="border-b">
                  <td className="px-4 py-2 font-semibold">{issue.maPhieuXuat}</td>
                  <td className="px-4 py-2">{issue.keHoach || "-"}</td>
                  <td className="px-4 py-2">
                    {issue.ngayXuat ? new Date(issue.ngayXuat).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-2">{issue.xuongNhan || "-"}</td>
                  <td className="px-4 py-2">
                    {issue.chiTiet?.map((item, idx) => (
                      <div key={idx} className="text-xs">
                        • {renderProductName(item.sanPham)}: {item.soLuong} ({item.loXuat || "N/A"})
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-2">
                    <span className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-800">
                      {issue.trangThai}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleConfirm(issue._id)}
                      className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm"
                    >
                      Xác nhận đã nhận
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

