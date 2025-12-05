import { getToken } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

// Lấy danh sách công việc từ Factory-Service (Xưởng trưởng)
export const fetchJobs = async () => {
  if (!API_URL) {
    console.warn("⚠️ API_URL chưa được cấu hình, không thể fetch jobs");
    return [];
  }

  try {
    const token = getToken();
    // Gọi qua API Gateway -> Factory-Service (manager routes) theo cấu trúc BE hiện tại
    const res = await fetch(`${API_URL}/factory/manager/jobs`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("❌ Lỗi khi fetch jobs:", res.status, await res.text());
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      console.warn("⚠️ Response jobs không phải là mảng, trả về []");
      return [];
    }

    return data;
  } catch (err) {
    console.error("❌ Lỗi kết nối khi fetch jobs:", err);
    return [];
  }
};

// Cập nhật công việc (ví dụ: cập nhật tổ phụ trách)
export const updateJob = async (jobId, updateData) => {
  if (!API_URL) {
    console.warn("⚠️ API_URL chưa được cấu hình, không thể update job");
    return null;
  }

  try {
    const token = getToken();
    const res = await fetch(`${API_URL}/factory/manager/jobs/${jobId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!res.ok) {
      console.error("❌ Lỗi khi update job:", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data.job || data;
  } catch (err) {
    console.error("❌ Lỗi kết nối khi update job:", err);
    return null;
  }
};

