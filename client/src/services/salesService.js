import { toVietnameseStatus } from "../utils/statusMapper";
import { getToken, handle401Error } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

// Lấy đơn hàng theo ID
export const getOrderById = (id) => {
  const orders = JSON.parse(localStorage.getItem('salesOrders') || '[]');
  return orders.find(order => order.id === id) || null;
};

export const searchCustomerByPhone = async (phone) => {
  if (!phone) return null;

  try {
    if (API_URL) {
      const token = getToken();
      const response = await fetch(`${API_URL}/customers/search/${phone}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      // Xử lý lỗi 401
      if (response.status === 401) {
        handle401Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        return null;
      }

      if (response.ok) {
        const data = await response.json();
        return {
          id: data._id,
          name: data.tenKH,
          phone: data.sdt,
          email: data.email || "",
          address: data.diaChi || ""
        };
      }

      if (response.status === 404) return null;
    }
  } catch (err) {
  }
};


// Lấy tất cả sản phẩm
export const getFinishedProducts = async () => {
  try {
    const token = getToken();

    if (!API_URL) {
      return getFallbackProducts();
    }

    const response = await fetch(`${API_URL}/products/finished`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    // Xử lý lỗi 401
    if (response.status === 401) {
      handle401Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return getFallbackProducts(); // Return fallback để không crash UI
    }

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 503) {
        return getFallbackProducts();
      }
      throw new Error(`Failed to fetch finished products: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      return getFallbackProducts();
    }

    return data.map((p) => ({
      id: p._id,
      name: p.tenSP,
      price: p.donGia,
      unit: p.donViTinh,
      loai: p.loai,
    }));
  } catch (err) {
    return getFallbackProducts();
  }
};

// Fallback data khi API không available
const getFallbackProducts = () => {
  return [
    { id: "fallback-1", name: "Cà phê hạt Arabica", price: 150000, unit: "kg", loai: "sanpham" },
    { id: "fallback-2", name: "Cà phê hạt Robusta", price: 120000, unit: "kg", loai: "sanpham" },
    { id: "fallback-3", name: "Cà phê rang xay", price: 200000, unit: "kg", loai: "sanpham" },
  ];
};


// Lấy sản phẩm theo ID
export const getProductById = (id) => {
  return mockProducts.find(product => product.id === id) || null;
};

// API cho Nhân viên bán hàng
export const salesAPI = {
  // Lấy danh sách đơn hàng của nhân viên bán hàng (chưa duyệt)
  getOrders: async () => {
    try {
      const token = getToken();
      
      // Nếu có API backend
      if (API_URL) {
        const response = await fetch(`${API_URL}/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // Xử lý lỗi 401
        if (response.status === 401) {
          handle401Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          return [];
        }

        if (response.ok) {
          const data = await response.json();
          return data.map(order => ({
            id: order.maDH || order._id,
            product: order.chiTiet?.[0]?.sanPham?.tenSP || '',
            quantity: `${order.chiTiet?.[0]?.soLuong || 0}/${order.chiTiet?.[0]?.sanPham?.donViTinh || 'Túi'}`,
            deliveryDate: new Date(order.ngayYeuCauGiao).toLocaleDateString('vi-VN'),
            customerName: order.khachHang?.tenKH || '',
            email: order.khachHang?.email || '',
            address: order.khachHang?.diaChi || '',
            phone: order.khachHang?.sdt || '',
            status: toVietnameseStatus(order.trangThai),
            createdAt: order.ngayDat
          }));
        }
      }
      
      // Fallback: Sử dụng localStorage cho development
      const orders = JSON.parse(localStorage.getItem('salesOrders') || '[]');
      return orders.map((order) => ({
        ...order,
        status: toVietnameseStatus(order.status),
        trangThai: toVietnameseStatus(order.trangThai || order.status),
      }));
    } catch (error) {
      // Fallback to localStorage
      const orders = JSON.parse(localStorage.getItem('salesOrders') || '[]');
      return orders.map((order) => ({
        ...order,
        status: toVietnameseStatus(order.status),
        trangThai: toVietnameseStatus(order.trangThai || order.status),
      }));
    }
  },

  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    try {
      const token = getToken();
      
      // Nếu có API backend
      if (API_URL) {
        const response = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(orderData)
        });
        
        // Xử lý lỗi 401 (token expired) - phải xử lý trước khi đọc response body
        if (response.status === 401) {
          let errorData;
          try {
            errorData = await response.json();
          } catch {
            errorData = { message: "Token không hợp lệ hoặc đã hết hạn", error: "jwt expired" };
          }
          handle401Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tạo đơn hàng.");
          const expiredError = new Error("Token đã hết hạn");
          expiredError.isHandled = true;
          throw expiredError;
        }
        
        if (!response.ok) {
          let errorMessage = "Có lỗi xảy ra khi tạo đơn hàng";
          try {
            const errorText = await response.text();
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorText;
          } catch (e) {
            // Nếu không parse được, dùng message mặc định
          }
          throw new Error(errorMessage);
        }

        const data = await response.json().catch(async () => {
          return await response.text();
        });
        return data;
      }
      
      // Fallback: Lưu vào localStorage
      const orders = JSON.parse(localStorage.getItem('salesOrders') || '[]');
      const newOrder = {
        ...orderData,
        id: `DH${String(orders.length + 1).padStart(3, '0')}`,
        status: 'Chờ duyệt',
        trangThai: 'Chờ duyệt',
        createdAt: new Date().toISOString()
      };
      orders.push(newOrder);
      localStorage.setItem('salesOrders', JSON.stringify(orders));
      return newOrder;
    } catch (error) {
      // Nếu đã xử lý 401 và redirect, không throw lại để tránh error log thừa
      if (error.isHandled || error.message === "Token đã hết hạn") {
        // Đã redirect về login, không cần throw nữa
        return null;
      }
      throw error;
    }
  },

  // Cập nhật đơn hàng
  updateOrder: async (orderId, orderData) => {
    try {
      const token = getToken();
      
      // Nếu có API backend
      if (API_URL) {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            khachHang: {
              tenKH: orderData.customerName,
              sdt: orderData.phone,
              email: orderData.email,
              diaChi: orderData.address
            },
            ngayYeuCauGiao: new Date(orderData.deliveryDate).toISOString(),
            chiTiet: [
              {
                sanPham: {
                  tenSP: orderData.product,
                  donViTinh: 'Túi'
                },
                soLuong: parseInt(orderData.quantity.replace('/Túi', '')),
                donGia: mockProducts.find(p => p.name === orderData.product)?.price || 0
              }
            ]
          })
        });

        // Xử lý lỗi 401
        if (response.status === 401) {
          handle401Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          return null;
        }

        if (response.ok) {
          return await response.json();
        }
      }
      
      // Fallback: Cập nhật localStorage
      const orders = JSON.parse(localStorage.getItem('salesOrders') || '[]');
      const index = orders.findIndex(order => order.id === orderId);
      if (index !== -1) {
        orders[index] = { ...orders[index], ...orderData };
        localStorage.setItem('salesOrders', JSON.stringify(orders));
        return orders[index];
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  // Hoàn thành đơn hàng (chuyển cho BGĐ duyệt)
  completeOrder: async (orderId) => {
    try {
      const token = getToken();
      
      // Nếu có API backend
      if (API_URL) {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            trangThai: 'Chờ duyệt'
          })
        });

        // Xử lý lỗi 401
        if (response.status === 401) {
          handle401Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
          return false;
        }

        if (response.ok) {
          return true;
        }
      }
      
      // Fallback: cập nhật trạng thái tại chỗ trong localStorage
      const orders = JSON.parse(localStorage.getItem('salesOrders') || '[]');
      const orderIndex = orders.findIndex(order => order.id === orderId || order._id === orderId);
      if (orderIndex !== -1) {
        orders[orderIndex] = {
          ...orders[orderIndex],
          status: 'Chờ duyệt',
          trangThai: 'Chờ duyệt',
          submittedAt: new Date().toISOString()
        };
        localStorage.setItem('salesOrders', JSON.stringify(orders));
        return true;
      }
      return false;
    } catch (error) {
      throw error;
    }
  }
};