import axios from "axios";

// FE sẽ đọc base URL từ environment variable
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3006";

// Lấy phiếu QC theo id
export const getQcRequestById = async (id) => {
  try {
    const res = await axios.get(`${API_BASE}/qc-request/${id}`);
    return res.data;
  } catch (err) {
    console.error("Lỗi getQcRequestById:", err.response?.data || err.message);
    throw err;
  }
};

// Thêm kết quả kiểm định
export const postQcResult = async (payload) => {
  try {
    const res = await axios.post(`${API_BASE}/qc-result`, payload);
    return res.data;
  } catch (err) {
    console.error("Lỗi postQcResult:", err.response?.data || err.message);
    throw err;
  }
};

// Cập nhật trạng thái phiếu QC
export const updateQcRequest = async (id, payload) => {
  try {
    const res = await axios.patch(`${API_BASE}/qc-request/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error("Lỗi updateQcRequest:", err.response?.data || err.message);
    throw err;
  }
};
