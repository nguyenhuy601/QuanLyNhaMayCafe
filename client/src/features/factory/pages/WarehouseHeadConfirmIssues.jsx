import { useEffect, useState, useCallback } from "react";
import { getIssuesWaitingWarehouseHead, confirmIssueReceivedApi } from "../../../api/warehouseHeadAPI";
import { fetchAllProducts } from "../../../services/productService";
import { getAllQcRequests, updateQcRequest } from "../../../services/qcService";

export default function WarehouseHeadConfirmIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productsMap, setProductsMap] = useState({});
  const [activeTab, setActiveTab] = useState("nvl");
  const [qcRequests, setQcRequests] = useState([]);
  const [loadingQc, setLoadingQc] = useState(false);

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
    }
  }, []);

  const loadIssues = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getIssuesWaitingWarehouseHead();
      setIssues(data);
    } catch (err) {
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadQc = useCallback(async () => {
    setLoadingQc(true);
    try {
      const data = await getAllQcRequests();
      // Chỉ lấy phiếu đang chờ xưởng trưởng duyệt
      const filtered = Array.isArray(data)
        ? data.filter((q) => q.trangThai === "Cho duyet xuong")
        : [];
      setQcRequests(filtered);
    } catch (err) {
      setQcRequests([]);
    } finally {
      setLoadingQc(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadIssues();
    loadQc();
  }, [loadProducts, loadIssues, loadQc]);

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
      <h2 className="text-2xl font-semibold mb-4">Duyệt phiếu</h2>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("nvl")}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            activeTab === "nvl"
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          Phiếu xuất NVL đến xưởng
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("qc")}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            activeTab === "qc"
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          Phiếu yêu cầu kiểm tra thành phẩm
        </button>
      </div>

      {activeTab === "nvl" && (
        <>
          {loading && <div>Đang tải phiếu NVL...</div>}
          {!loading && issues.length === 0 && <div>Không có phiếu NVL cần xác nhận.</div>}

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
        </>
      )}

      {activeTab === "qc" && (
        <>
          {loadingQc && <div>Đang tải phiếu QC...</div>}
          {!loadingQc && qcRequests.length === 0 && (
            <div>Không có phiếu QC chờ xưởng trưởng duyệt.</div>
          )}

          {qcRequests.length > 0 && (
            <div className="overflow-x-auto bg-white shadow rounded">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Mã phiếu QC</th>
                    <th className="px-4 py-2 text-left">Lô / Tổ</th>
                    <th className="px-4 py-2 text-left">Xưởng</th>
                    <th className="px-4 py-2 text-left">Sản phẩm</th>
                    <th className="px-4 py-2 text-left">Số lượng thành phẩm</th>
                    <th className="px-4 py-2 text-left">Ngày yêu cầu</th>
                    <th className="px-4 py-2 text-left">Trạng thái</th>
                    <th className="px-4 py-2 text-left">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {qcRequests.map((q) => (
                    <tr key={q._id} className="border-b">
                      <td className="px-4 py-2 font-semibold">{q.maPhieuQC}</td>
                      <td className="px-4 py-2">{q.loSanXuat || "-"}</td>
                      <td className="px-4 py-2">{q.xuong || "-"}</td>
                      <td className="px-4 py-2">
                        {q.sanPham?.ProductName || q.sanPhamName || "Chưa có tên"}
                      </td>
                      <td className="px-4 py-2">{q.soLuong ?? 0}</td>
                      <td className="px-4 py-2">
                        {q.ngayYeuCau ? new Date(q.ngayYeuCau).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-2">
                        <span className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-800">
                          {q.trangThai}
                        </span>
                      </td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          onClick={async () => {
                            if (
                              !window.confirm(
                                "Duyệt phiếu và gửi sang QC kiểm định thành phẩm?"
                              )
                            )
                              return;
                            try {
                              await updateQcRequest(q._id, { trangThai: "Cho QC" });
                              loadQc();
                            } catch (err) {
                              alert(
                                "Lỗi duyệt phiếu QC: " +
                                  (err?.response?.data?.error || err.message)
                              );
                            }
                          }}
                          className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white text-sm"
                        >
                          Duyệt & gửi QC
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm("Từ chối phiếu QC này?")) return;
                            try {
                              await updateQcRequest(q._id, { trangThai: "Tu choi" });
                              loadQc();
                            } catch (err) {
                              alert(
                                "Lỗi từ chối phiếu QC: " +
                                  (err?.response?.data?.error || err.message)
                              );
                            }
                          }}
                          className="px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 text-sm border border-red-300"
                        >
                          Từ chối
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

