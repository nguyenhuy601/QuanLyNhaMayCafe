import axiosInstance from '../api/axiosConfig';

/**
 * Lấy danh sách kế hoạch sản xuất từ production-plan-service
 */
export const fetchPlans = async () => {
  try {
    const response = await axiosInstance.get('/plan');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
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
    return null;
  }
};

/**
 * Lấy danh sách tổ sản xuất từ factory-service
 */
export const fetchTeams = async () => {
  try {
    const response = await axiosInstance.get('/factory/to');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('❌ Error fetching teams:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
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
    throw error;
  }
};

/**
 * Gán tổ trưởng cho một tổ sản xuất
 * Body phía server: { id, hoTen, email, role, maNV }
 */
export const assignTeamLeader = async (teamId, leaderPayload) => {
  try {
    const response = await axiosInstance.post(
      `/factory/to/${teamId}/to-truong`,
      leaderPayload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Gán công nhân (thành viên) vào tổ sản xuất
 * Body phía server: { id, hoTen, email, role, maNV }
 */
export const assignTeamMember = async (teamId, memberPayload) => {
  try {
    const response = await axiosInstance.post(
      `/factory/to/${teamId}/thanh-vien`,
      memberPayload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa công nhân (thành viên) khỏi tổ sản xuất
 * Body phía server: { id }
 */
export const removeTeamMember = async (teamId, memberId) => {
  try {
    const response = await axiosInstance.delete(
      `/factory/to/${teamId}/thanh-vien`,
      { data: { id: memberId } }
    );
    return response.data;
  } catch (error) {
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
    throw error;
  }
};

/**
 * Lấy danh sách phân công từ manager endpoint (có đầy đủ keHoach)
 * Tổ trưởng và xưởng trưởng đều dùng endpoint này (backend sẽ lọc theo tổ/role)
 * Thay thế cho fetchTeamLeaderAssignments (endpoint /teamleader/assignments đã bỏ vì trả về rỗng)
 */
export const fetchManagerAssignments = async () => {
  try {
    const response = await axiosInstance.get('/factory/manager/assignments');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw error;
  }
};

/**
 * Tổ trưởng: tạo phân công ca làm
 */
export const createTeamLeaderAssignment = async (payload) => {
  try {
    const response = await axiosInstance.post(
      '/factory/teamleader/assignments',
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Tổ trưởng: lấy danh sách lịch phân ca (ShiftSchedule)
 * params: { date, caLam, teamId } (tùy chọn)
 */
export const fetchTeamLeaderShifts = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/factory/teamleader/shifts', { params });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw error;
  }
};

/**
 * Tổ trưởng: lưu / tạo mới lịch phân ca (không nhất thiết truyền members)
 */
export const saveShiftSchedule = async (payload) => {
  try {
    const response = await axiosInstance.post(
      '/factory/teamleader/shifts',
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Tổ trưởng: thêm một công nhân vào lịch phân ca
 */
export const addShiftMember = async (scheduleId, payload) => {
  try {
    const response = await axiosInstance.post(
      `/factory/teamleader/shifts/${scheduleId}/members`,
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Tổ trưởng: lưu bảng chấm công
 * Body BE mong đợi: { ngay, caLam, toSanXuat, entries, trangThaiBang, ghiChuChung }
 */
export const saveAttendanceSheet = async (payload) => {
  try {
    const response = await axiosInstance.post(
      '/factory/teamleader/attendance',
      payload
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Tổ trưởng: lấy danh sách bảng chấm công (AttendanceSheet)
 * params: { date, from, to, caLam, teamId } (tùy chọn)
 */
export const fetchAttendanceSheets = async (params = {}) => {
  try {
    const response = await axiosInstance.get(
      '/factory/teamleader/attendance',
      { params }
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw error;
  }
};

/**
 * Kiểm tra điều kiện bắt đầu kế hoạch
 */
export const checkStartConditions = async (planId) => {
  try {
    const response = await axiosInstance.get(
      `/factory/manager/plans/${planId}/check-start-conditions`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Bắt đầu kế hoạch (chuyển trạng thái sang Đang thực hiện)
 */
export const startPlan = async (planId) => {
  try {
    const response = await axiosInstance.put(
      `/factory/manager/plans/${planId}/start`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Tổ trưởng xác nhận hoàn thành cho công nhân
 */
export const confirmMemberCompletion = async (teamId, memberId) => {
  try {
    const response = await axiosInstance.post(
      `/factory/to/${teamId}/xac-nhan-hoan-thanh`,
      { memberId }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

