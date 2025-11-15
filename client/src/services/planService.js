// src/services/planService.js
const API_URL = import.meta.env.VITE_API_URL;

/**
 * 🏗️ Helper: Cấu hình header mặc định
 */
function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * 🟢 CREATE - Tạo kế hoạch sản xuất mới
 * Endpoint: POST /plans
 */
export const createProductionPlan = async (planData) => {
  try {
    console.log("📤 Sending plan data:", planData);
    const response = await fetch(`${API_URL}/plan`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(planData),
    });

    let result;
    try {
      result = await response.json();
    } catch (e) {
      result = { error: "Invalid JSON response" };
    }

    console.log(`📥 Response status: ${response.status}`, result);

    if (!response.ok) {
      const errorMsg = result?.message || result?.error || `Server error: ${response.status}`;
      console.error("❌ Lỗi từ backend khi tạo kế hoạch:", {
        status: response.status,
        error: errorMsg,
        details: result,
      });
      return {
        success: false,
        message: errorMsg,
        status: response.status,
        details: result,
      };
    }

    console.log("✅ Kế hoạch sản xuất được tạo:", result);
    return { success: true, plan: result.plan || result };
  } catch (error) {
    console.error("❌ Lỗi khi gọi createProductionPlan:", error);
    return { success: false, message: error.message || "Network error" };
  }
};

/**
 * 📋 READ - Lấy danh sách tất cả kế hoạch sản xuất
 * Endpoint: GET /plans
 */
export const fetchProductionPlans = async () => {
  try {
    const response = await fetch(`${API_URL}/plan`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error("Không thể tải danh sách kế hoạch sản xuất.");
    }

    const data = await response.json();
    console.log("📦 Danh sách kế hoạch sản xuất:", data);
    return data;
  } catch (error) {
    console.error("❌ Lỗi khi tải danh sách kế hoạch:", error);
    return [];
  }
};

/**
 * 📄 READ - Lấy chi tiết 1 kế hoạch sản xuất
 * Endpoint: GET /plans/:id
 */
export const fetchPlanById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/plan/${id}`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error("Không thể lấy chi tiết kế hoạch.");

    const data = await response.json();
    console.log("📄 Chi tiết kế hoạch:", data);
    return data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy chi tiết kế hoạch:", error);
    return null;
  }
};

/**
 * ✏️ UPDATE - Cập nhật kế hoạch sản xuất
 * Endpoint: PUT /plans/:id
 */
export const updateProductionPlan = async (id, updateData) => {
  try {
    const response = await fetch(`${API_URL}/plan/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Không thể cập nhật kế hoạch.");
    }

    console.log("✅ Kế hoạch đã được cập nhật:", result);
    return result;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật kế hoạch:", error);
    return { success: false, message: error.message };
  }
};

/**
 * 🗑️ DELETE - Xóa kế hoạch sản xuất
 * Endpoint: DELETE /plans/:id
 */
export const deleteProductionPlan = async (id) => {
  try {
    const response = await fetch(`${API_URL}/plans/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Không thể xóa kế hoạch.");
    }

    console.log("🗑️ Đã xóa kế hoạch:", id);
    return { success: true, message: "Đã xóa kế hoạch thành công." };
  } catch (error) {
    console.error("❌ Lỗi khi xóa kế hoạch:", error);
    return { success: false, message: error.message };
  }
};

/**
 * 📤 SEND TO DIRECTOR - Gửi kế hoạch đã hoàn thành cho ban giám đốc
 * Endpoint: PUT /plan/:id (update trangThai to "Đã duyệt" and send to director)
 */
export const sendPlanToDirector = async (id, planData) => {
  try {
    console.log("📤 Sending plan to director:", id, planData);
    const response = await fetch(`${API_URL}/plan/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        ...planData,
        trangThai: "Đã duyệt",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMsg = result?.message || result?.error || `Server error: ${response.status}`;
      console.error("❌ Lỗi khi gửi kế hoạch cho giám đốc:", errorMsg);
      return {
        success: false,
        message: errorMsg,
      };
    }

    console.log("✅ Kế hoạch đã gửi cho ban giám đốc:", result);
    return { success: true, message: "Đã gửi kế hoạch cho ban giám đốc", plan: result };
  } catch (error) {
    console.error("❌ Lỗi khi gửi kế hoạch:", error);
    return { success: false, message: error.message || "Network error" };
  }
};
