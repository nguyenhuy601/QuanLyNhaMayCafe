import React, { useEffect, useMemo, useState } from "react";
import { Clipboard, Clock4, Users, UserPlus } from "lucide-react";
import { getAllUsers, getAllRoles } from "../../../api/adminAPI";
import {
  fetchTeams,
  assignTeamMember,
  fetchTeamLeaderShifts,
  saveShiftSchedule,
  addShiftMember,
  fetchAttendanceSheets,
} from "../../../services/factoryService";

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
      maNV: payload.maNV,
    };
  } catch (err) {
    return null;
  }
};

export default function ShiftAssignment() {
  const [workerOptions, setWorkerOptions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    workerId: "",
    shift: "Ca sáng (06h - 14h)",
    date: new Date().toISOString().split("T")[0],
    isOvertime: false,
  });
  const [assignments, setAssignments] = useState([]);
  const currentUser = useMemo(() => getCurrentUser(), []);
  const [teams, setTeams] = useState([]);
  const [attendanceSheets, setAttendanceSheets] = useState([]);

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

  // Helper function: Tìm isOvertime từ chấm công dựa trên workerId, date, và caLam
  const getOvertimeFromAttendance = (workerId, date, caLam) => {
    if (!attendanceSheets || attendanceSheets.length === 0) return false;
    
    // Chuyển đổi caLam từ code sang label để so sánh
    const caLamCode = caLam === "Ca chiều (14h - 22h)" ? "ca_chieu" :
                      caLam === "Ca tối (22h - 06h)" ? "ca_toi" :
                      "ca_sang";
    
    // Tìm bảng chấm công phù hợp
    for (const sheet of attendanceSheets) {
      // So sánh ngày
      let sheetDateStr = "";
      if (sheet.ngay) {
        if (sheet.ngay instanceof Date) {
          sheetDateStr = sheet.ngay.toISOString().substring(0, 10);
        } else if (typeof sheet.ngay === "string") {
          sheetDateStr = sheet.ngay.substring(0, 10);
        }
      }
      
      if (sheetDateStr !== date) continue;
      if (sheet.caLam !== caLamCode) continue;
      
      // Tìm entry của công nhân này
      if (sheet.entries && Array.isArray(sheet.entries)) {
        const entry = sheet.entries.find(
          (e) => e.workerId === workerId || e.maCongNhan === workerId
        );
        if (entry && entry.isOvertime === true) {
          return true;
        }
      }
    }
    
    return false;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [u, r, t, schedules, attendance] = await Promise.all([
          getAllUsers(),
          getAllRoles(),
          fetchTeams(),
          fetchTeamLeaderShifts(),
          fetchAttendanceSheets(),
        ]);
        setUsers(Array.isArray(u) ? u : []);
        setRoles(Array.isArray(r) ? r : []);
        setTeams(Array.isArray(t) ? t : []);
        setAttendanceSheets(Array.isArray(attendance) ? attendance : []);

        // Map dữ liệu lịch phân ca (ShiftSchedule) sang format hiển thị
        const mapped =
          Array.isArray(schedules) &&
          schedules.flatMap((s) => {
            // Parse ngay đúng cách (hỗ trợ cả Date object và string)
            let dateStr = "";
            if (s.ngay) {
              if (s.ngay instanceof Date) {
                dateStr = s.ngay.toISOString().substring(0, 10);
              } else if (typeof s.ngay === "string") {
                dateStr = s.ngay.substring(0, 10);
              }
            }
            
            const shiftLabel =
              s.caLam === "ca_chieu"
                ? "Ca chiều (14h - 22h)"
                : s.caLam === "ca_toi"
                ? "Ca tối (22h - 06h)"
                : "Ca sáng (06h - 14h)";
            
            return (s.members || []).map((m) => {
              // Đảm bảo các giá trị được gán đúng
              const workerName = m.hoTen || "";
              const workerId = m.workerId || m.maCongNhan || "";
              const teamName = s.toSanXuat?.tenTo || "";
              const shiftValue = shiftLabel; // "Ca sáng (06h - 14h)" hoặc tương tự
              const dateValue = dateStr; // "yyyy-mm-dd"
              const tasksValue = (m.nhiemVu || m.ghiChu || s.ghiChu || "").trim();
              
              // Lấy isOvertime từ chấm công, fallback về giá trị từ phân công ca làm
              const overtimeFromAttendance = getOvertimeFromAttendance(workerId, dateValue, shiftValue);
              const finalOvertime = overtimeFromAttendance || m.isOvertime || false;
              
              return {
                id: m._id || `${s._id}-${workerId}`,
                workerId: workerId,
                worker: {
                  id: workerId,
                  name: workerName,
                  team: teamName,
                },
                shift: shiftValue,
                date: dateValue,
                tasks: tasksValue,
                isOvertime: finalOvertime,
              };
            });
          });
        setAssignments(Array.isArray(mapped) ? mapped : []);
      } catch (err) {
        setUsers([]);
        setRoles([]);
        setTeams([]);
      }
    };
    load();
  }, []);

  const roleIdBySlug = useMemo(() => {
    const map = {};
    roles.forEach((r) => (map[(r.tenRole || r.maRole || "").toLowerCase()] = r._id));
    return map;
  }, [roles]);

  // Xác định tổ trưởng hiện tại (ưu tiên id, sau đó email, fallback role totruong)
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

  // Tổ mà tổ trưởng hiện tại phụ trách
  // Ưu tiên map trực tiếp theo thông tin trong token (currentUser),
  // sau đó fallback sang object leader lấy từ admin-service (nếu cần).
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

    // 1. Thử map bằng thông tin trong token
    const byToken = currentUser ? matchBy(currentUser) : null;
    if (byToken) return byToken;

    // 2. Thử map bằng object leader lấy từ admin-service
    const byLeader = leader ? matchBy(leader) : null;
    if (byLeader) return byLeader;

    // 3. Fallback cuối: nếu chỉ có đúng 1 tổ đã gán toTruong thì chọn luôn tổ đó
    const teamsWithLeader = teams.filter(
      (t) => Array.isArray(t.toTruong) && t.toTruong.length > 0
    );
    if (teamsWithLeader.length === 1) {
      return teamsWithLeader[0];
    }

    return null;
  }, [currentUser, leader, teams]);

  useEffect(() => {
    if (users.length === 0) return;

    const leaderDepts = leader?.phongBan || [];
    const workerRoleId = roleIdBySlug["worker"];

    const isWorkerFn = (u) => {
      const roleNorm = (u.role || []).map(normalizeRoleVal);
      if (workerRoleId) {
        return (u.role || []).includes(workerRoleId) || roleNorm.includes("worker");
      }
      return roleNorm.includes("worker");
    };

    // Nếu tổ đã có danh sách thành viên thì chỉ cho phân công trên các thành viên đó
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

    let list = users
      .filter((u) => {
        if (!Array.isArray(u.phongBan)) return false;
        // Bỏ qua nhân sự đã Inactive
        if (u.trangThai && u.trangThai !== "Active") return false;
        return isWorkerFn(u);
      })
      .map((u) => ({
        id: u._id,
        name: u.hoTen,
        team: (u.phongBan || []).join(", "),
      }));

    // Ràng buộc theo thành viên tổ nếu đã có
    if (memberIdSet) {
      list = list.filter((w) => memberIdSet.has(w.id.toString()));
    } else {
      // Tổ chưa có thanhVien: không cho phân công bất kỳ công nhân nào
      list = [];
    }

    setWorkerOptions(list);
  }, [leader, roleIdBySlug, users, currentTeam]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.workerId) return;

    if (!currentTeam) {
      return;
    }

    const user = users.find((u) => u._id === formData.workerId);
    if (!user) {
      return;
    }

    const workerInfo = workerOptions.find((w) => w.id === formData.workerId);

    // Chuyển đổi label ca làm sang code - kiểm tra chính xác hơn
    let shiftCode = "ca_sang"; // Mặc định
    const shiftValue = formData.shift || "";
    if (shiftValue.includes("chiều") || shiftValue.includes("Chiều")) {
      shiftCode = "ca_chieu";
    } else if (shiftValue.includes("tối") || shiftValue.includes("Tối")) {
      shiftCode = "ca_toi";
    } else if (shiftValue.includes("sáng") || shiftValue.includes("Sáng")) {
      shiftCode = "ca_sang";
    }
    
    // Debug log để kiểm tra
    console.log("🔍 [ShiftAssignment] Chuyển đổi ca làm:", {
      formDataShift: formData.shift,
      shiftValue: shiftValue,
      shiftCode: shiftCode
    });

    try {
      // 1) Tìm lịch phân ca hiện có cho ngày + ca + tổ
      const existing = await fetchTeamLeaderShifts({
        date: formData.date,
        caLam: shiftCode,
        teamId: currentTeam._id || currentTeam.id,
      });

      let schedule = Array.isArray(existing) && existing.length > 0
        ? existing[0]
        : null;

      // Kiểm tra schedule tìm được có đúng ca làm không
      if (schedule && schedule.caLam !== shiftCode) {
        console.warn("⚠️ [ShiftAssignment] Schedule tìm được có ca làm không khớp:", {
          expected: shiftCode,
          found: schedule.caLam
        });
        schedule = null; // Bỏ qua schedule không đúng, tạo mới
      }

      // 2) Nếu chưa có lịch, tạo mới (không có members)
      if (!schedule) {
        schedule = await saveShiftSchedule({
          ngay: formData.date,
          caLam: shiftCode,
          toSanXuat: {
            id: currentTeam._id || currentTeam.id,
            tenTo: currentTeam.tenTo,
          },
          members: [],
        });
        
        // Đảm bảo schedule mới tạo có đúng caLam
        if (schedule && schedule.caLam !== shiftCode) {
          console.error("❌ [ShiftAssignment] Schedule mới tạo có ca làm sai:", {
            expected: shiftCode,
            received: schedule.caLam
          });
        }
      }

      // 3) Thêm công nhân vào lịch phân ca
      // Nhiệm vụ lấy từ nhiệm vụ của tổ (mỗi tổ có nhiệm vụ riêng)
      const nhiemVu = currentTeam.mota || currentTeam.nhiemVu || "";
      const memberPayload = {
        workerId: user._id,
        maCongNhan: user.maNV || "",
        hoTen: user.hoTen || user.name || "",
        nhiemVu: nhiemVu,
        trangThai: "scheduled",
        ghiChu: "",
        email: user.email || "",
        isOvertime: formData.isOvertime || false,
      };

      const updatedSchedule = await addShiftMember(
        schedule._id || schedule.id,
        memberPayload
      );

      // Debug: Kiểm tra ca làm sau khi thêm member
      console.log("🔍 [ShiftAssignment] Schedule sau khi thêm member:", {
        scheduleId: updatedSchedule._id || updatedSchedule.id,
        caLam: updatedSchedule.caLam,
        expectedShiftCode: shiftCode,
        match: updatedSchedule.caLam === shiftCode
      });

      // 4) Cập nhật bảng hiển thị từ lịch mới
      let dateStr = formData.date;
      if (updatedSchedule.ngay) {
        if (updatedSchedule.ngay instanceof Date) {
          dateStr = updatedSchedule.ngay.toISOString().substring(0, 10);
        } else if (typeof updatedSchedule.ngay === "string") {
          dateStr = updatedSchedule.ngay.substring(0, 10);
        }
      }
      
      // Đảm bảo dùng caLam từ updatedSchedule, không dùng shiftCode
      const actualCaLam = updatedSchedule.caLam || shiftCode;
      const shiftLabel =
        actualCaLam === "ca_chieu"
          ? "Ca chiều (14h - 22h)"
          : actualCaLam === "ca_toi"
          ? "Ca tối (22h - 06h)"
          : "Ca sáng (06h - 14h)";
      
      // Cảnh báo nếu ca làm không khớp
      if (actualCaLam !== shiftCode) {
        console.error("❌ [ShiftAssignment] Ca làm không khớp sau khi lưu:", {
          expected: shiftCode,
          actual: actualCaLam,
          formDataShift: formData.shift
        });
      }

      const lastMember =
        updatedSchedule.members[updatedSchedule.members.length - 1];

      if (lastMember) {
        const workerId = lastMember.workerId || lastMember.maCongNhan || "";
        // Lấy isOvertime từ chấm công
        const overtimeFromAttendance = getOvertimeFromAttendance(workerId, dateStr, shiftLabel);
        const finalOvertime = overtimeFromAttendance || lastMember.isOvertime || false;
        
        setAssignments((prev) => [
          {
            id: lastMember._id || `${updatedSchedule._id}-${workerId}`,
            workerId: workerId,
            worker: {
              id: workerId,
              name: lastMember.hoTen || workerInfo?.name || "",
              team: updatedSchedule.toSanXuat?.tenTo || currentTeam.tenTo,
            },
            shift: shiftLabel,
            date: dateStr,
            tasks: lastMember.nhiemVu || lastMember.ghiChu || formData.tasks,
            isOvertime: finalOvertime,
          },
          ...prev,
        ]);
      }

      // 5) Đồng thời gán công nhân vào danh sách thành viên tổ (ToSanXuat.thanhVien)
      //    (logic đã được thực hiện trong addShiftMember ở backend)

      // Reset form
      setFormData({
        workerId: "",
        shift: "Ca sáng (06h - 14h)",
        date: formData.date,
        isOvertime: false,
      });

      // Reload lại danh sách lịch phân ca và chấm công để đảm bảo đồng bộ
      const [refreshed, refreshedAttendance] = await Promise.all([
        fetchTeamLeaderShifts(),
        fetchAttendanceSheets(),
      ]);
      
      // Cập nhật danh sách chấm công
      setAttendanceSheets(Array.isArray(refreshedAttendance) ? refreshedAttendance : []);
      
      if (Array.isArray(refreshed)) {
        const remapped = refreshed.flatMap((s) => {
          let dateStr = "";
          if (s.ngay) {
            if (s.ngay instanceof Date) {
              dateStr = s.ngay.toISOString().substring(0, 10);
            } else if (typeof s.ngay === "string") {
              dateStr = s.ngay.substring(0, 10);
            }
          }
          
          const shiftLabel =
            s.caLam === "ca_chieu"
              ? "Ca chiều (14h - 22h)"
              : s.caLam === "ca_toi"
              ? "Ca tối (22h - 06h)"
              : "Ca sáng (06h - 14h)";
          
          return (s.members || []).map((m) => {
            const workerName = m.hoTen || "";
            const workerId = m.workerId || m.maCongNhan || "";
            const teamName = s.toSanXuat?.tenTo || "";
            const shiftValue = shiftLabel;
            const dateValue = dateStr;
            const tasksValue = (m.nhiemVu || m.ghiChu || s.ghiChu || "").trim();
            
            // Lấy isOvertime từ chấm công (sử dụng dữ liệu đã refresh)
            const overtimeFromAttendance = getOvertimeFromAttendance(workerId, dateValue, shiftValue);
            const finalOvertime = overtimeFromAttendance || m.isOvertime || false;
            
            return {
              id: m._id || `${s._id}-${workerId}`,
              workerId: workerId,
              worker: {
                id: workerId,
                name: workerName,
                team: teamName,
              },
              shift: shiftValue,
              date: dateValue,
              tasks: tasksValue,
              isOvertime: finalOvertime,
            };
          });
        });
        setAssignments(remapped);
      }
    } catch (err) {
    }
  };

  const inputClass =
    "mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500";

  // Chỉ hiển thị lịch phân ca của các công nhân còn là thành viên tổ hiện tại
  const visibleAssignments = useMemo(() => {
    if (
      !currentTeam ||
      !Array.isArray(currentTeam.thanhVien) ||
      currentTeam.thanhVien.length === 0
    ) {
      return [];
    }
    const memberIdSet = new Set(
      currentTeam.thanhVien
        .map((tv) => tv.id)
        .filter(Boolean)
        .map((id) => id.toString())
    );
    return assignments.filter((a) =>
      memberIdSet.has((a.workerId || a.worker?.id || "").toString())
    );
  }, [assignments, currentTeam]);

  return (
    <div className="space-y-6 text-amber-900">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
          <Clipboard size={24} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
            Scheduling
          </p>
          <h1 className="text-3xl font-bold text-amber-900">
            Phân công ca làm
          </h1>
        </div>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow p-6">
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-amber-800">
              Công nhân
            </label>
            <select
              name="workerId"
              value={formData.workerId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">-- Chọn công nhân --</option>
              {workerOptions.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} ({worker.team})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-amber-800">
              Ngày thực hiện
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-amber-800">
              Ca làm
            </label>
            <select
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="Ca sáng (06h - 14h)">Ca sáng (06h - 14h)</option>
              <option value="Ca chiều (14h - 22h)">Ca chiều (14h - 22h)</option>
              <option value="Ca tối (22h - 06h)">Ca tối (22h - 06h)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="isOvertime"
                checked={formData.isOvertime}
                onChange={(e) =>
                  setFormData({ ...formData, isOvertime: e.target.checked })
                }
                className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm font-semibold text-amber-800">
                Tăng ca
              </span>
            </label>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={!formData.workerId}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 font-semibold text-white shadow hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center gap-2">
                <UserPlus size={18} />
                Giao ca làm
              </span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-amber-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">
                  Công nhân
                </th>
                <th className="px-4 py-3 text-left font-semibold">Ca làm</th>
                <th className="px-4 py-3 text-left font-semibold">Ngày</th>
                <th className="px-4 py-3 text-left font-semibold">Tăng ca</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50 bg-white">
              {visibleAssignments.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50/60">
                  <td className="px-4 py-3 font-semibold flex items-center gap-2">
                    <Users size={16} className="text-amber-500" />
                    <div>
                      <p>{item.worker?.name}</p>
                      <p className="text-xs text-amber-600">
                        {item.worker?.id} • {item.worker?.team}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.shift}</td>
                  <td className="px-4 py-3">{item.date}</td>
                  <td className="px-4 py-3">
                    {item.isOvertime ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                        Có
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                        Không
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

