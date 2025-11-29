// src/services/planService.js
import { getToken, handle401Error } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

/**
 * 🏗️ Helper: Cấu hình header mặc định
 */
function getHeaders() {
  const token = getToken();
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

    // Xử lý lỗi 401 (token expired)
    if (response.status === 401) {
      console.error("❌ 401 Unauthorized when creating plan");
      handle401Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tạo kế hoạch.");
      return { success: false, message: "Token đã hết hạn", isHandled: true };
    }

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
    const headers = getHeaders();
    const token = getToken();
    console.log('📡 Fetching plans from:', `${API_URL}/plan`);
    console.log('🔑 Token present:', !!token, token ? `${token.substring(0, 20)}...` : 'none');
    
    const response = await fetch(`${API_URL}/plan`, {
      method: "GET",
      headers: headers,
    });

    // Xử lý lỗi 401 (token expired)
    if (response.status === 401) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: "Token không hợp lệ hoặc đã hết hạn", error: "jwt expired" };
      }
      console.error(`❌ Plan API returned 401:`, errorData);
      handle401Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return []; // Return empty array để không crash UI
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      console.error(`❌ Plan API returned ${response.status}:`, errorText);
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

    // Xử lý lỗi 401 (token expired)
    if (response.status === 401) {
      handle401Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return null;
    }

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

    // Xử lý lỗi 401 (token expired)
    if (response.status === 401) {
      handle401Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return { success: false, message: "Token đã hết hạn", isHandled: true };
    }

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

    // Xử lý lỗi 401 (token expired)
    if (response.status === 401) {
      handle401Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return { success: false, message: "Token đã hết hạn", isHandled: true };
    }

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

    // Xử lý lỗi 401 (token expired)
    if (response.status === 401) {
      handle401Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      return { success: false, message: "Token đã hết hạn", isHandled: true };
    }

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
