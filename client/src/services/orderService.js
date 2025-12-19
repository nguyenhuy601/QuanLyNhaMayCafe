import { normalizeStatusKey, toVietnameseStatus } from "../utils/statusMapper";
import { getToken } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

const applyStatusLabel = (orders = []) =>
  orders.map((order) => ({
    ...order,
    trangThai: toVietnameseStatus(order.trangThai),
  }));

export const fetchOrders = async () => {
  try {
    const token = getToken();
    
    // If no token or no API_URL, use mock data
    if (!token || !API_URL) {
      return applyStatusLabel(filterVisibleOrders(getMockOrdersWithPending()));
    }
    
    const response = await fetch(`${API_URL}/orders`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('401 Unauthorized - Token may be invalid or expired. Please login again.');
      }
      return applyStatusLabel(filterVisibleOrders(getMockOrdersWithPending()));
    }

    const data = await response.json();
    return applyStatusLabel(filterVisibleOrders(data));
    
  } catch (error) {
    // Fallback to mock data
    return applyStatusLabel(filterVisibleOrders(getMockOrdersWithPending()));
  }
};

const normalizeLocalOrder = (order) => {
  if (!order) return null;

  if (order.khachHang && Array.isArray(order.chiTiet)) {
    return {
      ...order,
      _id: order._id || order.id || order.maDH,
      maDH: order.maDH || order.id || order._id,
      trangThai: toVietnameseStatus(order.trangThai || order.status || "Chờ duyệt"),
    };
  }

  const quantity =
    Number(order.quantity) ||
    Number(order.soLuong) ||
    Number(order.chiTiet?.[0]?.soLuong) ||
    0;
  const unitPrice =
    Number(order.price) ||
    Number(order.donGia) ||
    Number(order.chiTiet?.[0]?.donGia) ||
    0;

  return {
    _id: order._id || order.id || order.maDH,
    maDH: order.maDH || order.id || order._id,
    khachHang: {
      tenKH: order.customerName || order.khachHang?.tenKH || "Khách hàng",
      sdt: order.customerPhone || order.khachHang?.sdt || order.phone,
      email: order.email || order.khachHang?.email || "",
      diaChi: order.address || order.khachHang?.diaChi || "",
    },
    ngayDat: order.ngayDat || order.createdAt || order.submittedAt,
    ngayYeuCauGiao: order.ngayYeuCauGiao || order.deliveryDate,
    trangThai: toVietnameseStatus(order.trangThai || order.status || "Chờ duyệt"),
    chiTiet: [
      {
        sanPham: {
          tenSP:
            order.product ||
            order.productName ||
            order.chiTiet?.[0]?.sanPham?.tenSP ||
            "Sản phẩm",
          loai: order.loai || order.chiTiet?.[0]?.sanPham?.loai || "sanpham",
          donViTinh:
            order.unit ||
            order.chiTiet?.[0]?.sanPham?.donViTinh ||
            "Túi",
        },
        soLuong: quantity,
        donGia: unitPrice || 50000,
        thanhTien: quantity * (unitPrice || 50000),
      },
    ],
    tongTien:
      order.tongTien ||
      order.total ||
      order.amount ||
      quantity * (unitPrice || 50000),
  };
};

const HIDDEN_STATUSES = new Set([
  "da duyet",
  "hoan thanh",
  "huy",
  "da huy",
  "approved",
  "completed",
]);

const filterVisibleOrders = (orders = []) =>
  orders.filter((order) => !HIDDEN_STATUSES.has(normalizeStatusKey(order.trangThai)));

// Helper function để merge mock data với pending/approved trong localStorage
const getMockOrdersWithPending = () => {
  const buckets = [
    JSON.parse(localStorage.getItem("salesOrders") || "[]"),
    JSON.parse(localStorage.getItem("pendingOrders") || "[]"),
    JSON.parse(localStorage.getItem("approvedOrders") || "[]"),
  ];

  const orderMap = new Map();
  buckets.forEach((list) => {
    list.forEach((raw) => {
      const normalized = normalizeLocalOrder(raw);
      if (!normalized) return;
      orderMap.set(normalized._id || normalized.maDH, normalized);
    });
  });

  const merged = Array.from(orderMap.values()).sort((a, b) => {
    const dateA = new Date(a.ngayDat || 0).getTime();
    const dateB = new Date(b.ngayDat || 0).getTime();
    return dateB - dateA;
  });

  return merged;
};

export const fetchOrderById = async (id) => {
  try {
    const token = getToken();

    const response = await fetch(`${API_URL}/orders/${id}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch order");

    const data = await response.json();
    return {
      ...data,
      trangThai: toVietnameseStatus(data.trangThai),
    };
  } catch (error) {
    return null;
  }
};


export const updateOrder = async (id, updatedData) => {
  try {
    const token = getToken();

    if (!token) {
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
    return result;
  } catch (error) {
    return { success: false, message: error.message };
  }
};


export const approveOrders = async (orderIds) => {
  try {
    const token = getToken();
    
    if (!token) {
      return updateLocalStorageApproval(orderIds);
    }

    const results = await Promise.all(orderIds.map(orderId => 
      fetch(`${API_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trangThai: 'Đã duyệt' })
      })
    ));
    
    return results;
    
  } catch (error) {
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
        status: 'Đã duyệt', 
        trangThai: 'Đã duyệt',
        approvedAt: new Date().toISOString() 
      };
      approvedOrders.push(approved);
      pendingOrders.splice(index, 1);
    }
  });
  
  localStorage.setItem('pendingOrders', JSON.stringify(pendingOrders));
  localStorage.setItem('approvedOrders', JSON.stringify(approvedOrders));
  
  return orderIds.map(id => ({ ok: true }));
};