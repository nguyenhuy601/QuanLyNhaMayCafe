import React, { useEffect, useMemo, useState } from "react";
import { User, Users, ClipboardList, Clock4 } from "lucide-react";
import {
  getAllUsers,
  getAllDepartments,
  getAllRoles,
  getAllPositions,
} from "../../../api/adminAPI";
import {
  fetchTeams,
  fetchTeamLeaderShifts,
  fetchAttendanceSheets,
} from "../../../services/factoryService";

// Lấy thông tin user từ JWT token
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
      // Nếu trong token không có email thì lấy từ localStorage (lưu lúc login)
      email: payload.email || storedEmail,
      role: payload.role,
      hoTen: payload.hoTen || payload.name,
    };
  } catch (err) {
    console.error("Lỗi khi parse token:", err);
    return null;
  }
};

export default function ToTruongInfo() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [teams, setTeams] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [attendanceSheets, setAttendanceSheets] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [u, r, d, p, t, s, at] = await Promise.all([
          getAllUsers(),
          getAllRoles(),
          getAllDepartments(),
          getAllPositions(),
          fetchTeams(),
          fetchTeamLeaderShifts(),
          fetchAttendanceSheets({
            date: new Date().toISOString().substring(0, 10),
          }),
        ]);
        setUsers(Array.isArray(u) ? u : []);
        setRoles(Array.isArray(r) ? r : []);
        setDepartments(Array.isArray(d) ? d : []);
        setPositions(Array.isArray(p) ? p : []);
        setTeams(Array.isArray(t) ? t : []);
        setShifts(Array.isArray(s) ? s : []);
        setAttendanceSheets(Array.isArray(at) ? at : []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu tổ trưởng:", err);
        setError("Không thể tải danh sách nhân sự. Kiểm tra quyền/đăng nhập.");
        setUsers([]);
        setRoles([]);
        setDepartments([]);
        setPositions([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const currentUser = useMemo(() => getCurrentUser(), []);

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

  const roleNameById = useMemo(() => {
    const map = {};
    roles.forEach((r) => {
      map[r._id] = r.tenRole || r.maRole;
    });
    return map;
  }, [roles]);

  const deptNameById = useMemo(() => {
    const map = {};
    departments.forEach((d) => {
      map[d._id] = d.tenPhong || d.maPhong;
    });
    return map;
  }, [departments]);

  const positionNameById = useMemo(() => {
    const map = {};
    positions.forEach((p) => {
      map[p._id] = p.tenChucVu || p.maChucVu;
    });
    return map;
  }, [positions]);

  // Xác định user tổ trưởng hiện tại (ưu tiên id, sau đó email)
  const leader = useMemo(() => {
    if (!currentUser) return null;
    const byId = users.find((u) => u._id === currentUser.id);
    if (byId) return byId;
    const byEmail = users.find((u) => u.email?.toLowerCase() === currentUser.email?.toLowerCase());
    if (byEmail) return byEmail;
    // Không fallback sang tổ trưởng khác – nếu không tìm được thì để null
    return null;
  }, [currentUser, users]);

  // Role id cho worker/totruong
  const roleIdBySlug = useMemo(() => {
    const map = {};
    roles.forEach((r) => {
      const slug = (r.tenRole || r.maRole || "").toLowerCase();
      map[slug] = r._id;
    });
    return map;
  }, [roles]);

  // Thành viên (công nhân) tiềm năng: ưu tiên cùng phòng ban với tổ trưởng nếu xác định được
  const baseWorkers = useMemo(() => {
    const leaderDepts = leader?.phongBan || [];
    const workerRoleId = roleIdBySlug["worker"];

    const isWorkerFn = (u) => {
      const roleNorm = (u.role || []).map(normalizeRoleVal);
      if (workerRoleId) {
        return (u.role || []).includes(workerRoleId) || roleNorm.includes("worker");
      }
      return roleNorm.includes("worker");
    };

    // Bắt đầu từ tất cả công nhân
    let result = users.filter((u) => {
      if (!Array.isArray(u.phongBan)) return false;
      // Bỏ qua nhân sự đã Inactive
      if (u.trangThai && u.trangThai !== "Active") return false;
      return isWorkerFn(u);
    });

    // Nếu biết phòng ban của tổ trưởng thì có thể lọc thêm theo phòng ban
    if (leaderDepts.length > 0) {
      result = result.filter((u) =>
        u.phongBan.some((pb) => leaderDepts.includes(pb))
      );
    }

    return result;
  }, [leader, roleIdBySlug, users]);

  // Tổ mà tổ trưởng hiện tại phụ trách (dựa vào toTruong.id/email/maNV)
  const currentTeam = useMemo(() => {
    if (!teams.length) return null;

    const matchBy = (userInfo) => {
      if (!userInfo) return null;
      const uId = userInfo.id?.toString() || userInfo._id?.toString();
      const uEmail = userInfo.email?.toLowerCase();
      const uMaNV = userInfo.maNV;
      const uName = (userInfo.hoTen || userInfo.name || "").toLowerCase();

      if (!uId && !uEmail && !uMaNV && !uName) return null;

      return (
        teams.find(
          (t) =>
            Array.isArray(t.toTruong) &&
            t.toTruong.some((tt) => {
              const ttId = tt.id?.toString();
              const ttEmail = tt.email?.toLowerCase();
              const ttMaNV = tt.maNV;
              const ttName = (tt.hoTen || tt.name || "").toLowerCase();
              return (
                (ttId && uId && ttId === uId) ||
                (ttEmail && uEmail && ttEmail === uEmail) ||
                (ttMaNV && uMaNV && ttMaNV === uMaNV) ||
                (ttName && uName && ttName === uName)
              );
            })
        ) || null
      );
    };

    // Ưu tiên thông tin từ JWT (currentUser), sau đó tới leader suy ra từ users
    const byToken = currentUser ? matchBy(currentUser) : null;
    if (byToken) return byToken;
    const byLeader = leader ? matchBy(leader) : null;
    if (byLeader) return byLeader;

    // Không fallback sang tổ của người khác; nếu không match được thì coi như chưa gán tổ
    console.warn("[Teamleader/Teams] Không tìm được tổ cho tổ trưởng.", {
      currentUser,
      leader,
    });
    return null;
  }, [currentUser, leader, teams]);

  // Danh sách thành viên hiển thị:
  // - Nếu tổ đã gán thanhVien: chỉ hiển thị đúng những người đó
  // - Nếu tổ chưa có thanhVien: KHÔNG hiển thị công nhân nào (chờ xưởng trưởng gán)
  const members = useMemo(() => {
    if (
      currentTeam &&
      Array.isArray(currentTeam.thanhVien) &&
      currentTeam.thanhVien.length > 0
    ) {
      const idSet = new Set(
        currentTeam.thanhVien
          .map((tv) => tv.id)
          .filter(Boolean)
          .map((id) => id.toString())
      );
      return baseWorkers.filter((u) =>
        u._id ? idSet.has(u._id.toString()) : false
      );
    }
    // Chưa gán ai vào tổ: không hiển thị công nhân nào
    return [];
  }, [baseWorkers, currentTeam]);

  // Thống kê trạng thái làm việc theo từng công nhân
  // - Chấm công hôm nay: từ AttendanceSheet
  // - Ca hiện tại: từ ShiftSchedule
  const todayStr = useMemo(
    () => new Date().toISOString().substring(0, 10),
    []
  );

  const statsByMemberId = useMemo(() => {
    const map = {};

    // 1) Chấm công hôm nay từ AttendanceSheet
    attendanceSheets.forEach((sheet) => {
      const ngay =
        sheet.ngay instanceof Date
          ? sheet.ngay.toISOString().substring(0, 10)
          : typeof sheet.ngay === "string"
          ? sheet.ngay.substring(0, 10)
          : "";

      if (ngay !== todayStr) return;

      (sheet.entries || []).forEach((e) => {
        // Match theo workerId hoặc maCongNhan
        const workerId = (e.workerId || e.maCongNhan || "").toString();
        if (!workerId) return;

        // Tìm trong members để lấy _id thực tế của user
        const member = members.find(
          (mem) =>
            mem._id?.toString() === workerId ||
            mem.maNV === workerId ||
            mem._id?.toString() === e.workerId?.toString()
        );

        if (!member) return;

        const key = member._id?.toString() || member.id?.toString();
        if (!key) return;

        const existing = map[key] || {};
        map[key] = {
          ...existing,
          hasAttendanceToday: true,
        };
      });
    });

    // 2) Ca làm hiện tại từ ShiftSchedule hôm nay
    // Chỉ lấy shifts của tổ hiện tại
    const teamShifts = currentTeam
      ? shifts.filter(
          (s) =>
            s.toSanXuat?.id === (currentTeam._id || currentTeam.id)?.toString()
        )
      : [];

    teamShifts.forEach((s) => {
      const ngay =
        s.ngay instanceof Date
          ? s.ngay.toISOString().substring(0, 10)
          : typeof s.ngay === "string"
          ? s.ngay.substring(0, 10)
          : "";

      if (ngay !== todayStr) return;

      const shiftLabel =
        s.caLam === "ca_chieu"
          ? "Ca chiều (14h - 22h)"
          : s.caLam === "ca_toi"
          ? "Ca tối (22h - 06h)"
          : "Ca sáng (06h - 14h)";

      (s.members || []).forEach((m) => {
        // Match theo workerId (có thể là _id hoặc maNV)
        const workerId = (m.workerId || m.maCongNhan || "").toString();
        if (!workerId) return;

        // Tìm trong members để lấy _id thực tế của user
        // Match chính xác hơn: so sánh cả _id và maNV
        const member = members.find((mem) => {
          const memId = mem._id?.toString() || "";
          const memMaNV = mem.maNV || "";
          return (
            (memId && memId === workerId) ||
            (memMaNV && memMaNV === workerId) ||
            (memId && memId === m.workerId?.toString())
          );
        });

        if (!member) return;

        const key = member._id?.toString() || member.id?.toString();
        if (!key) return;

        const existing = map[key] || {};
        // Nếu đã có ca làm, ưu tiên ca sáng, sau đó chiều, cuối cùng tối
        if (!existing.currentShift) {
          map[key] = {
            ...existing,
            currentShift: shiftLabel,
            isOvertime: false,
            progressLabel: existing.progressLabel || "Chưa có dữ liệu",
          };
        } else {
          // Nếu có nhiều ca trong ngày, hiển thị tất cả (cách nhau bằng dấu phẩy)
          const existingShift = existing.currentShift;
          if (!existingShift.includes(shiftLabel)) {
            map[key] = {
              ...existing,
              currentShift: `${existingShift}, ${shiftLabel}`,
            };
          }
        }
      });
    });

    return map;
  }, [attendanceSheets, shifts, todayStr, members, currentTeam]);

  if (loading) {
    return <div className="p-6 text-amber-800">Đang tải dữ liệu tổ trưởng...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-700">{error}</div>;
  }

  return (
    <div className="space-y-6 text-amber-900">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
          <User size={24} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
            Team Lead
          </p>
          <h1 className="text-3xl font-bold text-amber-900">
            Danh sách công nhân trong tổ
          </h1>
        </div>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
            <Users size={18} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">
              Thành viên trong tổ{" "}
              {currentTeam?.tenTo ? `(${currentTeam.tenTo})` : ""}
            </p>
            <p className="text-xs text-amber-500">
              Danh sách công nhân đã được gán vào tổ hoặc cùng phòng ban
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {members.map((member) => (
            <div
              key={member._id || member.id || member.email}
              className="border border-amber-100 rounded-2xl px-4 py-3 flex items-center justify-between hover:border-amber-200 transition"
            >
              <div>
                <p className="font-semibold text-amber-900">{member.hoTen}</p>
                <p className="text-xs text-amber-500">
                  Mã NV: {member.maNV || member._id}
                </p>
                {member.email && (
                  <p className="text-xs text-amber-500">
                    Email: {member.email}
                  </p>
                )}
              </div>
              <div className="text-right text-xs space-y-1">
                <p className="text-amber-700 font-semibold text-sm">
                  {(member.chucVu || [])
                    .map((id) => positionNameById[id] || id)
                    .join(", ") || "—"}
                </p>
                <p className="text-amber-500">
                  {(member.phongBan || []).map((id) => deptNameById[id] || id).join(", ") || "—"}
                </p>
                <p className="text-amber-500">
                  Quyền:{" "}
                  {(member.role || [])
                    .map((id) => roleNameById[id] || id)
                    .join(", ") || "—"}
                </p>
                {(() => {
                  const stat =
                    statsByMemberId[
                      (member._id || member.id || "").toString()
                    ];
                  return (
                    <>
                      <p className="flex items-center justify-end gap-1 text-green-700">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                        Chấm công hôm nay:{" "}
                        <span className="font-semibold">
                          {stat?.hasAttendanceToday ? "Có" : "Chưa"}
                        </span>
                      </p>
                      <p className="flex items-center justify-end gap-1 text-amber-700">
                        <Clock4 size={12} />
                        Ca hiện tại:{" "}
                        <span className="font-semibold">
                          {stat?.currentShift || "—"}
                        </span>
                      </p>
                      <p className="text-amber-700">
                        Tăng ca:{" "}
                        <span className="font-semibold">
                          {stat?.isOvertime ? "Có" : "Không"}
                        </span>
                      </p>
                      <p className="text-amber-700">
                        Tiến độ:{" "}
                        <span className="font-semibold">
                          {stat?.progressLabel || "Chưa có dữ liệu"}
                        </span>
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

