import React, { useState, useEffect } from "react";
import { ChevronLeft, Calendar, X, Check } from "lucide-react";
import { searchCustomerByPhone, getAllProducts } from "../../services/salesService";
import { useOutletContext, useNavigate } from "react-router-dom";

const CreateOrder = () => {
  // 👉 Lấy context từ Order.jsx
  const {
    handleCreateOrder,
    handleUpdateOrder,
    editingOrder,
    setEditingOrder,
  } = useOutletContext();

  const navigate = useNavigate();

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

  const products = getAllProducts();

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

  const handleSearchCustomer = () => {
    const customer = searchCustomerByPhone(searchPhone);
    if (customer) {
      setCustomerFound(customer);
      setFormData({
        ...formData,
        customerName: customer.name,
        phone: customer.phone,
        address: customer.address,
        email: customer.email,
      });
    } else {
      setCustomerFound(null);
      setFormData({
        ...formData,
        customerName: "",
        phone: searchPhone,
        address: "",
        email: "",
      });
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
    setEditingOrder(null);
    navigate("/sales/list");
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

    setLoading(true);
    const orderData = {
      product: formData.product,
      quantity: `${formData.quantity}/Túi`,
      deliveryDate: formData.deliveryDate,
      customerName: formData.customerName,
      email: formData.email,
      address: formData.address,
      phone: formData.phone,
    };

    let success;
    if (editingOrder) {
      success = await handleUpdateOrder(editingOrder.id, orderData);
      if (success) alert("Cập nhật đơn hàng thành công!");
    } else {
      success = await handleCreateOrder(orderData);
      if (success) alert("Tạo đơn hàng thành công!");
    }

    if (success) {
      handleCancel();
    } else {
      alert("Có lỗi xảy ra!");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/sales/list")}
          className="flex items-center gap-2 text-amber-700 hover:text-amber-800"
        >
          <ChevronLeft size={20} />
          <span>Quay lại</span>
        </button>
      </div>

      <h2 className="text-2xl font-bold text-center mb-8">
        {editingOrder ? "CHỈNH SỬA ĐƠN HÀNG" : "TẠO ĐƠN HÀNG"}
      </h2>

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
              className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition"
            >
              Tìm kiếm
            </button>
          </div>
          {customerFound && (
            <div className="mt-2 text-green-600 text-sm">
              ✓ Tìm thấy khách hàng: {customerFound.name}
            </div>
          )}
          {searchPhone && !customerFound && customerFound !== null && (
            <div className="mt-2 text-orange-600 text-sm">
              ! Không tìm thấy khách hàng. Vui lòng nhập thông tin mới.
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-2">
            Sản phẩm: <span className="text-red-500">*</span>
          </label>
          <select
            name="product"
            value={formData.product}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Chọn sản phẩm</option>
            {products.map((product) => (
              <option key={product.id} value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Ngày giao: <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Calendar
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              size={20}
            />
          </div>
        </div>

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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Họ tên Khách hàng: <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            placeholder="Họ và tên"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      <div className="flex gap-4 justify-center mt-8">
        <button
          onClick={handleCancel}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold disabled:opacity-50"
        >
          <X size={20} />
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50"
        >
          <Check size={20} />
          {loading ? "Đang xử lý..." : editingOrder ? "Cập nhật" : "Xác nhận"}
        </button>
      </div>
    </div>
  );
};

export default CreateOrder;
