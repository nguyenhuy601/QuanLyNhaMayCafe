import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  UserCheck,
  Check,
  X,
  Search,
  PlusCircle,
} from "lucide-react";
import { getAllUsers, getAllRoles } from "../../../api/adminAPI";
import { fetchTeams, saveAttendanceSheet } from "../../../services/factoryService";

const getCurrentUser = () => {
  try {
    const token =
      sessionStorage.getItem("token") || localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    const storedEmail =
      sessionStorage.getItem("userEmail") || localStorage.getItem("userEmail");
    return {
      id: payload.id || payload.userId || payload._id,
      email: payload.email || storedEmail,
      role: payload.role,
      hoTen: payload.hoTen || payload.name,
    };
  } catch (err) {
    return null;
  }
};

export default function Attendance() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [keyword, setKeyword] = useState("");
  const [workers, setWorkers] = useState([]);
  const [newWorker, setNewWorker] = useState({
    id: "",
    name: "",
    shift: "Ca sáng",
    isOvertime: false,
  });
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const currentUser = useMemo(() => getCurrentUser(), []);
  const [availableWorkers, setAvailableWorkers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [teams, setTeams] = useState([]);

  const normalizeRoleVal = (r) => {
    if (!r) return "";
    if (typeof r === "string") return r.toLowerCase();
    if (typeof r === "object") {
      return (
        r.tenRole?.toLowerCase() ||
        r.maRole?.toLowerCase() ||
        r.name?.toLowerCase() ||
        r.code?.toLowerCase() ||
        ""
      );
    }
    return String(r).toLowerCase();
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [u, r, t] = await Promise.all([
          getAllUsers(),
          getAllRoles(),
          fetchTeams(),
        ]);
        setUsers(Array.isArray(u) ? u : []);
        setRoles(Array.isArray(r) ? r : []);
        setTeams(Array.isArray(t) ? t : []);
      } catch (err) {
        setUsers([]);
        setRoles([]);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const roleIdBySlug = useMemo(() => {
    const map = {};
    roles.forEach((r) => (map[(r.tenRole || r.maRole || "").toLowerCase()] = r._id));
    return map;
  }, [roles]);

  // Xác định user tổ trưởng hiện tại (giống trang Phân công ca làm)
  const leader = useMemo(() => {
    if (!currentUser) return null;
    const byId = users.find((u) => u._id === currentUser.id);
    if (byId) return byId;
    const byEmail = users.find(
      (u) => u.email?.toLowerCase() === currentUser.email?.toLowerCase()
    );
    if (byEmail) return byEmail;
    // Không fallback sang tổ trưởng khác
    return null;
  }, [currentUser, users]);

  // Tổ mà tổ trưởng hiện tại phụ trách (từ danh sách tổ sản xuất)
  const currentTeam = useMemo(() => {
    if (!teams.length) return null;

    const matchBy = (userInfo) => {
      if (!userInfo) return null;
      const uId = userInfo.id?.toString() || userInfo._id?.toString();
      const uEmail = userInfo.email?.toLowerCase();
      const uMaNV = userInfo.maNV;

      if (!uId && !uEmail && !uMaNV) return null;

      return (
        teams.find(
          (t) =>
            Array.isArray(t.toTruong) &&
            t.toTruong.some((tt) => {
              const ttId = tt.id?.toString();
              const ttEmail = tt.email?.toLowerCase();
              const ttMaNV = tt.maNV;
              return (
                (ttId && uId && ttId === uId) ||
                (ttEmail && uEmail && ttEmail === uEmail) ||
                (ttMaNV && uMaNV && ttMaNV === uMaNV)
              );
            })
        ) || null
      );
    };

    // Ưu tiên theo thông tin trong token, sau đó tới leader từ admin-service
    const byToken = currentUser ? matchBy(currentUser) : null;
    if (byToken) return byToken;
    const byLeader = leader ? matchBy(leader) : null;
    if (byLeader) return byLeader;

    return null;
  }, [currentUser, leader, teams]);

  useEffect(() => {
    if (users.length === 0) {
      return;
    }

    const leaderDepts = leader?.phongBan || [];
    const workerRoleId = roleIdBySlug["worker"];

    const isWorkerFn = (u) => {
      const field = u.roles || u.role || [];
      const roleIds = Array.isArray(field) ? field : [field];
      const roleNorm = roleIds.map(normalizeRoleVal);

      if (workerRoleId) {
        return (
          roleIds.some((id) => String(id) === String(workerRoleId)) ||
          roleNorm.includes("worker")
        );
      }
      return roleNorm.includes("worker");
    };

    // Nếu tổ đã có danh sách thành viên thì chỉ lấy các thành viên đó
    const memberIdSet =
      currentTeam &&
      Array.isArray(currentTeam.thanhVien) &&
      currentTeam.thanhVien.length > 0
        ? new Set(
            currentTeam.thanhVien
              .map((tv) => tv.id)
              .filter(Boolean)
              .map((id) => id.toString())
          )
        : null;

    // 1) Lọc tất cả user là công nhân (giống ShiftAssignment)
    let list = users
      .filter((u) => {
        if (!Array.isArray(u.phongBan)) return false;
        // Bỏ qua nhân sự đã Inactive
        if (u.trangThai && u.trangThai !== "Active") return false;
        return isWorkerFn(u) && u._id !== leader?._id;
      })
      .map((u) => ({
        id: u._id,
        code: u.maNV || u._id,
        name: u.hoTen,
        depts: u.phongBan || [],
      }));

    // 2) Nếu tổ đã có danh sách thành viên thì CHỈ lấy những người thuộc tổ đó
    if (memberIdSet) {
      list = list.filter((w) => memberIdSet.has(w.id.toString()));
    } else {
      // Tổ chưa có thanhVien: không cho chấm công ai (chờ xưởng trưởng gán thành viên)
      list = [];
    }

    // Danh sách công nhân gốc để chọn trong combobox
    setAvailableWorkers(list);

    // Không tự khởi tạo bảng chấm công nữa.
    // Bảng sẽ chỉ có dòng khi tổ trưởng chọn công nhân và bấm "Thêm công nhân".
    // Giữ nguyên workers hiện tại để không mất trạng thái đã chọn.
  }, [currentUser, leader, currentTeam, roleIdBySlug, users]);

  const toggleStatus = (id, status) => {
    setWorkers((prev) =>
      prev.map((worker) =>
        worker.id === id ? { ...worker, status } : worker
      )
    );
  };

  const filteredWorkers = workers.filter((w) =>
    w.name.toLowerCase().includes(keyword.toLowerCase()) ||
    (w.code || "").toLowerCase().includes(keyword.toLowerCase())
  );

  const addWorker = (e) => {
    e.preventDefault();
    if (!newWorker.id || !newWorker.name) return;

    // Nếu công nhân đã có trong bảng thì chỉ cập nhật ca làm
    setWorkers((prev) => {
      const exists = prev.find((w) => w.id === newWorker.id);
      if (exists) {
        return prev.map((w) =>
          w.id === newWorker.id ? { ...w, shift: newWorker.shift } : w
        );
      }
      // Nếu chưa có (trường hợp nào đó), thêm mới
      return [
        ...prev,
        {
          id: newWorker.id,
          code: newWorker.code,
          name: newWorker.name,
          shift: newWorker.shift,
          status: "present",
          isOvertime: newWorker.isOvertime || false,
        },
      ];
    });

    setNewWorker({ id: "", name: "", shift: "Ca sáng", isOvertime: false });
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      const entries = workers.map((w) => ({
        workerId: w.id,
        maCongNhan: w.code,
        hoTen: w.name,
        caLam:
          w.shift === "Ca chiều"
            ? "ca_chieu"
            : w.shift === "Ca tối"
            ? "ca_toi"
            : "ca_sang",
        trangThai:
          w.status === "absent"
            ? "vang"
            : "co_mat",
        isOvertime: w.isOvertime || false,
      }));

      const payload = {
        ngay: date,
        caLam:
          newWorker.shift === "Ca chiều"
            ? "ca_chieu"
            : newWorker.shift === "Ca tối"
            ? "ca_toi"
            : "ca_sang",
        toSanXuat: currentTeam
          ? {
              id: currentTeam._id || currentTeam.id,
              tenTo: currentTeam.tenTo,
            }
          : undefined,
        entries,
      };

      await saveAttendanceSheet(payload);
      setToast("✅ Đã lưu bảng chấm công hôm nay");
      setTimeout(() => setToast(""), 1500);
    } catch (err) {
      setToast("❌ Không thể lưu bảng chấm công");
      setTimeout(() => setToast(""), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-amber-900">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
          <UserCheck size={24} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
            Attendance
          </p>
          <h1 className="text-3xl font-bold text-amber-900">
            Chấm công cho công nhân
          </h1>
        </div>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex items-center gap-3 rounded-2xl border border-amber-200 px-4 py-2.5 bg-white text-sm text-amber-900 focus-within:ring-2 focus-within:ring-amber-500">
            <CalendarDays size={18} className="text-amber-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 border-none bg-transparent outline-none"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-amber-200 px-4 py-2.5 bg-white text-sm text-amber-900 focus-within:ring-2 focus-within:ring-amber-500 md:col-span-2">
            <Search size={18} className="text-amber-500" />
            <input
              type="text"
              placeholder="Tìm mã hoặc tên công nhân..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 border-none bg-transparent outline-none"
            />
          </label>
        </div>
        <form
          onSubmit={addWorker}
          className="grid gap-4 md:grid-cols-3 pt-4 border-t border-amber-100"
        >
          <div>
            <label className="text-sm font-semibold text-amber-800">
              Họ tên
            </label>
            <select
              value={newWorker.id}
              onChange={(e) => {
                const selected = availableWorkers.find(
                  (w) => w.id === e.target.value
                );
                setNewWorker({
                  ...newWorker,
                  id: selected?.id || "",
                  code: selected?.code || "",
                  name: selected?.name || "",
                });
              }}
              className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">-- Chọn công nhân --</option>
              {availableWorkers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-amber-800">
              Ca làm
            </label>
            <select
              value={newWorker.shift}
              onChange={(e) =>
                setNewWorker({ ...newWorker, shift: e.target.value })
              }
              className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option>Ca sáng</option>
              <option>Ca chiều</option>
              <option>Ca tối</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={newWorker.isOvertime}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, isOvertime: e.target.checked })
                }
                className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm font-semibold text-amber-800">
                Tăng ca
              </span>
            </label>
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold shadow hover:shadow-lg transition"
            >
              <PlusCircle size={18} />
              Thêm công nhân
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-amber-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Mã CN</th>
                <th className="px-4 py-3 text-left font-semibold">Họ tên</th>
                <th className="px-4 py-3 text-left font-semibold">Ca làm</th>
                <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-left font-semibold">Tăng ca</th>
                <th className="px-4 py-3 text-left font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50 bg-white">
              {filteredWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-amber-50/60">
                  <td className="px-4 py-3 font-semibold">{worker.code}</td>
                  <td className="px-4 py-3">{worker.name}</td>
                  <td className="px-4 py-3">{worker.shift}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        worker.status === "present"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {worker.status === "present" ? "Có mặt" : "Vắng"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {worker.isOvertime ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                        Có
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        Không
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStatus(worker.id, "present")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition ${
                          worker.status === "present"
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        <Check size={14} />
                        Có mặt
                      </button>
                      <button
                        onClick={() => toggleStatus(worker.id, "absent")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition ${
                          worker.status === "absent"
                            ? "bg-rose-500 text-white border-rose-500"
                            : "border-rose-200 text-rose-600 hover:bg-rose-50"
                        }`}
                      >
                        <X size={14} />
                        Vắng
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={saveAttendance}
          disabled={saving}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow hover:shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Đang lưu..." : "Lưu bảng chấm công"}
        </button>
      </div>

      {toast && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-emerald-600 text-white px-5 py-3 rounded-full shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

