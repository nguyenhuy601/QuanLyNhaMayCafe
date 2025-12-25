import api from "./axiosConfig";

export const getAllUsers = async () => {
  const res = await api.get("/admin/users");
  return Array.isArray(res.data) ? res.data : [];
};

export const getAllDepartments = async () => {
  const res = await api.get("/admin/departments");
  return Array.isArray(res.data) ? res.data : [];
};

export const getAllRoles = async () => {
  const res = await api.get("/admin/roles");
  return Array.isArray(res.data) ? res.data : [];
};

export const getAllPositions = async () => {
  const res = await api.get("/admin/positions");
  return Array.isArray(res.data) ? res.data : [];
};





















