import React, { useState, useEffect } from "react";
import { ChevronLeft, X, Check } from "lucide-react";
import { searchCustomerByPhone, getFinishedProducts, getOrderById } from "../../../services/salesService";
import { useNavigate, useOutletContext, useSearchParams } from "react-router-dom";

const CreateOrder = () => {
  const { handleCreateOrder, handleUpdateOrder, editingOrder, setEditingOrder } = useOutletContext() || {};
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [searchPhone, setSearchPhone] = useState("");
  const [customerFound, setCustomerFound] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    product: "",
    deliveryDate: "",
    quantity: "",
    customerName: "",
    phone: "",
    address: "",
    email: "",
  });

  const [products, setProducts] = useState([]);

  // 🧩 Load danh sách sản phẩm (chỉ loại sản phẩm)
   useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getFinishedProducts();
        if (mounted && Array.isArray(list)) setProducts(list);
      } catch (err) {
        console.error("❌ Error loading finished products:", err);
        if (mounted) setProducts([]);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 🧩 Nếu có id trên URL → lấy đơn hàng để chỉnh sửa
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      const existing = getOrderById ? getOrderById(id) : null;
      if (existing) {
        setEditingOrder?.(existing);
      }
    }
  }, [searchParams]);

  // 🧩 Khi editingOrder thay đổi → load dữ liệu vào form
  useEffect(() => {
    if (editingOrder) {
      setFormData({
        product: editingOrder.product,
        deliveryDate: editingOrder.deliveryDate,
        quantity: editingOrder.quantity.replace("/Túi", ""),
        customerName: editingOrder.customerName,
        phone: editingOrder.phone,
        address: editingOrder.address,
        email: editingOrder.email,
      });
      setSearchPhone(editingOrder.phone);
    }
  }, [editingOrder]);

  // 🧩 Xử lý tìm kiếm khách hàng theo SĐT
  const handleSearchCustomer = async () => {
    if (!searchPhone) {
      alert("Vui lòng nhập số điện thoại khách hàng.");
      return;
    }

    try {
      setLoading(true);
      const customer = await searchCustomerByPhone(searchPhone);

      if (customer) {
        setCustomerFound(customer);
        setFormData((prev) => ({
          ...prev,
          customerName: customer.name || "",
          phone: customer.phone || searchPhone,
          address: customer.address || "",
          email: customer.email || "",
        }));
      } else {
        setCustomerFound(null);
        setFormData((prev) => ({
          ...prev,
          customerName: "",
          phone: searchPhone,
          address: "",
          email: "",
        }));
      }
    } catch (error) {
      console.error("Error searching customer:", error);
      alert("Không thể tìm kiếm khách hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCancel = () => {
    setFormData({
      product: "",
      deliveryDate: "",
      quantity: "",
      customerName: "",
      phone: "",
      address: "",
      email: "",
    });
    setSearchPhone("");
    setCustomerFound(null);
    setEditingOrder?.(null);
    navigate("/orders/list");
  };

  const handleSubmit = async () => {
    if (
      !formData.product ||
      !formData.deliveryDate ||
      !formData.quantity ||
      !formData.customerName ||
      !formData.phone
    ) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

     // 🕒 Kiểm tra ngày giao hàng hợp lệ
  const today = new Date();
  const deliveryDate = new Date(formData.deliveryDate);

  // Loại bỏ phần giờ phút để so sánh đúng ngày
  today.setHours(0, 0, 0, 0);
  deliveryDate.setHours(0, 0, 0, 0);

  if (deliveryDate < today) {
    alert("Ngày giao hàng phải lớn hơn hoặc bằng ngày hôm nay!");
    return;
  }

  setLoading(true);

    setLoading(true);
    const selectedProduct = products.find((p) => p.id === formData.product) || {};

    if (!selectedProduct?.id) {
      setLoading(false);
      alert("Sản phẩm chưa được tải hoặc không hợp lệ.");
      return;
    }

    // Format dữ liệu gửi backend
    const orderData = {
      khachHang: {
        tenKH: formData.customerName,
        sdt: formData.phone,
        email: formData.email || undefined,
        diaChi: formData.address || undefined,
      },
      ngayYeuCauGiao: formData.deliveryDate, // chỉ giữ yyyy-mm-dd
      diaChiGiao: formData.address || undefined,
      chiTiet: [
        {
          sanPham: selectedProduct.id,
          soLuong: parseInt(formData.quantity, 10),
          donGia: selectedProduct.price || 0,
          thanhTien:
            parseInt(formData.quantity, 10) * (selectedProduct.price || 0),
        },
      ],
      tongTien:
        parseInt(formData.quantity, 10) * (selectedProduct.price || 0),
      ghiChu: "",
    };

    try {
      console.log("📦 Sending order data:", orderData);
      let success;
      if (editingOrder) {
        success = await handleUpdateOrder(editingOrder.id, orderData);
        if (success) alert("Cập nhật đơn hàng thành công!");
      } else {
        success = await handleCreateOrder(orderData);
        if (success) alert("Tạo đơn hàng thành công!");
      }

      if (success) handleCancel();
      else alert("Có lỗi xảy ra!");
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Có lỗi xảy ra: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      {/* 🔙 Quay lại */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/orders")}
          className="flex items-center gap-2 text-amber-700 hover:text-amber-800"
        >
          <ChevronLeft size={20} />
          <span>Quay lại</span>
        </button>
      </div>

      <h2 className="text-2xl font-bold text-center mb-8">
        {editingOrder ? "CHỈNH SỬA ĐƠN HÀNG" : "TẠO ĐƠN HÀNG"}
      </h2>

      {/* 🔍 Tìm khách hàng */}
      {!editingOrder && (
        <div className="mb-6 p-4 bg-amber-50 rounded-lg">
          <label className="block text-sm font-semibold mb-2">
            Tìm kiếm khách hàng:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="Nhập số điện thoại khách hàng"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              onClick={handleSearchCustomer}
              disabled={loading}
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:opacity-50"
            >
              {loading ? "Đang tìm..." : "Tìm kiếm"}
            </button>
          </div>

          {customerFound && (
            <div className="mt-3 text-green-700 text-sm">
              ✓ Đã tìm thấy khách hàng:{" "}
              <strong>{customerFound.name}</strong>
            </div>
          )}
          {searchPhone && !customerFound && customerFound !== null && (
            <div className="mt-3 text-orange-600 text-sm">
              ⚠️ Không tìm thấy khách hàng. Vui lòng nhập thông tin mới.
            </div>
          )}
        </div>
      )}

      {/* 📋 Form thông tin đơn hàng */}
      <div className="space-y-6">
        {/* Sản phẩm */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Sản phẩm: <span className="text-red-500">*</span>
          </label>
          <select
            name="product"
            value={formData.product}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Chọn sản phẩm</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name}{" "}
                {product.price
                  ? `- ${product.price.toLocaleString()}đ`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Ngày giao */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Ngày giao: <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="deliveryDate"
            value={formData.deliveryDate}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Số lượng */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Số lượng sản phẩm: <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleInputChange}
            placeholder="Số lượng"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Thông tin khách hàng */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            Họ tên khách hàng: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            placeholder="Họ và tên"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Số điện thoại: <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Số điện thoại"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Địa chỉ:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Địa chỉ khách hàng"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex gap-4 justify-center mt-8">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold disabled:opacity-50"
        >
          <X size={20} /> Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
        >
          <Check size={20} />{" "}
          {loading ? "Đang xử lý..." : editingOrder ? "Cập nhật" : "Xác nhận"}
        </button>
      </div>
    </div>
  );
};

export default CreateOrder;
