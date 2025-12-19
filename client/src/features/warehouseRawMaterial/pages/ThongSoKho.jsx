import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../../api/axiosConfig';
import useAutoRefresh from '../../../hooks/useAutoRefresh';

export default function ThongSoKho() {
  const [materials, setMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInventoryData = useCallback(async () => {
    try {
      setLoading(true);
      // Gọi endpoint từ warehouse-service thay vì sales-service trực tiếp
      const [materialsRes, productsRes] = await Promise.all([
        axiosInstance.get('/warehouse/products/materials'),
        axiosInstance.get('/warehouse/products/finished'),
      ]);

      setMaterials(Array.isArray(materialsRes.data) ? materialsRes.data : []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setError(null);
    } catch (err) {
      setError(`Không thể tải thông số kho: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventoryData();
  }, [fetchInventoryData]);

  // Auto-refresh mỗi 10 giây để đảm bảo dữ liệu luôn mới nhất
  useAutoRefresh(fetchInventoryData, { interval: 10000 });

  // Lắng nghe sự kiện cập nhật kho khi Ban giám đốc duyệt phiếu nhập/xuất
  useEffect(() => {
    const onInventoryUpdated = () => {
      // Refresh ngay lập tức khi nhận được event
      fetchInventoryData();
    };
    window.addEventListener('inventory-updated', onInventoryUpdated);
    return () => window.removeEventListener('inventory-updated', onInventoryUpdated);
  }, [fetchInventoryData]);

  // Refresh khi tab/ cửa sổ quay lại foreground (trường hợp duyệt ở tab khác / tài khoản khác)
  useEffect(() => {
    const onFocus = () => fetchInventoryData();
    const onVisibilityChange = () => {
      if (!document.hidden) onFocus();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchInventoryData]);

  // Tính tổng số lượng NVL
  const totalMaterials = materials.reduce((sum, item) => sum + (item.soLuong || 0), 0);
  
  // Tính tổng số lượng thành phẩm
  const totalProducts = products.reduce((sum, item) => sum + (item.soLuong || 0), 0);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <h1 className="text-2xl font-semibold">Thông số kho</h1>
        <button
          onClick={fetchInventoryData}
          className="px-4 py-2 bg-[#8B4513] text-white rounded hover:bg-[#A0522D]"
        >
          Làm mới
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-lg font-semibold">Đang tải dữ liệu...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {!loading && (
        <>
          {/* Tổng quan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng nguyên vật liệu</h3>
              <p className="text-3xl font-bold text-amber-700">{totalMaterials.toLocaleString('vi-VN')}</p>
              <p className="text-sm text-gray-500 mt-1">kg</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Tổng thành phẩm</h3>
              <p className="text-3xl font-bold text-green-700">{totalProducts.toLocaleString('vi-VN')}</p>
              <p className="text-sm text-gray-500 mt-1">đơn vị</p>
            </div>
          </div>

          {/* Chi tiết nguyên vật liệu */}
          <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
            <h2 className="text-xl font-semibold mb-4">Chi tiết nguyên vật liệu</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#8B4513] text-white text-sm">
                  <th className="py-3 px-4">Mã NVL</th>
                  <th className="py-3 px-4">Tên nguyên vật liệu</th>
                  <th className="py-3 px-4">Số lượng tồn kho</th>
                  <th className="py-3 px-4">Đơn vị</th>
                  <th className="py-3 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {materials.length > 0 ? (
                  materials.map((material) => (
                    <tr key={material._id} className="border-b hover:bg-[#f9f4ef] transition">
                      <td className="py-2 px-4">{material.maSP || material._id}</td>
                      <td className="py-2 px-4">{material.tenSP || 'N/A'}</td>
                      <td className="py-2 px-4 font-semibold">
                        {(material.soLuong || 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-2 px-4">{material.donViTinh || 'kg'}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          (material.soLuong || 0) > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(material.soLuong || 0) > 0 ? 'Còn hàng' : 'Hết hàng'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-4 px-4 text-center text-gray-500">
                      Chưa có nguyên vật liệu nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Chi tiết thành phẩm */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h2 className="text-xl font-semibold mb-4">Chi tiết thành phẩm</h2>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#8B4513] text-white text-sm">
                  <th className="py-3 px-4">Mã SP</th>
                  <th className="py-3 px-4">Tên thành phẩm</th>
                  <th className="py-3 px-4">Số lượng tồn kho</th>
                  <th className="py-3 px-4">Đơn vị</th>
                  <th className="py-3 px-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product._id} className="border-b hover:bg-[#f9f4ef] transition">
                      <td className="py-2 px-4">{product.maSP || product._id}</td>
                      <td className="py-2 px-4">{product.tenSP || 'N/A'}</td>
                      <td className="py-2 px-4 font-semibold">
                        {(product.soLuong || 0).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-2 px-4">{product.donViTinh || 'túi'}</td>
                      <td className="py-2 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${
                          (product.soLuong || 0) > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {(product.soLuong || 0) > 0 ? 'Còn hàng' : 'Hết hàng'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-4 px-4 text-center text-gray-500">
                      Chưa có thành phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

