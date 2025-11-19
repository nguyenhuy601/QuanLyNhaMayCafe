const ADMIN_BASE_URL =
  import.meta.env.VITE_ADMIN_SERVICE_URL ||
  (import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/admin` : "");

const USERS_URL = ADMIN_BASE_URL ? `${ADMIN_BASE_URL}/users` : "";
const ROLES_URL = ADMIN_BASE_URL ? `${ADMIN_BASE_URL}/roles` : "";
const DEPARTMENTS_URL = ADMIN_BASE_URL ? `${ADMIN_BASE_URL}/departments` : "";
const POSITIONS_URL = ADMIN_BASE_URL ? `${ADMIN_BASE_URL}/positions` : "";

const getHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("token");
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const storageKey = "admin_users_cache";

const getCachedUsers = () => {
  try {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const cacheUsers = (users) => {
  localStorage.setItem(storageKey, JSON.stringify(users));
};

export const fetchAdminUsers = async () => {
  if (!USERS_URL) {
    return getCachedUsers();
  }

  try {
    const response = await fetch(USERS_URL, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    const users = Array.isArray(data) ? data : data.users || [];
    cacheUsers(users);
    return users;
  } catch (error) {
    console.error("⚠️ fetchAdminUsers fallback:", error);
    return getCachedUsers();
  }
};

export const createAdminUser = async (payload) => {
  if (!USERS_URL) {
    const current = getCachedUsers();
    const offlineUser = {
      ...payload,
      _id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    cacheUsers([offlineUser, ...current]);
    return { success: true, user: offlineUser };
  }

  const response = await fetch(USERS_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

export const updateAdminUser = async (id, payload) => {
  if (!USERS_URL) {
    const current = getCachedUsers();
    const updated = current.map((user) =>
      user._id === id ? { ...user, ...payload, updatedAt: new Date().toISOString() } : user
    );
    cacheUsers(updated);
    return { success: true, user: updated.find((user) => user._id === id) };
  }

  const response = await fetch(`${USERS_URL}/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

export const deleteAdminUser = async (id) => {
  if (!USERS_URL) {
    const current = getCachedUsers().filter((user) => user._id !== id);
    cacheUsers(current);
    return { success: true };
  }

  const response = await fetch(`${USERS_URL}/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

const requireUrl = (label, url) => {
  if (!url) throw new Error(`Endpoint ${label} chưa được cấu hình`);
  return url;
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: getHeaders(),
    ...options,
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
};

const resolveOrEmpty = (value) => Promise.resolve(value);

export const fetchRoles = () =>
  ROLES_URL ? requestJson(ROLES_URL) : resolveOrEmpty([]);
export const createRole = (payload) =>
  requestJson(requireUrl("roles", ROLES_URL), {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateRole = (id, payload) =>
  requestJson(`${requireUrl("roles", ROLES_URL)}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteRole = (id) =>
  requestJson(`${requireUrl("roles", ROLES_URL)}/${id}`, { method: "DELETE" });

export const fetchDepartments = () =>
  DEPARTMENTS_URL ? requestJson(DEPARTMENTS_URL) : resolveOrEmpty([]);
export const createDepartment = (payload) =>
  requestJson(requireUrl("departments", DEPARTMENTS_URL), {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateDepartment = (id, payload) =>
  requestJson(`${requireUrl("departments", DEPARTMENTS_URL)}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteDepartment = (id) =>
  requestJson(`${requireUrl("departments", DEPARTMENTS_URL)}/${id}`, { method: "DELETE" });

export const fetchPositions = () =>
  POSITIONS_URL ? requestJson(POSITIONS_URL) : resolveOrEmpty([]);
export const createPosition = (payload) =>
  requestJson(requireUrl("positions", POSITIONS_URL), {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updatePosition = (id, payload) =>
  requestJson(`${requireUrl("positions", POSITIONS_URL)}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deletePosition = (id) =>
  requestJson(`${requireUrl("positions", POSITIONS_URL)}/${id}`, { method: "DELETE" });

