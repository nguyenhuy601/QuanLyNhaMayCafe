import { getToken } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

const authHeaders = () => {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const safeJson = async (res, fallback = []) => {
  try {
    return await res.json();
  } catch {
    return fallback;
  }
};

export const fetchMaterials = async () => {
  try {
    const res = await fetch(`${API_URL}/products/materials`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return await safeJson(res, []);
  } catch (err) {
    return [];
  }
};

export const fetchAllProducts = async () => {
  try {
    const res = await fetch(`${API_URL}/products`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return await safeJson(res, []);
  } catch (err) {
    return [];
  }
};

export const fetchFinishedProducts = async () => {
  try {
    const res = await fetch(`${API_URL}/products/finished`, {
      headers: authHeaders(),
    });
    if (!res.ok) return [];
    return await safeJson(res, []);
  } catch (err) {
    return [];
  }
};
