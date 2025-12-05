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

/**
 * Lấy danh sách tổ sản xuất từ factory-service
 */
export const fetchTeams = async () => {
  try {
    const response = await axiosInstance.get('/factory/to');
    console.log('✅ Teams response:', response.data);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching teams:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    throw error; // Throw để component có thể xử lý
  }
};

/**
 * Cập nhật trạng thái tổ
 */
export const updateTeamStatus = async (teamId, trangThai) => {
  try {
    const response = await axiosInstance.put(`/factory/to/${teamId}`, { trangThai });
    return response.data;
  } catch (error) {
    console.error('❌ Error updating team status:', error);
    throw error;
  }
};

/**
 * Lấy danh sách kế hoạch chờ xưởng trưởng duyệt
 */
export const fetchPendingPlans = async () => {
  try {
    const response = await axiosInstance.get('/factory/manager/plans/pending');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching pending plans:', error);
    throw error;
  }
};

/**
 * Xưởng trưởng duyệt kế hoạch
 */
export const approvePlan = async (planId) => {
  try {
    const response = await axiosInstance.put(`/factory/manager/plans/${planId}/approve`);
    return response.data;
  } catch (error) {
    console.error('❌ Error approving plan:', error);
    throw error;
  }
};

/**
 * Xưởng trưởng từ chối kế hoạch
 */
export const rejectPlan = async (planId, reason) => {
  try {
    const response = await axiosInstance.put(`/factory/manager/plans/${planId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('❌ Error rejecting plan:', error);
    throw error;
  }
};

/**
 * Lấy danh sách xưởng sản xuất
 */
export const fetchXuongs = async () => {
  try {
    const response = await axiosInstance.get('/factory/xuong');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching xuongs:', error);
    throw error;
  }
};

