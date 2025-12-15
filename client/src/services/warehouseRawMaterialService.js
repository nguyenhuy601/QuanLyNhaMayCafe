import axiosInstance from '../api/axiosConfig';

/**
 * Lấy danh sách kế hoạch sản xuất đã được duyệt bởi ban giám đốc
 */
export const getApprovedPlans = async () => {
  try {
    const response = await axiosInstance.get('/plan');
    // Lọc chỉ những kế hoạch có trangThai = "Đã duyệt"
    const approvedPlans = Array.isArray(response.data) 
      ? response.data.filter(plan => plan.trangThai === "Đã duyệt")
      : [];
    return approvedPlans;
  } catch (error) {
    console.error('❌ Error fetching approved plans:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết kế hoạch theo ID
 */
export const getPlanById = async (planId) => {
  try {
    const response = await axiosInstance.get(`/plan/${planId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching plan details:', error);
    throw error;
  }
};

/**
 * Tạo phiếu nhập kho NVL
 */
export const createMaterialReceipt = async (receiptData) => {
  try {
    console.log("🔵 [Frontend] Creating material receipt:", receiptData.maPhieu);
    console.trace("🔵 [Frontend] Stack trace for createMaterialReceipt call:");
    const response = await axiosInstance.post('/warehouse/materials/receipts', receiptData);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating material receipt:', error);
    throw error;
  }
};

/**
 * Tạo phiếu xuất kho NVL
 */
export const createMaterialIssue = async (issueData) => {
  try {
    const response = await axiosInstance.post('/warehouse/materials/issues', issueData);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating material issue:', error);
    throw error;
  }
};

/**
 * Lấy danh sách phiếu nhập kho NVL
 */
export const getMaterialReceipts = async () => {
  try {
    const response = await axiosInstance.get('/warehouse/materials/receipts');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching material receipts:', error);
    throw error;
  }
};

/**
 * Lấy danh sách phiếu xuất kho NVL
 */
export const getMaterialIssues = async () => {
  try {
    const response = await axiosInstance.get('/warehouse/materials/issues');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching material issues:', error);
    throw error;
  }
};


