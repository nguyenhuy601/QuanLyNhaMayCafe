const API_URL = process.env.VITE_API_URL;

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
    // Mock data for development
    return [
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
      {
        _id: '2',
        maDH: 'DH002',
        khachHang: { tenKH: 'Công ty XYZ' },
        ngayDat: '2025-03-12',
        ngayYeuCauGiao: '2025-04-12',
        trangThai: 'Dang cho duyet',
        chiTiet: [
          { sanPham: { tenSP: 'cafe hòa tan robusta', donViTinh: 'Túi' }, soLuong: 3000, donGia: 45000 }
        ],
        tongTien: 135000000
      },
      {
        _id: '3',
        maDH: 'DH010',
        khachHang: { tenKH: 'Siêu thị DEF' },
        ngayDat: '2025-03-05',
        ngayYeuCauGiao: '2025-06-05',
        trangThai: 'Da duyet',
        chiTiet: [
          { sanPham: { tenSP: 'cafe rang xay arabica', donViTinh: 'Túi' }, soLuong: 10000, donGia: 50000 }
        ],
        tongTien: 500000000
      },
      {
        _id: '4',
        maDH: 'DH011',
        khachHang: { tenKH: 'Nhà phân phối GHI' },
        ngayDat: '2025-03-10',
        ngayYeuCauGiao: '2025-05-10',
        trangThai: 'Da duyet',
        chiTiet: [
          { sanPham: { tenSP: 'cafe rang xay arabica', donViTinh: 'Túi' }, soLuong: 8000, donGia: 50000 }
        ],
        tongTien: 400000000
      },
      {
        _id: '5',
        maDH: 'DH009',
        khachHang: { tenKH: 'Khách sạn JKL' },
        ngayDat: '2025-03-01',
        ngayYeuCauGiao: '2025-05-01',
        trangThai: 'Dang cho duyet',
        chiTiet: [
          { sanPham: { tenSP: 'cafe chồn', donViTinh: 'Túi' }, soLuong: 9000, donGia: 150000 }
        ],
        tongTien: 1350000000
      },
      {
        _id: '6',
        maDH: 'DH006',
        khachHang: { tenKH: 'Cửa hàng MNO' },
        ngayDat: '2025-03-10',
        ngayYeuCauGiao: '2025-05-10',
        trangThai: 'Dang cho duyet',
        chiTiet: [
          { sanPham: { tenSP: 'cafe hòa tan robusta', donViTinh: 'Túi' }, soLuong: 600, donGia: 45000 }
        ],
        tongTien: 27000000
      }
    ];
  }
};

export const approveOrders = async (orderIds) => {
  try {
    const token = localStorage.getItem('token');
    await Promise.all(orderIds.map(orderId => 
      fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trangThai: 'Da duyet' })
      })
    ));
  } catch (error) {
    console.error('Error approving orders:', error);
    // Mock success for development
  }
};