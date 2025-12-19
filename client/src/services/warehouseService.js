import axiosInstance from "../api/axiosConfig";

/**
 * Lấy tất cả phiếu nhập thành phẩm
 */
export const getAllFinishedReceipts = async () => {
  try {
    const res = await axiosInstance.get(`/warehouse/products/issues/receipts`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

/**
 * Tạo phiếu nhập thành phẩm
 */
export const createFinishedReceipt = async (payload) => {
  try {
    const res = await axiosInstance.post(`/warehouse/products/issues/receipts`, payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};

/**
 * Lấy phiếu nhập theo ID
 */
export const getFinishedReceiptById = async (id) => {
  try {
    const res = await axiosInstance.get(`/warehouse/products/issues/receipts/${id}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

/**
 * Xác nhận nhập kho thành phẩm
 */
export const confirmReceipt = async (id) => {
  try {
    const res = await axiosInstance.put(`/warehouse/products/issues/receipts/${id}/confirm`);
    return res.data;
  } catch (err) {
    throw err;
  }
};
