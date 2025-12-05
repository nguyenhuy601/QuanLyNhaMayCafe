import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// --- MOCK DATA (Dùng chung để map tên cho đẹp) ---
const MOCK_DATA = {}; // (Anh có thể copy list MOCK_DATA từ directorApi sang đây nếu muốn hiện tên đẹp ngay)

// --- GET API ---
// Lấy danh sách nhiệm vụ (Kế hoạch đã được Giám đốc duyệt)
export const getWorkerTasks = async () => {
  try {
    // Gọi API lấy kế hoạch (Giả sử Worker xem danh sách kế hoạch)
    // Lưu ý: Sau này backend cần API riêng như /worker/tasks
    // Tạm thời mình gọi API lấy kế hoạch chung
    const response = await api.get(`/director/plans/pending`); 
    
    // LỌC Ở FRONTEND: Worker chỉ thấy những cái "Đã duyệt" hoặc "Đang thực hiện"
    // (Vì "Chờ duyệt" là việc của Giám đốc)
    const allPlans = Array.isArray(response.data) ? response.data : [];
    return allPlans.filter(p => ["Da duyet", "Dang thuc hien", "Hoan thanh"].includes(p.trangThai));
  } catch (error) {
    console.error("Lỗi lấy nhiệm vụ:", error);
    return [];
  }
};

// --- PUT API (HÀNH ĐỘNG CỦA WORKER) ---

// 1. Bắt đầu làm
export const startTaskApi = async (id) => {
  // Tạm thời gọi API update trạng thái chung
  // Sau này backend có route riêng: /worker/start/${id}
  // Mình giả lập bằng cách update trạng thái thành "Dang thuc hien"
  // (Lưu ý: Backend hiện tại có thể chưa hỗ trợ status này, đây là code frontend chuẩn bị trước)
  const response = await api.put(`/director/plans/approve/${id}`, { status: "Dang thuc hien" }); 
  return response.data;
};

// 2. Hoàn thành
export const completeTaskApi = async (id) => {
  const response = await api.put(`/director/plans/approve/${id}`, { status: "Hoan thanh" });
  return response.data;
};

// --- Helper ---
export const getEntityName = async (id, type = "user") => {
  if (MOCK_DATA[id]) return MOCK_DATA[id];
  if (id && !/^[0-9a-fA-F]{24}$/.test(id)) return id;
  return `${type === "product" ? "Sản phẩm" : "Đối tượng"} Ẩn`;
};