import axiosInstance from "../api/axiosConfig";

/**
 * Lấy tất cả phiếu nhập thành phẩm
 */
export const getAllFinishedReceipts = async () => {
  try {
    const res = await axiosInstance.get(`/warehouse/issues/receipts`);
    return res.data;
  } catch (err) {
    console.error("Lỗi getAllFinishedReceipts:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Tạo phiếu nhập thành phẩm
 */
export const createFinishedReceipt = async (payload) => {
  try {
    const res = await axiosInstance.post(`/warehouse/issues/receipts`, payload);
    return res.data;
  } catch (err) {
    console.error("Lỗi createFinishedReceipt:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Lấy phiếu nhập theo ID
 */
export const getFinishedReceiptById = async (id) => {
  try {
    const res = await axiosInstance.get(`/warehouse/issues/receipts/${id}`);
    return res.data;
  } catch (err) {
    console.error("Lỗi getFinishedReceiptById:", err.response?.data || err.message);
    throw err;
  }
};
