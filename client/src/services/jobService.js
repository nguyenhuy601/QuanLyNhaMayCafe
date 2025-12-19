import { getToken } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

// Lấy danh sách công việc từ Factory-Service (Xưởng trưởng)
export const fetchJobs = async () => {
  if (!API_URL) {
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
      return [];
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (err) {
    return [];
  }
};

// Cập nhật công việc (ví dụ: cập nhật tổ phụ trách)
export const updateJob = async (jobId, updateData) => {
  if (!API_URL) {
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
      return null;
    }

    const data = await res.json();
    return data.job || data;
  } catch (err) {
    return null;
  }
};

