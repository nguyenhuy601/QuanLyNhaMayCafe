import axiosInstance from '../api/axiosConfig';

/**
 * Lấy danh sách kế hoạch sản xuất từ production-plan-service
 */
export const fetchPlans = async () => {
  try {
    const response = await axiosInstance.get('/plan');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching plans:', error);
    return [];
  }
};

/**
 * Lấy chi tiết kế hoạch theo ID từ production-plan-service
 */
export const fetchPlanById = async (planId) => {
  try {
    const response = await axiosInstance.get(`/plan/${planId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching plan by ID:', error);
    return null;
  }
};

