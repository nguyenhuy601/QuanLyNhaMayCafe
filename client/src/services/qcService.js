import axios from "axios";

// FE sẽ đọc base URL từ environment variable
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Lấy phiếu QC theo id
 */
export const getQcRequestById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/qc-request/${id}`);
    return res.data;
  } catch (err) {
    console.error("Lỗi getQcRequestById:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Thêm kết quả kiểm định
 */
export const postQcResult = async (payload) => {
  try {
    const res = await axios.post(`${API_URL}/qc-result`, payload);
    return res.data;
  } catch (err) {
    console.error("Lỗi postQcResult:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Cập nhật trạng thái phiếu QC
 */
export const updateQcRequest = async (id, payload) => {
  try {
    const res = await axios.patch(`${API_URL}/qc-request/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error("Lỗi updateQcRequest:", err.response?.data || err.message);
    throw err;
  }
};
