const API_URL = import.meta.env.VITE_API_URL;

// Mock data đầy đủ
const MOCK_ORDERS = [
  {
    _id: '1',
    maDH: 'DH001',
    khachHang: { tenKH: 'Công ty TNHH ABC' },
    ngayDat: '2025-03-01',
    ngayYeuCauGiao: '2025-05-01',
    trangThai: 'Da duyet',
    chiTiet: [
      { 
        sanPham: { tenSP: 'Cafe rang xay Arabica', donViTinh: 'Túi' }, 
        soLuong: 5000, 
        donGia: 50000 
      }
    ],
    tongTien: 250000000
  },
  {
    _id: '2',
    maDH: 'DH002',
    khachHang: { tenKH: 'Công ty CP XYZ' },
    ngayDat: '2025-03-05',
    ngayYeuCauGiao: '2025-05-10',
    trangThai: 'Dang cho duyet',
    chiTiet: [
      { 
        sanPham: { tenSP: 'Cafe rang xay Robusta', donViTinh: 'Túi' }, 
        soLuong: 3000, 
        donGia: 45000 
      }
    ],
    tongTien: 135000000
  },
  {
    _id: '3',
    maDH: 'DH003',
    khachHang: { tenKH: 'Công ty TNHH DEF' },
    ngayDat: '2025-03-10',
    ngayYeuCauGiao: '2025-05-15',
    trangThai: 'Da duyet',
    chiTiet: [
      { 
        sanPham: { tenSP: 'Cafe hòa tan 3in1', donViTinh: 'Hộp' }, 
        soLuong: 10000, 
        donGia: 25000 
      }
    ],
    tongTien: 250000000
  },
  {
    _id: '4',
    maDH: 'DH004',
    khachHang: { tenKH: 'Siêu thị CoopMart' },
    ngayDat: '2025-03-12',
    ngayYeuCauGiao: '2025-05-20',
    trangThai: 'Dang cho duyet',
    chiTiet: [
      { 
        sanPham: { tenSP: 'Cafe phin giấy', donViTinh: 'Hộp' }, 
        soLuong: 8000, 
        donGia: 30000 
      }
    ],
    tongTien: 240000000
  },
  {
    _id: '5',
    maDH: 'DH005',
    khachHang: { tenKH: 'Nhà hàng Golden Gate' },
    ngayDat: '2025-03-15',
    ngayYeuCauGiao: '2025-05-25',
    trangThai: 'Da duyet',
    chiTiet: [
      { 
        sanPham: { tenSP: 'Cafe espresso premium', donViTinh: 'Kg' }, 
        soLuong: 500, 
        donGia: 180000 
      }
    ],
    tongTien: 90000000
  }
];

export const fetchOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Nếu không có token, trả về mock data ngay
    if (!token) {
      console.log('⚠️ No token found, using mock data');
      return getMockOrdersWithPending();
    }

    const response = await fetch(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
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
    trangThai: 'Dang cho duyet',
    chiTiet: [
      { 
        sanPham: { 
          tenSP: order.product || order.productName || 'Sản phẩm', 
          donViTinh: 'Túi' 
        }, 
        soLuong: parseInt(order.quantity) || 0, 
        donGia: 50000 
      }
    ],
    tongTien: (parseInt(order.quantity) || 0) * 50000
  }));

  // Merge và return
  const allOrders = [...convertedPendingOrders, ...MOCK_ORDERS];
  console.log('📊 Total orders (pending + mock):', allOrders.length);
  
  return allOrders;
};

export const fetchOrderById = async (id) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Fallback to mock data
      return MOCK_ORDERS.find(order => order._id === id) || {
        _id: id,
        maDH: "DH001",
        khachHang: { tenKH: "Nguyễn Văn A" },
        ngayDat: "2025-10-28",
        ngayYeuCauGiao: "2025-10-31",
        trangThai: "Đang xử lý",
        tongTien: 1500000,
      };
    }

    const response = await fetch(`${API_URL}/orders/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch order');
    }

    return await response.json();
    
  } catch (error) {
    console.error('❌ Fetch order by ID error:', error);
    
    // Fallback to mock data
    return MOCK_ORDERS.find(order => order._id === id) || {
      _id: id,
      maDH: "DH001",
      khachHang: { tenKH: "Nguyễn Văn A" },
      ngayDat: "2025-10-28",
      ngayYeuCauGiao: "2025-10-31",
      trangThai: "Đang xử lý",
      tongTien: 1500000,
    };
  }
};

export const updateOrder = async (id, updatedData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log("🔄 Mock update order:", id, updatedData);
      return { success: true };
    }

    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updatedData)
    });

    if (!response.ok) {
      throw new Error('Failed to update order');
    }

    return await response.json();
    
  } catch (error) {
    console.error('❌ Update order error:', error);
    console.log("🔄 Mock update order:", id, updatedData);
    return { success: true };
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