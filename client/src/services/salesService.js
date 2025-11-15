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
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/customers/search/${phone}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

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
    console.error("❌ Error fetching customer:", err);
  }
};


// Lấy tất cả sản phẩm
export const getAllProducts = async () => {
  try {
    if (API_URL) {
      const response = await fetch(`${API_URL}/products`, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        return data.map((p) => ({
          id: p._id,
          name: p.tenSP,
          price: p.donGia,
          unit: p.donViTinh,
          loai: p.loai || "sanpham",
        }));
      }
    }
  } catch (err) {
    console.error("❌ Error fetching products from API:", err);
  }
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
      const token = localStorage.getItem('token');
      
      // Nếu có API backend
      if (API_URL) {
        const response = await fetch(`${API_URL}/orders`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Chuyển đổi format từ backend sang format UI
          return data.map(order => ({
            id: order.maDH || order._id,
            product: order.chiTiet?.[0]?.sanPham?.tenSP || '',
            quantity: `${order.chiTiet?.[0]?.soLuong || 0}/${order.chiTiet?.[0]?.sanPham?.donViTinh || 'Túi'}`,
            deliveryDate: new Date(order.ngayYeuCauGiao).toLocaleDateString('vi-VN'),
            customerName: order.khachHang?.tenKH || '',
            email: order.khachHang?.email || '',
            address: order.khachHang?.diaChi || '',
            phone: order.khachHang?.sdt || '',
            status: order.trangThai,
            createdAt: order.ngayDat
          }));
        }
      }
      
      // Fallback: Sử dụng localStorage cho development
      const orders = JSON.parse(localStorage.getItem('salesOrders') || '[]');
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to localStorage
      const orders = JSON.parse(localStorage.getItem('salesOrders') || '[]');
      return orders;
    }
  },

  // Tạo đơn hàng mới
  createOrder: async (orderData) => {
    try {
      const token = localStorage.getItem('token');
      console.log("Creating order with data:", orderData);
      
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

        console.log("Response status:", response.status);
        const data = await response.text();
        console.log("Response data:", data);

        if (response.ok) {
          return true;
        } else {
          throw new Error(data);
        }
      }
      
      // Fallback: Lưu vào localStorage
      const orders = JSON.parse(localStorage.getItem('salesOrders') || '[]');
      const newOrder = {
        ...orderData,
        id: `DH${String(orders.length + 1).padStart(3, '0')}`,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      orders.push(newOrder);
      localStorage.setItem('salesOrders', JSON.stringify(orders));
      return newOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Cập nhật đơn hàng
  updateOrder: async (orderId, orderData) => {
    try {
      const token = localStorage.getItem('token');
      
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
      console.error('Error updating order:', error);
      throw error;
    }
  },

  // Hoàn thành đơn hàng (chuyển cho BGĐ duyệt)
  completeOrder: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Nếu có API backend
      if (API_URL) {
        const response = await fetch(`${API_URL}/orders/${orderId}/submit`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            trangThai: 'Chờ duyệt'
          })
        });

        if (response.ok) {
          return true;
        }
      }
      
      // Fallback: Di chuyển từ salesOrders sang pendingOrders
      const orders = JSON.parse(localStorage.getItem('salesOrders') || '[]');
      const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      
      const orderIndex = orders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        const completedOrder = {
          ...orders[orderIndex],
          status: 'Chờ duyệt',
          submittedAt: new Date().toISOString()
        };
        pendingOrders.push(completedOrder);
        orders.splice(orderIndex, 1);
        
        localStorage.setItem('salesOrders', JSON.stringify(orders));
        localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error completing order:', error);
      throw error;
    }
  }
};