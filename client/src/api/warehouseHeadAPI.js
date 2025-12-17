import api from "./axiosConfig";

// Lấy danh sách phiếu xuất NVL đã được BGĐ duyệt, chờ xưởng trưởng xác nhận
export const getIssuesWaitingWarehouseHead = async () => {
  try {
    const res = await api.get("/warehouse/materials/issues/waiting-warehouse-head");
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    if (error.response?.status === 401) return [];
    console.error("❌ [warehouseHeadAPI] Lỗi lấy phiếu chờ xưởng trưởng:", error);
    console.error("❌ [warehouseHeadAPI] Chi tiết:", error.response?.data);
    throw error;
  }
};

// Xưởng trưởng xác nhận đã nhận NVL
export const confirmIssueReceivedApi = async (id) => {
  try {
    const res = await api.put(`/warehouse/materials/issues/${id}/confirm`);
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) throw error;
    throw error;
  }
};








