const API_URL = import.meta.env.VITE_API_URL;

export const fetchOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // If no token or no API_URL, use mock data
    if (!token || !API_URL) {
      console.log('⚠️ No token or API_URL found, using mock data');
      return getMockOrdersWithPending();
    }

    console.log('📡 Fetching orders from:', `${API_URL}/orders`);
    const response = await fetch(`${API_URL}/orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`⚠️ API returned ${response.status}, using mock data`);
      return getMockOrdersWithPending();
    }

    const data = await response.json();
    console.log('✅ Fetched orders from API:', data);
    return data;
    
  } catch (error) {
    console.error('❌ Fetch orders error:', error);
    console.log('📦 Using mock data as fallback');
    
    // Fallback to mock data
    return getMockOrdersWithPending();
  }
};

// Helper function để merge mock data với pending orders từ localStorage
const getMockOrdersWithPending = () => {
  const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
  
  // Convert pending orders to format phù hợp
  const convertedPendingOrders = pendingOrders.map(order => ({
    _id: order.id,
    maDH: order.id,
    khachHang: { tenKH: order.customerName },
    ngayDat: order.createdAt,
    ngayYeuCauGiao: order.deliveryDate,
    trangThai: 'Chờ duyệt',
    chiTiet: [
      { 
        sanPham: { 
          tenSP: order.product || order.productName || 'Sản phẩm',
          loai: order.loai || 'sanpham',
          donViTinh: 'Túi' 
        }, 
        soLuong: parseInt(order.quantity) || 0, 
        donGia: 50000 
      }
    ],
    tongTien: (parseInt(order.quantity) || 0) * 50000
  }));

  // Merge và return
  const allOrders = [...convertedPendingOrders];
  console.log('📊 Total orders (pending + mock):', allOrders.length);
  
  return allOrders;
};

export const fetchOrderById = async (id) => {
  try {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/orders/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch order");

    const data = await response.json();
    console.log("✅ Order fetched by ID:", data);
    return data;
  } catch (error) {
    console.error("❌ Fetch order by ID error:", error);
    return null;
  }
};


export const updateOrder = async (id, updatedData) => {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("⚠️ No token — fallback mock update:", id, updatedData);
      return { success: true };
    }

    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Update failed: ${errorData}`);
    }

    const result = await response.json();
    console.log("✅ Updated order via API:", result);
    return result;
  } catch (error) {
    console.error("❌ Update order error:", error);
    return { success: false, message: error.message };
  }
};


export const approveOrders = async (orderIds) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('⚠️ No token, using localStorage for approval');
      return updateLocalStorageApproval(orderIds);
    }

    const results = await Promise.all(orderIds.map(orderId => 
      fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trangThai: 'Da duyet' })
      })
    ));
    
    console.log('✅ Orders approved via API');
    return results;
    
  } catch (error) {
    console.error('❌ Error approving orders:', error);
    console.log('📦 Using localStorage fallback for approval');
    
    return updateLocalStorageApproval(orderIds);
  }
};

// Helper function để update approval trong localStorage
const updateLocalStorageApproval = (orderIds) => {
  const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
  const approvedOrders = JSON.parse(localStorage.getItem('approvedOrders') || '[]');
  
  orderIds.forEach(orderId => {
    const index = pendingOrders.findIndex(order => order.id === orderId);
    if (index !== -1) {
      const approved = { 
        ...pendingOrders[index], 
        status: 'Da duyet', 
        approvedAt: new Date().toISOString() 
      };
      approvedOrders.push(approved);
      pendingOrders.splice(index, 1);
    }
  });
  
  localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
  localStorage.setItem('approvedOrders', JSON.stringify(approvedOrders));
  
  console.log('✅ Orders approved in localStorage');
  return orderIds.map(id => ({ ok: true }));
};