import { useState, useEffect } from "react";
import { Building2, UserCheck, Package, X, Plus } from "lucide-react";
import { fetchFinishedProducts } from "../../../services/productService";
import authAPI from "../../../api/authAPI";

const XuongTruongManager = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ productId: "", maSP: "", tenSP: "" });
  const [availableProducts, setAvailableProducts] = useState([]);

  useEffect(() => {
    loadAccounts();
    loadProducts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await authAPI.getAccounts();
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const list = await fetchFinishedProducts();
      setAvailableProducts(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Không thể tải danh sách sản phẩm:", err);
    }
  };

  const handleAssignRole = async (accountId, currentRole) => {
    if (currentRole === "xuongtruong") {
      if (!window.confirm("Tài khoản này đã là xưởng trưởng. Bạn có muốn hủy quyền xưởng trưởng?")) {
        return;
      }
      // Hủy quyền xưởng trưởng - đổi sang role khác (ví dụ: worker)
      try {
        await authAPI.updateAccountRole(accountId, "worker");
        alert("Đã hủy quyền xưởng trưởng thành công");
        loadAccounts();
      } catch (err) {
        alert(err.message || "Không thể cập nhật quyền");
      }
    } else {
      if (!window.confirm("Bạn có muốn gán quyền xưởng trưởng cho tài khoản này?")) {
        return;
      }
      try {
        await authAPI.updateAccountRole(accountId, "xuongtruong");
        alert("Đã gán quyền xưởng trưởng thành công");
        loadAccounts();
      } catch (err) {
        alert(err.message || "Không thể cập nhật quyền");
      }
    }
  };

  const handleOpenProductModal = (account) => {
    if (account.role !== "xuongtruong") {
      alert("Chỉ có thể gán sản phẩm phụ trách cho xưởng trưởng");
      return;
    }
    setSelectedAccount(account);
    setProducts(account.sanPhamPhuTrach || []);
    setShowProductModal(true);
  };

  const handleAddProduct = () => {
    // Kiểm tra: chỉ cho phép 1 sản phẩm
    if (products.length >= 1) {
      alert("Một xưởng trưởng chỉ có thể phụ trách 1 sản phẩm duy nhất. Vui lòng xóa sản phẩm hiện tại trước khi thêm mới.");
      return;
    }

    // Nếu chọn từ danh sách có sẵn
    if (newProduct.productId && availableProducts.length > 0) {
      const found = availableProducts.find((p) => p._id === newProduct.productId || p.productId === newProduct.productId);
      if (found) {
        const mapped = {
          productId: found._id || found.productId,
          maSP: found.maSP,
          tenSP: found.tenSP || found.tenSanPham || found.name,
        };
        setProducts([mapped]); // Chỉ lưu 1 sản phẩm
        setNewProduct({ productId: "", maSP: "", tenSP: "" });
        return;
      }
    }

    // Trường hợp nhập tay: bắt buộc tên
    if (!newProduct.tenSP) {
      alert("Vui lòng nhập tên sản phẩm");
      return;
    }

    // Nếu không nhập productId thì tự sinh
    let productId = newProduct.productId;
    if (!productId) {
      const slug =
        newProduct.tenSP
          .toString()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "")
          .toUpperCase() || "SP";
      const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
      productId = `SP_${slug}_${rand}`;
    }

    setProducts([{ ...newProduct, productId }]); // Chỉ lưu 1 sản phẩm
    setNewProduct({ productId: "", maSP: "", tenSP: "" });
  };

  const handleRemoveProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleSaveProducts = async () => {
    try {
      await authAPI.assignProductsToManager(selectedAccount._id, products);
      alert("Đã cập nhật sản phẩm phụ trách thành công");
      setShowProductModal(false);
      loadAccounts();
    } catch (err) {
      alert(err.message || "Không thể cập nhật sản phẩm phụ trách");
    }
  };

  const xuongTruongAccounts = accounts.filter((acc) => acc.role === "xuongtruong");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#5a2e0f]">Quản lý Xưởng trưởng</h2>
          <p className="text-gray-600">Gán quyền và sản phẩm phụ trách cho xưởng trưởng</p>
        </div>
        <button
          onClick={loadAccounts}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition"
        >
          Làm mới
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Danh sách Xưởng trưởng */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-4 bg-[#8b4513] text-white">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Building2 size={20} />
            Danh sách Xưởng trưởng ({xuongTruongAccounts.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-amber-100 text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Sản phẩm phụ trách</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {xuongTruongAccounts.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-gray-500">
                    Chưa có xưởng trưởng nào
                  </td>
                </tr>
              ) : (
                xuongTruongAccounts.map((account) => (
                  <tr key={account._id} className="border-b hover:bg-amber-50 transition">
                    <td className="px-4 py-3 font-semibold">{account.email}</td>
                    <td className="px-4 py-3">
                      {account.sanPhamPhuTrach && account.sanPhamPhuTrach.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {account.sanPhamPhuTrach.map((sp, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                            >
                              {sp.tenSP || sp.maSP || sp.productId}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">Chưa gán sản phẩm</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleOpenProductModal(account)}
                          className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg flex items-center gap-1 hover:bg-green-600 transition"
                        >
                          <Package size={16} />
                          Gán sản phẩm
                        </button>
                        <button
                          onClick={() => handleAssignRole(account._id, account.role)}
                          className="px-3 py-1.5 bg-rose-500 text-white text-sm rounded-lg flex items-center gap-1 hover:bg-rose-600 transition"
                        >
                          Hủy quyền
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal gán sản phẩm phụ trách */}
      {showProductModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#5a2e0f]">
                  Gán sản phẩm phụ trách cho: {selectedAccount.email}
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Form thêm sản phẩm */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold">Gán sản phẩm</h4>
                <div className="grid grid-cols-3 gap-3">
                  <select
                    value={newProduct.productId}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) {
                        // Clear selection → cho phép nhập tay
                        setNewProduct({ productId: "", maSP: "", tenSP: "" });
                        return;
                      }
                      const found = availableProducts.find(
                        (p) => p._id === value || p.productId === value
                      );
                      if (found) {
                        setNewProduct({
                          productId: found._id || found.productId,
                          maSP: found.maSP || "",
                          tenSP:
                            found.tenSanPham || found.tenSP || found.name || "",
                        });
                      } else {
                        setNewProduct({ ...newProduct, productId: value });
                      }
                    }}
                    className="px-3 py-2 border rounded-lg"
                  >
                    <option value="">-- Chọn sản phẩm có sẵn --</option>
                    {availableProducts.map((p) => (
                      <option key={p._id} value={p._id}>
                        {(p.tenSanPham || p.tenSP || p.name || p.maSP) ?? "Sản phẩm"}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder={newProduct.productId ? "Mã SP (tự điền)" : "Mã SP"}
                    value={newProduct.maSP}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, maSP: e.target.value })
                    }
                    className="px-3 py-2 border rounded-lg"
                    disabled={!!newProduct.productId}
                  />
                  <input
                    type="text"
                    placeholder={newProduct.productId ? "Tên SP (tự điền)" : "Tên SP"}
                    value={newProduct.tenSP}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, tenSP: e.target.value })
                    }
                    className="px-3 py-2 border rounded-lg"
                    disabled={!!newProduct.productId}
                  />
                </div>
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Gán sản phẩm
                </button>
              </div>

              {/* Sản phẩm phụ trách (chỉ 1 sản phẩm) */}
              <div>
                <h4 className="font-semibold mb-3">Sản phẩm phụ trách</h4>
                {products.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Chưa có sản phẩm nào</p>
                ) : (
                  <div className="space-y-2">
                    {products.map((sp, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold">{sp.tenSP || "N/A"}</p>
                          <p className="text-sm text-gray-600">
                            {sp.maSP && `Mã: ${sp.maSP}`} {sp.productId && `| ID: ${sp.productId}`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveProduct(index)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {products.length > 0 && (
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ Một xưởng trưởng chỉ có thể phụ trách 1 sản phẩm duy nhất
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowProductModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveProducts}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500"
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default XuongTruongManager;

