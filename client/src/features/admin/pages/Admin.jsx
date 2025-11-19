import { Outlet } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  fetchRoles,
  createRole,
  updateRole,
  deleteRole,
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  fetchPositions,
  createPosition,
  updatePosition,
  deletePosition,
} from "../../../services/adminService";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [refLoading, setRefLoading] = useState(true);
  const [refError, setRefError] = useState("");

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await fetchAdminUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const loadReferences = useCallback(async () => {
    try {
      setRefLoading(true);
      setRefError("");
      const [roleData, deptData, positionData] = await Promise.all([
        fetchRoles(),
        fetchDepartments(),
        fetchPositions(),
      ]);
      setRoles(Array.isArray(roleData) ? roleData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
      setPositions(Array.isArray(positionData) ? positionData : []);
    } catch (err) {
      setRefError(err.message || "Không thể tải dữ liệu danh mục");
    } finally {
      setRefLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  const handleCreateUser = async (payload) => {
    const result = await createAdminUser(payload);
    if (result?.user) {
      setUsers((prev) => [result.user, ...prev]);
    } else if (Array.isArray(result)) {
      setUsers(result);
    } else {
      await loadUsers();
    }
    return result;
  };

  const handleUpdateUser = async (id, payload) => {
    const result = await updateAdminUser(id, payload);
    if (result?.user) {
      setUsers((prev) => prev.map((user) => (user._id === id ? result.user : user)));
    } else {
      await loadUsers();
    }
    return result;
  };

  const handleDeleteUser = async (id) => {
    await deleteAdminUser(id);
    setUsers((prev) => prev.filter((user) => user._id !== id));
  };

  const upsertById = (list, entity) => {
    if (!entity?._id) return list;
    const exists = list.find((item) => item._id === entity._id);
    if (exists) {
      return list.map((item) => (item._id === entity._id ? entity : item));
    }
    return [entity, ...list];
  };

  const handleCreateRole = async (payload) => {
    const result = await createRole(payload);
    const entity = result.role || result;
    setRoles((prev) => upsertById(prev, entity));
    return entity;
  };

  const handleUpdateRole = async (id, payload) => {
    const result = await updateRole(id, payload);
    const entity = result.role || result;
    setRoles((prev) => upsertById(prev, entity));
    return entity;
  };

  const handleDeleteRole = async (id) => {
    await deleteRole(id);
    setRoles((prev) => prev.filter((role) => role._id !== id));
  };

  const handleCreateDepartment = async (payload) => {
    const result = await createDepartment(payload);
    const entity = result.department || result;
    setDepartments((prev) => upsertById(prev, entity));
    return entity;
  };

  const handleUpdateDepartment = async (id, payload) => {
    const result = await updateDepartment(id, payload);
    const entity = result.department || result;
    setDepartments((prev) => upsertById(prev, entity));
    return entity;
  };

  const handleDeleteDepartment = async (id) => {
    await deleteDepartment(id);
    setDepartments((prev) => prev.filter((dept) => dept._id !== id));
  };

  const handleCreatePosition = async (payload) => {
    const result = await createPosition(payload);
    const entity = result.position || result;
    setPositions((prev) => upsertById(prev, entity));
    return entity;
  };

  const handleUpdatePosition = async (id, payload) => {
    const result = await updatePosition(id, payload);
    const entity = result.position || result;
    setPositions((prev) => upsertById(prev, entity));
    return entity;
  };

  const handleDeletePosition = async (id) => {
    await deletePosition(id);
    setPositions((prev) => prev.filter((pos) => pos._id !== id));
  };

  const contextValue = {
    users,
    loading,
    error,
    roles,
    departments,
    positions,
    referenceLoading: refLoading,
    referenceError: refError,
    reloadReferences: loadReferences,
    reloadUsers: loadUsers,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleCreateRole,
    handleUpdateRole,
    handleDeleteRole,
    handleCreateDepartment,
    handleUpdateDepartment,
    handleDeleteDepartment,
    handleCreatePosition,
    handleUpdatePosition,
    handleDeletePosition,
  };

  return <Outlet context={contextValue} />;
};

export default Admin;

