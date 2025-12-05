import { getToken } from "../utils/auth";

const API_URL = import.meta.env.VITE_API_URL;

const authHeaders = () => {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const fetchMaterials = async () => {
  const res = await fetch(`${API_URL}/products/materials`, {
    headers: authHeaders(),
  });

  return await res.json();
};

export const fetchAllProducts = async () => {
  const res = await fetch(`${API_URL}/products`, {
    headers: authHeaders(),
  });
  return await res.json();
};

export const fetchFinishedProducts = async () => {
  const res = await fetch(`${API_URL}/products/finished`, {
    headers: authHeaders(),
  });
  return await res.json();
};
