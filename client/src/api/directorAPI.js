import axios from "axios";
import { getToken, handle401Error } from "../utils/auth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handle401Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
    return Promise.reject(error);
  }
);

const MOCK_DATA = {};


// --- GET API ---
export const getPendingOrders = async () => {
  try {
    const response = await api.get(`/director/pending`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    // Nếu đã xử lý 401, không log lại
    if (error.response?.status === 401) {
      return [];
    }
    console.error("Lỗi lấy đơn hàng:", error);
    return [];
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/director/pending`);
    const list = Array.isArray(response.data) ? response.data : [];
    const foundOrder = list.find(
      (o) => o._id === orderId || o.maDH === orderId
    );
    return foundOrder || list[0] || null;
  } catch (error) {
    return null;
  }
};

export const getPendingPlans = async () => {
  try {
    const response = await api.get(`/director/plans/pending`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    // Nếu đã xử lý 401, không log lại
    if (error.response?.status === 401) {
      return [];
    }
    console.error("Lỗi lấy kế hoạch:", error);
    return [];
  }
};

// --- PUT API (MỚI THÊM - QUAN TRỌNG) ---

// 1. Duyệt Đơn Hàng
export const approveOrderApi = async (id) => {
  try {
    const response = await api.put(`/director/approve/${id}`);
    return response.data;
  } catch (error) {
    // Nếu đã xử lý 401, throw lại để component biết
    if (error.response?.status === 401) {
      throw error;
    }
    throw error;
  }
};

// 2. Từ Chối Đơn Hàng
export const rejectOrderApi = async (id, reason) => {
  try {
    const response = await api.put(`/director/reject/${id}`, {
      lyDoTuChoi: reason,
    });
    return response.data;
  } catch (error) {
    // Nếu đã xử lý 401, throw lại để component biết
    if (error.response?.status === 401) {
      throw error;
    }
    throw error;
  }
};

// 3. Duyệt Kế Hoạch
export const approvePlanApi = async (id) => {
  try {
    const response = await api.put(`/director/plans/approve/${id}`);
    return response.data;
  } catch (error) {
    // Nếu đã xử lý 401, throw lại để component biết
    if (error.response?.status === 401) {
      throw error;
    }
    throw error;
  }
};

// 4. Từ Chối Kế Hoạch
export const rejectPlanApi = async (id, reason) => {
  try {
    const response = await api.put(`/director/plans/reject/${id}`, {
      lyDoTuChoi: reason,
    });
    return response.data;
  } catch (error) {
    // Nếu đã xử lý 401, throw lại để component biết
    if (error.response?.status === 401) {
      throw error;
    }
    throw error;
  }
};

// --- Helper ---
export const getEntityName = async (id, type = "user") => {
  if (MOCK_DATA[id]) return MOCK_DATA[id];
  if (id && !/^[0-9a-fA-F]{24}$/.test(id)) return id;
  return `${type === "product" ? "Sản phẩm" : "Đối tượng"} Ẩn`;
};

export const getUserDetail = async (id) => ({
  fullName: await getEntityName(id, "user"),
  phone: "...",
});
export const getProductDetail = async (id) => ({
  name: await getEntityName(id, "product"),
  image: "",
});