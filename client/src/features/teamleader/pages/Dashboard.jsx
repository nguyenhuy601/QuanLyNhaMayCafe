import React, { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Users, Calendar, CheckCircle2 } from "lucide-react";
import { getAllUsers, getAllRoles, getAllDepartments } from "../../../api/adminAPI";

const getCurrentUser = () => {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      id: payload.id || payload.userId || payload._id,
      email: payload.email,
      role: payload.role,
      hoTen: payload.hoTen || payload.name,
    };
  } catch (err) {
    console.error("Lỗi khi parse token:", err);
    return null;
  }
};

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [u, r, d] = await Promise.all([getAllUsers(), getAllRoles(), getAllDepartments()]);
        setUsers(Array.isArray(u) ? u : []);
        setRoles(Array.isArray(r) ? r : []);
        setDepartments(Array.isArray(d) ? d : []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu dashboard tổ trưởng:", err);
        setUsers([]);
        setRoles([]);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const currentUser = useMemo(() => getCurrentUser(), []);
  const roleIdBySlug = useMemo(() => {
    const map = {};
    roles.forEach((r) => (map[(r.tenRole || r.maRole || "").toLowerCase()] = r._id));
    return map;
  }, [roles]);

  const leader = useMemo(() => {
    if (!currentUser) return null;
    return users.find((u) => u.email?.toLowerCase() === currentUser.email?.toLowerCase()) || null;
  }, [currentUser, users]);

  const members = useMemo(() => {
    if (!leader) return [];
    const leaderDepts = leader.phongBan || [];
    const workerRoleId = roleIdBySlug["worker"];
    return users.filter((u) => {
      if (!Array.isArray(u.phongBan)) return false;
      const sameDept = u.phongBan.some((pb) => leaderDepts.includes(pb));
      const isWorker = workerRoleId ? (u.role || []).includes(workerRoleId) : true;
      return sameDept && isWorker && u._id !== leader._id;
    });
  }, [leader, roleIdBySlug, users]);

  const stats = [
    { label: "Công việc hôm nay", value: 0, icon: <ClipboardCheck size={22} />, accent: "from-amber-500 to-amber-600" },
    { label: "Thành viên tổ", value: members.length, icon: <Users size={22} />, accent: "from-amber-400 to-amber-500" },
    { label: "Phòng ban phụ trách", value: leader?.phongBan?.length || 0, icon: <Calendar size={22} />, accent: "from-amber-500 to-amber-700" },
    { label: "Tổ trưởng", value: 1, icon: <CheckCircle2 size={22} />, accent: "from-emerald-500 to-emerald-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl shadow-lg px-10 py-12 border border-amber-100 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-400 mb-3">Tổ trưởng</p>
        <h1 className="text-3xl font-bold text-amber-900 mb-4">
          Tổng quan hoạt động tổ sản xuất
        </h1>
        <p className="text-amber-700 mb-8 max-w-2xl mx-auto">
          Theo dõi tiến độ công việc, phân bổ nhân lực và đảm bảo chất lượng theo kế hoạch đã được phê duyệt.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {(loading ? stats : stats).map((item) => (
            <div key={item.label} className="bg-amber-50 rounded-2xl p-4 text-left border border-amber-100">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${item.accent} text-white flex items-center justify-center mb-3`}>
                {item.icon}
              </div>
              <p className="text-sm text-amber-500">{item.label}</p>
              <p className="text-2xl font-bold text-amber-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

