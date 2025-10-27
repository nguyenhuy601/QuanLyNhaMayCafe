const API_URL = import.meta.env.VITE_API_URL;

export const fetchOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    return await response.json();
  } catch (error) {
    console.error('Fetch orders error:', error);
    
    // Lấy từ localStorage nếu không có API
    const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    
    // Mock data + pending orders
    return [
      ...pendingOrders.map(order => ({
        _id: order.id,
        maDH: order.id,
        khachHang: { tenKH: order.customerName },
        ngayDat: order.createdAt,
        ngayYeuCauGiao: order.deliveryDate,
        trangThai: 'Dang cho duyet',
        chiTiet: [
          { 
            sanPham: { tenSP: order.product, donViTinh: 'Túi' }, 
            soLuong: parseInt(order.quantity), 
            donGia: 50000 
          }
        ],
        tongTien: parseInt(order.quantity) * 50000
      })),
      // ... existing mock data
      {
        _id: '1',
        maDH: 'DH001',
        khachHang: { tenKH: 'Công ty ABC' },
        ngayDat: '2025-03-01',
        ngayYeuCauGiao: '2025-05-01',
        trangThai: 'Da duyet',
        chiTiet: [
          { sanPham: { tenSP: 'cafe rang xay arabica', donViTinh: 'Túi' }, soLuong: 5000, donGia: 50000 }
        ],
        tongTien: 250000000
      },
      // ... rest of mock data
    ];
  }
};

export const approveOrders = async (orderIds) => {
  try {
    const token = localStorage.getItem('token');
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
    
    return results;
  } catch (error) {
    console.error('Error approving orders:', error);
    
    // Fallback: Update localStorage
    const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    const approvedOrders = JSON.parse(localStorage.getItem('approvedOrders') || '[]');
    
    orderIds.forEach(orderId => {
      const index = pendingOrders.findIndex(order => order.id === orderId);
      if (index !== -1) {
        const approved = { ...pendingOrders[index], status: 'Da duyet', approvedAt: new Date().toISOString() };
        approvedOrders.push(approved);
        pendingOrders.splice(index, 1);
      }
    });
    
    localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
    localStorage.setItem('approvedOrders', JSON.stringify(approvedOrders));
    
    return orderIds.map(id => ({ ok: true }));
  }
};