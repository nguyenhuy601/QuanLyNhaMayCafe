import axiosInstance from "../api/axiosConfig";

// Dùng axiosInstance để có token tự động và gọi qua gateway
// Gateway sẽ proxy đến qc-service

/**
 * Lấy phiếu QC theo id
 */
export const getQcRequestById = async (id) => {
  try {
    const res = await axiosInstance.get(`/qc-request/${id}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

/**
 * Lấy danh sách tất cả phiếu QC
 */
export const getAllQcRequests = async () => {
  try {
    const res = await axiosInstance.get(`/qc-request`, {
      timeout: 5000, // Timeout 5 giây
    });
    return res.data;
  } catch (err) {
    // Chỉ log nếu không phải network error (để tránh spam)
    if (err.code !== 'ERR_NETWORK' && err.code !== 'ECONNABORTED') {
    }
    throw err;
  }
};

/**
 * Tạo phiếu QC tạm thời
 */
export const createQcRequest = async (payload) => {
  try {
    const res = await axiosInstance.post(`/qc-request`, payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};

/**
 * Thêm kết quả kiểm định
 */
export const postQcResult = async (payload) => {
  try {
    const res = await axiosInstance.post(`/qc-result`, payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};

/**
 * Cập nhật trạng thái phiếu QC
 */
export const updateQcRequest = async (id, payload) => {
  try {
    const res = await axiosInstance.patch(`/qc-request/${id}`, payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};

/**
 * Lấy danh sách tất cả kết quả kiểm định QC
 */
export const getAllQcResults = async () => {
  try {
    const res = await axiosInstance.get(`/qc-result`, {
      timeout: 5000,
    });
    return res.data;
  } catch (err) {
    throw err;
  }
};
