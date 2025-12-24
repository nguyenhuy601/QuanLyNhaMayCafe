import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  fetchManagerAssignments,
  confirmMemberCompletion,
} from "../../../services/factoryService";
import { fetchPlanById, fetchProductionPlans } from "../../../services/planService";
import { createQcRequest, getAllQcResults, getAllQcRequests } from "../../../services/qcService";
import useRealtime from "../../../hooks/useRealtime";

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
  const [assignments, setAssignments] = useState([]);
  const [qcPreview, setQcPreview] = useState(null);
  const [qcModalOpen, setQcModalOpen] = useState(false);
  const [creatingQc, setCreatingQc] = useState(false);
  const [confirmingMember, setConfirmingMember] = useState(null);
  const [qcResults, setQcResults] = useState([]);
  const [qcResultsModalOpen, setQcResultsModalOpen] = useState(false);
  const [loadingQcResults, setLoadingQcResults] = useState(false);
  const [qcRequests, setQcRequests] = useState([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [u, r, d, p, t, s, at, as, qcReqs] = await Promise.all([
        getAllUsers(),
        getAllRoles(),
        getAllDepartments(),
        getAllPositions(),
        fetchTeams(),
        fetchTeamLeaderShifts(),
        fetchAttendanceSheets({
          date: new Date().toISOString().substring(0, 10),
        }),
        fetchManagerAssignments(),
        getAllQcRequests().catch(() => []), // Load QC requests, fallback về [] nếu lỗi
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setRoles(Array.isArray(r) ? r : []);
      setDepartments(Array.isArray(d) ? d : []);
      setPositions(Array.isArray(p) ? p : []);
      setTeams(Array.isArray(t) ? t : []);
      setShifts(Array.isArray(s) ? s : []);
      setAttendanceSheets(Array.isArray(at) ? at : []);
      setAssignments(Array.isArray(as) ? as : []);
      setQcRequests(Array.isArray(qcReqs) ? qcReqs : []);
      } catch (err) {
        setError("Không thể tải danh sách nhân sự. Kiểm tra quyền/đăng nhập.");
        setUsers([]);
        setRoles([]);
        setDepartments([]);
        setPositions([]);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime updates
  useRealtime({
    eventHandlers: {
      ASSIGNMENT_CREATED: loadData,
      ASSIGNMENT_UPDATED: loadData,
      QC_REQUEST_CREATED: loadData,
      QC_RESULT_CREATED: loadData,
      factory_events: loadData, // Generic factory events
    },
  });

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

  const handleCreateQcRequest = async () => {
    if (!currentTeam) {
      alert("Chưa xác định được tổ hiện tại để tạo phiếu.");
      return;
    }

    const name = (currentTeam.tenTo || "").toLowerCase();
    const nhomSanPham = currentTeam.nhomSanPham || "";
    
    // Kiểm tra tổ đặc biệt theo nhomSanPham
    const isSpecialTeamForRangXay = 
      (name.includes("sàng lọc") || name.includes("phan loai") || name.includes("phân loại")) &&
      nhomSanPham === "rangxay";
    
    const isSpecialTeamForHoaTan = 
      (name.includes("sấy") || name.includes("say")) &&
      nhomSanPham === "hoatan";
    
    if (!isSpecialTeamForRangXay && !isSpecialTeamForHoaTan) {
      // Chỉ cho phép tổ đặc biệt: Sàng lọc & Phân loại (rangxay) hoặc Sấy (hoatan)
      alert("Chỉ tổ Sàng lọc & Phân loại (rang xay) hoặc Tổ Sấy (hòa tan) mới được tạo phiếu QC.");
      return;
    }

    // Kiểm tra ràng buộc: tất cả công nhân trong tổ phải đã hoàn thành
    if (!isTeamCompleted(currentTeam)) {
      const totalMembers = currentTeam.thanhVien?.length || 0;
      const completedMembers = currentTeam.thanhVien?.filter(tv => tv.hoanThanh === true).length || 0;
      alert(
        `Chưa thể tạo phiếu yêu cầu kiểm tra thành phẩm. ` +
        `Tổ "${currentTeam.tenTo}" chưa hoàn thành. ` +
        `Đã hoàn thành: ${completedMembers}/${totalMembers} công nhân. ` +
        `Vui lòng đợi tất cả công nhân xác nhận hoàn thành.`
      );
      return;
    }

    try {
      // assignments từ API /factory/manager/assignments đã được BE lọc theo tổ,
      // nên ở FE không cần lọc lại theo congViec/to nữa
      const relatedAll = Array.isArray(assignments) ? assignments : [];

      // Ưu tiên những phân công có thông tin kế hoạch đầy đủ (soLuongCanSanXuat)
      let related = relatedAll.filter(
        (a) =>
          typeof a.keHoach?.soLuongCanSanXuat === "number" &&
          a.keHoach.soLuongCanSanXuat > 0
      );

      // Nếu vì lý do nào đó không có keHoach trên phân công (tổ trưởng tự tạo tay),
      // fallback dùng toàn bộ relatedAll (khi đó sẽ dùng nhánh fallback phía dưới).
      if (!related.length) {
        related = relatedAll;
      }

      // Ưu tiên phân công mới nhất
      if (related.length > 1) {
        related = related.sort((a, b) => {
          const da = new Date(a.ngay || a.createdAt || 0).getTime();
          const db = new Date(b.ngay || b.createdAt || 0).getTime();
          return db - da;
        });
      }

      const targetAssignment = related[0];
      let keHoach = targetAssignment?.keHoach || {};

      // Nếu thiếu thông tin từ cache, thử gọi trực tiếp sang production-plan-service
      if (
        (!keHoach.soLuongCanSanXuat ||
          typeof keHoach.soLuongCanSanXuat !== "number") &&
        (keHoach.planId || targetAssignment?.keHoach?.planId)
      ) {
        try {
          const planId = keHoach.planId || targetAssignment.keHoach.planId;
          const plan = await fetchPlanById(planId);
          if (plan) {
            keHoach = {
              ...keHoach,
              maKeHoach: plan.maKeHoach || keHoach.maKeHoach,
              soLuongCanSanXuat:
                plan.soLuongCanSanXuat ?? keHoach.soLuongCanSanXuat,
              sanPham: plan.sanPham || keHoach.sanPham,
            };
          }
        } catch (e) {
        }
      }

      const maPhieuQC = `QC-${Date.now()}`;
      // Tên sản phẩm ưu tiên lấy từ kế hoạch
      const sanPhamName =
        keHoach.sanPham?.tenSanPham ||
        (currentTeam.nhomSanPham && currentTeam.nguyenLieu
          ? `${currentTeam.nhomSanPham} - ${currentTeam.nguyenLieu}`
          : currentTeam.nhomSanPham || currentTeam.tenTo || "Sản phẩm chưa xác định");

      // Số lượng thành phẩm trên phiếu QC:
      // - Kế hoạch đã tính NVL thô ≈ Số lượng cần sản xuất * 110%
      // - Ta giả lập thực tế: sau khi rang/xay có hao hụt nhưng vẫn lớn hơn nhu cầu khách
      //   -> Thành phẩm nằm trong khoảng [soLuongCanSanXuat, soLuongCanSanXuat * 1.1)
      let soLuongThanhPham = 0;
      const hasValidSoLuong = typeof keHoach.soLuongCanSanXuat === "number" && keHoach.soLuongCanSanXuat > 0;
      
      if (hasValidSoLuong) {
        const base = keHoach.soLuongCanSanXuat; // ví dụ 2400
        const max = Math.round(base * 1.1);     // ví dụ ~2640
        // Random nguyên từ base đến max-1 để luôn < NVL thô nhưng >= nhu cầu khách
        soLuongThanhPham =
          base + Math.floor(Math.random() * Math.max(1, max - base));
      } else {
        // Fallback nếu chưa có thông tin kế hoạch: chọn số tương đối
        soLuongThanhPham = Math.floor(500 + Math.random() * 500);
      }

      // Tạo object keHoach với cấu trúc đúng
      const planId = targetAssignment?.keHoach?.planId || 
                     targetAssignment?.keHoach?._id?.toString() || 
                     keHoach?.planId?.toString() || 
                     keHoach?._id?.toString() || 
                     (typeof keHoach === 'string' ? keHoach : null);
      
      if (!planId || planId === "") {
        alert("❌ Lỗi: Không tìm thấy thông tin kế hoạch. Vui lòng đảm bảo tổ đã được phân công công việc từ kế hoạch sản xuất.");
        return; // Dừng lại, không cho tạo phiếu QC nếu không có planId
      }

      // Kiểm tra ràng buộc: chỉ cho phép tạo 1 phiếu QC cho 1 kế hoạch
      const existingQcRequest = qcRequests.find((req) => {
        const reqPlanId = req.keHoach?.planId?.toString() || 
                         req.keHoach?._id?.toString() || 
                         (typeof req.keHoach === 'string' ? req.keHoach : null);
        return reqPlanId && reqPlanId === planId.toString();
      });

      if (existingQcRequest) {
        const maPhieuQC = existingQcRequest.maPhieuQC || existingQcRequest._id;
        alert(
          `Đã tồn tại phiếu yêu cầu kiểm tra thành phẩm cho kế hoạch này.\n\n` +
          `Mã phiếu: ${maPhieuQC}\n` +
          `Trạng thái: ${existingQcRequest.trangThai || "Chưa xác định"}\n\n` +
          `Mỗi kế hoạch chỉ được tạo 1 phiếu yêu cầu kiểm tra thành phẩm.`
        );
        return;
      }
      
      // Đảm bảo planId là string không rỗng
      const planIdString = planId?.toString()?.trim();
      if (!planIdString || planIdString === "") {
        alert("❌ Lỗi: Không tìm thấy thông tin kế hoạch. Vui lòng đảm bảo tổ đã được phân công công việc từ kế hoạch sản xuất.");
        return;
      }
      
      const keHoachObject = {
        planId: planIdString, // Đảm bảo planId là string không rỗng
        maKeHoach: keHoach.maKeHoach || keHoach.maKH || "",
        sanPham: keHoach.sanPham || {},
      };
      
      // Debug log để kiểm tra keHoachObject
      console.log("🔍 [handleCreateQcRequest] keHoachObject được tạo:", {
        planId: keHoachObject.planId,
        planIdType: typeof keHoachObject.planId,
        planIdLength: keHoachObject.planId?.length,
        maKeHoach: keHoachObject.maKeHoach,
        hasSanPham: !!keHoachObject.sanPham
      });
      
      // Lưu thông tin preview và mở modal xác nhận
      setQcPreview({
        maPhieuQC,
        loSanXuat: currentTeam.tenTo,
        xuong: currentTeam.xuongInfo?.tenXuong || "",
        soLuong: soLuongThanhPham,
        sanPhamName,
        keHoach: keHoachObject, // Lưu object keHoach với cấu trúc đúng
        keHoachInfo: {
          maKeHoach: keHoach.maKeHoach || keHoach.maKH || "",
          soLuongCanSanXuat: keHoach.soLuongCanSanXuat,
        },
      });
      setQcModalOpen(true);
    } catch (err) {
      alert("Không thể tạo phiếu QC: " + (err?.response?.data?.error || err.message));
    }
  };

  const handleConfirmCreateQcRequest = async () => {
    if (!qcPreview) return;
    try {
      setCreatingQc(true);
      
      // Đảm bảo keHoach có planId hợp lệ
      const keHoachToSend = qcPreview.keHoach;
      if (!keHoachToSend) {
        alert("❌ Lỗi: Không tìm thấy thông tin kế hoạch. Vui lòng thử lại.");
        setCreatingQc(false);
        return;
      }
      
      // Đảm bảo planId tồn tại và không rỗng
      const planIdToSend = keHoachToSend.planId?.toString()?.trim();
      if (!planIdToSend || planIdToSend === "") {
        alert("❌ Lỗi: Không tìm thấy ID kế hoạch. Vui lòng đảm bảo tổ đã được phân công công việc từ kế hoạch sản xuất.");
        setCreatingQc(false);
        return;
      }
      
      // Tạo lại keHoach object để đảm bảo planId là string không rỗng
      const keHoachPayload = {
        planId: planIdToSend,
        maKeHoach: keHoachToSend.maKeHoach || "",
        sanPham: keHoachToSend.sanPham || {},
      };
      
      const payload = {
        maPhieuQC: qcPreview.maPhieuQC,
        loSanXuat: qcPreview.loSanXuat,
        xuong: qcPreview.xuong,
        soLuong: qcPreview.soLuong,
        sanPhamName: qcPreview.sanPhamName,
        keHoach: keHoachPayload, // Đảm bảo keHoach có planId hợp lệ
      };
      
      // Debug log để kiểm tra payload
      console.log("🔍 [handleConfirmCreateQcRequest] Payload gửi lên:", {
        maPhieuQC: payload.maPhieuQC,
        keHoach: payload.keHoach,
        keHoachType: typeof payload.keHoach,
        hasPlanId: !!payload.keHoach?.planId,
        planId: payload.keHoach?.planId,
        planIdType: typeof payload.keHoach?.planId,
        hasKeHoach: !!payload.keHoach,
        keHoach: payload.keHoach,
        planId: payload.keHoach?.planId,
        planIdType: typeof payload.keHoach?.planId,
        planIdIsEmpty: payload.keHoach?.planId === "" || payload.keHoach?.planId === null || payload.keHoach?.planId === undefined
      });
      
      await createQcRequest(payload);
      
      // Reload danh sách QC requests để cập nhật trạng thái
      try {
        const refreshedQcRequests = await getAllQcRequests();
        setQcRequests(Array.isArray(refreshedQcRequests) ? refreshedQcRequests : []);
      } catch (err) {
        // Không block nếu reload QC requests thất bại
        console.warn("Không thể reload danh sách QC requests:", err);
      }
      
      setQcModalOpen(false);
      setQcPreview(null);
      alert("Đã tạo phiếu yêu cầu kiểm tra thành phẩm (chờ xưởng trưởng duyệt).");
    } catch (err) {
      alert("Không thể tạo phiếu QC: " + (err?.response?.data?.error || err.message));
    } finally {
      setCreatingQc(false);
    }
  };

  // Kiểm tra xem tổ có hoàn thành không (tất cả thành viên đều hoàn thành)
  const isTeamCompleted = (team) => {
    if (!team.thanhVien || !Array.isArray(team.thanhVien) || team.thanhVien.length === 0) {
      return false;
    }
    return team.thanhVien.every((tv) => tv.hoanThanh === true);
  };

  // Kiểm tra xem đã có QC request cho kế hoạch của tổ hiện tại chưa
  const hasExistingQcRequestForPlan = useMemo(() => {
    if (!currentTeam || !assignments || assignments.length === 0 || !qcRequests || qcRequests.length === 0) {
      return false;
    }

    // Lấy planId từ assignment của tổ hiện tại
    const teamAssignment = assignments.find((a) => {
      const toId = a.congViec?.to?.id?.toString() || a.congViec?.to?.toString();
      const teamId = (currentTeam._id || currentTeam.id)?.toString();
      return toId === teamId;
    });

    if (!teamAssignment || !teamAssignment.keHoach) {
      return false;
    }

    const planId = teamAssignment.keHoach?.planId?.toString() || 
                   teamAssignment.keHoach?._id?.toString() || 
                   (typeof teamAssignment.keHoach === 'string' ? teamAssignment.keHoach : null);

    if (!planId) {
      return false;
    }

    // Kiểm tra xem đã có QC request nào với cùng planId chưa
    return qcRequests.some((req) => {
      const reqPlanId = req.keHoach?.planId?.toString() || 
                       req.keHoach?._id?.toString() || 
                       (typeof req.keHoach === 'string' ? req.keHoach : null);
      return reqPlanId && reqPlanId === planId;
    });
  }, [currentTeam, assignments, qcRequests]);

  // Lấy thứ tự của tổ trong quy trình sản xuất
  const getTeamOrder = (teamName, nhomSanPham) => {
    if (!teamName) return -1;
    const lower = teamName.toLowerCase();
    
    // Quy trình cho rangxay
    const stepOrderRangXay = [
      "chuẩn bị & phối trộn",
      "rang",
      "ủ nghỉ",
      "xay",
      "sàng lọc & phân loại",
      "đóng gói",
      "dán nhãn",
    ];
    
    // Quy trình cho hoatan
    const stepOrderHoaTan = [
      "chuẩn bị & phối trộn",
      "hòa tan",
      "sấy",
      "đóng hộp",
      "dán nhãn",
    ];
    
    const stepOrder = nhomSanPham === "hoatan" ? stepOrderHoaTan : stepOrderRangXay;
    return stepOrder.findIndex((step) => lower.includes(step));
  };

  // Kiểm tra xem tổ trước đã hoàn thành chưa
  const canConfirmCompletion = (currentTeam) => {
    if (!currentTeam) return false;
    
    const nhomSanPham = currentTeam.nhomSanPham || "";
    const currentOrder = getTeamOrder(currentTeam.tenTo, nhomSanPham);
    
    // Tổ đầu tiên (Chuẩn bị & Phối trộn) luôn được phép
    if (currentOrder === 0) return true;
    
    // Nếu không xác định được thứ tự, cho phép (fallback)
    if (currentOrder === -1) return true;
    
    // Tìm tổ trước đó trong cùng xưởng và cùng nhóm sản phẩm/nguyên liệu
    const previousStepOrderRangXay = [
      "chuẩn bị & phối trộn",
      "rang",
      "ủ nghỉ",
      "xay",
      "sàng lọc & phân loại",
      "đóng gói",
      "dán nhãn",
    ];
    
    const previousStepOrderHoaTan = [
      "chuẩn bị & phối trộn",
      "hòa tan",
      "sấy",
      "đóng hộp",
      "dán nhãn",
    ];
    
    const previousStepOrder = nhomSanPham === "hoatan" ? previousStepOrderHoaTan : previousStepOrderRangXay;
    
    if (currentOrder === 0) return true; // Tổ đầu tiên
    
    const previousStepName = previousStepOrder[currentOrder - 1];
    
    // Tìm tổ trước đó trong danh sách teams
    const previousTeam = teams.find((t) => {
      const name = (t.tenTo || "").toLowerCase();
      const sameXuong = 
        (t.xuongInfo?.id === currentTeam.xuongInfo?.id) ||
        (t.xuong?.toString() === currentTeam.xuong?.toString());
      const sameNhomSP = t.nhomSanPham === currentTeam.nhomSanPham;
      const sameNguyenLieu = t.nguyenLieu === currentTeam.nguyenLieu;
      
      return (
        name.includes(previousStepName) &&
        sameXuong &&
        sameNhomSP &&
        sameNguyenLieu
      );
    });
    
    // Nếu không tìm thấy tổ trước, cho phép (có thể là tổ độc lập)
    if (!previousTeam) return true;
    
    // Kiểm tra tổ trước đã hoàn thành chưa
    return isTeamCompleted(previousTeam);
  };

  const handleConfirmMemberCompletion = async (memberId) => {
    if (!currentTeam) {
      alert("Chưa xác định được tổ hiện tại.");
      return;
    }

    // Kiểm tra ràng buộc: công nhân phải có ca hiện tại
    const memberStat = statsByMemberId[memberId?.toString()];
    const hasCurrentShift = memberStat?.currentShift && memberStat.currentShift !== "—";
    
    if (!hasCurrentShift) {
      alert("Không thể xác nhận hoàn thành. Công nhân chưa có ca làm hiện tại.");
      return;
    }

    // Kiểm tra ràng buộc: xưởng phụ trách phải có kế hoạch đang thực hiện
    try {
      const allPlans = await fetchProductionPlans();
      const xuongPhuTrach = currentTeam.xuongInfo?.tenXuong || currentTeam.xuongPhuTrach || "";
      const nhomSanPham = currentTeam.nhomSanPham || "";
      const nguyenLieu = currentTeam.nguyenLieu || "";
      
      // Lọc kế hoạch theo xưởng, nhóm sản phẩm và trạng thái "Đang thực hiện"
      const activePlans = allPlans.filter(plan => {
        // Kiểm tra trạng thái "Đang thực hiện" trước
        if (plan.trangThai !== "Đang thực hiện") {
          return false;
        }
        
        const planXuong = plan.xuongPhuTrach || "";
        
        // Kiểm tra xưởng phụ trách khớp (nếu có thông tin xưởng)
        if (xuongPhuTrach && planXuong) {
          const xuongMatch = 
            planXuong.toLowerCase().includes(xuongPhuTrach.toLowerCase()) ||
            xuongPhuTrach.toLowerCase().includes(planXuong.toLowerCase());
          if (!xuongMatch) {
            return false;
          }
        }
        
        // Xác định nhóm sản phẩm từ kế hoạch
        const planTenSP = (plan.sanPham?.tenSanPham || "").toLowerCase();
        const planMaSP = (plan.sanPham?.maSP || "").toLowerCase();
        let planNhomSP = "";
        
        if (planTenSP.includes("rang xay") || planTenSP.includes("rangxay") || 
            planMaSP.includes("rangxay") || planMaSP.includes("rang xay")) {
          planNhomSP = "rangxay";
        } else if (planTenSP.includes("hòa tan") || planTenSP.includes("hoa tan") ||
                   planMaSP.includes("hoatan") || planMaSP.includes("hoa tan")) {
          planNhomSP = "hoatan";
        }
        
        // Kiểm tra nhóm sản phẩm khớp (nếu có thông tin nhóm sản phẩm)
        if (nhomSanPham && planNhomSP) {
          if (planNhomSP !== nhomSanPham) {
            return false;
          }
        }
        
        return true;
      });
      
      if (activePlans.length === 0) {
        alert(
          `Không thể xác nhận hoàn thành. ` +
          `Xưởng "${xuongPhuTrach || 'hiện tại'}" chưa có kế hoạch nào đang ở trạng thái "Đang thực hiện". ` +
          `Vui lòng đảm bảo có kế hoạch đang thực hiện trước khi xác nhận hoàn thành.`
        );
        return;
      }
    } catch (planError) {
      console.error("❌ Lỗi khi kiểm tra kế hoạch đang thực hiện:", planError);
      // Nếu lỗi khi kiểm tra, vẫn cho phép xác nhận (fallback)
      console.warn("⚠️ Không thể kiểm tra kế hoạch, cho phép xác nhận hoàn thành");
    }

    // Kiểm tra ràng buộc: tổ trước phải hoàn thành
    if (!canConfirmCompletion(currentTeam)) {
      const nhomSanPham = currentTeam.nhomSanPham || "";
      const currentOrder = getTeamOrder(currentTeam.tenTo, nhomSanPham);
      const stepOrderRangXay = [
        "Chuẩn bị & Phối trộn",
        "Rang",
        "Ủ nghỉ",
        "Xay",
        "Sàng lọc & Phân loại",
        "Đóng gói",
        "Dán nhãn",
      ];
      const stepOrderHoaTan = [
        "Chuẩn bị & Phối trộn",
        "Hòa tan",
        "Sấy",
        "Đóng hộp",
        "Dán nhãn",
      ];
      const stepOrder = nhomSanPham === "hoatan" ? stepOrderHoaTan : stepOrderRangXay;
      
      if (currentOrder > 0) {
        const previousStepName = stepOrder[currentOrder - 1];
        alert(
          `Không thể xác nhận hoàn thành. Tổ "${previousStepName}" phải hoàn thành trước.`
        );
        return;
      }
    }

    try {
      setConfirmingMember(memberId);
      await confirmMemberCompletion(currentTeam._id || currentTeam.id, memberId);
      
      // Cập nhật lại danh sách teams để hiển thị trạng thái mới
      const updatedTeams = await fetchTeams();
      setTeams(Array.isArray(updatedTeams) ? updatedTeams : []);
      
      alert("Đã xác nhận hoàn thành cho công nhân.");
    } catch (err) {
      alert("Không thể xác nhận hoàn thành: " + (err?.response?.data?.error || err.message));
    } finally {
      setConfirmingMember(null);
    }
  };

  const handleViewQcResults = async () => {
    if (!currentTeam) {
      alert("Chưa xác định được tổ hiện tại.");
      return;
    }

    try {
      setLoadingQcResults(true);
      const results = await getAllQcResults();
      setQcResults(Array.isArray(results) ? results : []);
      setQcResultsModalOpen(true);
    } catch (err) {
      alert("Không thể tải thông tin kiểm định QC: " + (err?.response?.data?.error || err.message));
    } finally {
      setLoadingQcResults(false);
    }
  };

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
          <div className="flex items-center gap-2">
            {currentTeam?.tenTo && (() => {
              const name = (currentTeam.tenTo || "").toLowerCase();
              const nhomSanPham = currentTeam.nhomSanPham || "";
              
              // Tổ đặc biệt cho rangxay: Sàng lọc & Phân loại
              const isSpecialTeamForRangXay = 
                (name.includes("sàng lọc") || name.includes("phan loai") || name.includes("phân loại")) &&
                nhomSanPham === "rangxay";
              
              // Tổ đặc biệt cho hoatan: Sấy
              const isSpecialTeamForHoaTan = 
                (name.includes("sấy") || name.includes("say")) &&
                nhomSanPham === "hoatan";
              
              if (isSpecialTeamForRangXay || isSpecialTeamForHoaTan) {
                return (
                  <button
                    type="button"
                    onClick={handleCreateQcRequest}
                    disabled={!isTeamCompleted(currentTeam) || hasExistingQcRequestForPlan}
                    className="text-xs font-semibold rounded-full bg-amber-600 text-white px-4 py-2 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      hasExistingQcRequestForPlan
                        ? "Đã tồn tại phiếu yêu cầu kiểm tra thành phẩm cho kế hoạch này. Mỗi kế hoạch chỉ được tạo 1 phiếu."
                        : !isTeamCompleted(currentTeam)
                        ? "Tất cả công nhân trong tổ phải xác nhận hoàn thành trước khi tạo phiếu yêu cầu kiểm tra thành phẩm"
                        : "Tạo phiếu yêu cầu kiểm tra thành phẩm"
                    }
                  >
                    Tạo phiếu yêu cầu kiểm tra thành phẩm
                  </button>
                );
              }
              return null;
            })()}
            {currentTeam?.tenTo && (() => {
              const name = (currentTeam.tenTo || "").toLowerCase();
              const nhomSanPham = currentTeam.nhomSanPham || "";
              
              // Tổ đặc biệt cho rangxay: Đóng gói
              const isSpecialTeamForRangXay = 
                (name.includes("đóng gói") || name.includes("dong goi")) &&
                nhomSanPham === "rangxay";
              
              // Tổ đặc biệt cho hoatan: Đóng hộp
              const isSpecialTeamForHoaTan = 
                (name.includes("đóng hộp") || name.includes("dong hop")) &&
                nhomSanPham === "hoatan";
              
              if (isSpecialTeamForRangXay || isSpecialTeamForHoaTan) {
                return (
                  <button
                    type="button"
                    onClick={handleViewQcResults}
                    className="text-xs font-semibold rounded-full bg-emerald-600 text-white px-4 py-2 hover:bg-emerald-700"
                  >
                    Thông tin kiểm định QC
                  </button>
                );
              }
              return null;
            })()}
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
                      {(() => {
                        const memberInTeam = currentTeam?.thanhVien?.find(
                          (tv) => tv.id === (member._id || member.id)?.toString()
                        );
                        const isCompleted = memberInTeam?.hoanThanh === true;
                        const canConfirm = canConfirmCompletion(currentTeam);
                        
                        // Kiểm tra công nhân có ca hiện tại không
                        const memberStat = statsByMemberId[(member._id || member.id)?.toString()];
                        const hasCurrentShift = memberStat?.currentShift && memberStat.currentShift !== "—";
                        
                        const isDisabled = !canConfirm || !hasCurrentShift || confirmingMember === (member._id || member.id);
                        
                        // Xác định thông báo tooltip
                        let tooltipMessage = "";
                        if (!hasCurrentShift) {
                          tooltipMessage = "Công nhân chưa có ca làm hiện tại. Vui lòng phân công ca làm trước.";
                        } else if (!canConfirm) {
                          tooltipMessage = "Tổ trước đó chưa hoàn thành. Vui lòng đợi tổ trước hoàn thành trước.";
                        }
                        
                        return (
                          <div className="mt-2">
                            {isCompleted ? (
                              <p className="text-green-700 font-semibold flex items-center gap-1">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                                Đã hoàn thành
                              </p>
                            ) : (
                              <div className="space-y-1">
                                <button
                                  type="button"
                                  onClick={() => handleConfirmMemberCompletion(member._id || member.id)}
                                  disabled={isDisabled}
                                  className="text-xs font-semibold rounded-full bg-amber-600 text-white px-3 py-1.5 hover:bg-amber-700 disabled:opacity-60 disabled:cursor-not-allowed w-full"
                                  title={tooltipMessage}
                                >
                                  {confirmingMember === (member._id || member.id)
                                    ? "Đang xác nhận..."
                                    : "Xác nhận hoàn thành"}
                                </button>
                                {!hasCurrentShift && (
                                  <p className="text-xs text-red-600 text-center">
                                    Chưa có ca làm
                                  </p>
                                )}
                                {hasCurrentShift && !canConfirm && (
                                  <p className="text-xs text-red-600 text-center">
                                    Tổ trước chưa hoàn thành
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal thông tin kiểm định QC */}
      {qcResultsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-amber-900">
                Thông tin kiểm định QC
              </h2>
              <button
                type="button"
                onClick={() => {
                  setQcResultsModalOpen(false);
                  setQcResults([]);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            {loadingQcResults ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              </div>
            ) : qcResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Chưa có thông tin kiểm định QC nào
              </div>
            ) : (
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-sm">
                  <thead className="bg-amber-700 text-white sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left">Mã phiếu QC</th>
                      <th className="px-4 py-3 text-left">Sản phẩm</th>
                      <th className="px-4 py-3 text-left">Ngày kiểm tra</th>
                      <th className="px-4 py-3 text-right">Số lượng đạt</th>
                      <th className="px-4 py-3 text-right">Số lượng lỗi</th>
                      <th className="px-4 py-3 text-left">Kết quả</th>
                      <th className="px-4 py-3 text-left">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {qcResults.map((result) => {
                      const qcRequest = result.qcRequest || {};
                      const sanPham = qcRequest.sanPham || {};
                      const ketQua = result.ketQuaChung === "Dat" ? "Đạt" : 
                                   result.ketQuaChung === "Khong dat" || result.ketQuaChung === "KhongDat" ? "Không đạt" : 
                                   result.ketQuaChung || "Chưa kiểm tra";
                      
                      return (
                        <tr key={result._id} className="hover:bg-amber-50">
                          <td className="px-4 py-3 font-semibold">
                            {qcRequest.maPhieuQC || "N/A"}
                          </td>
                          <td className="px-4 py-3">
                            {sanPham.tenSanPham || sanPham.ProductName || sanPham.tenSP || "N/A"}
                          </td>
                          <td className="px-4 py-3">
                            {result.ngayKiemTra
                              ? new Date(result.ngayKiemTra).toLocaleDateString("vi-VN")
                              : "N/A"}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-green-700">
                            {result.soLuongDat || 0}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-red-700">
                            {result.soLuongLoi || 0}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                ketQua === "Đạt" || ketQua === "Dat"
                                  ? "bg-green-100 text-green-700"
                                  : ketQua === "Không đạt" || ketQua === "Khong dat" || ketQua === "KhongDat"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {ketQua}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {result.ghiChu || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setQcResultsModalOpen(false);
                  setQcResults([]);
                }}
                className="px-4 py-2 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xem trước phiếu yêu cầu kiểm tra thành phẩm */}
      {qcModalOpen && qcPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-amber-900">
              Xác nhận tạo phiếu yêu cầu kiểm tra thành phẩm
            </h2>
            <div className="space-y-2 text-sm text-amber-900">
              <div className="flex justify-between">
                <span className="font-medium">Mã phiếu QC:</span>
                <span>{qcPreview.maPhieuQC}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tổ / Lô:</span>
                <span>{qcPreview.loSanXuat}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Xưởng:</span>
                <span>{qcPreview.xuong}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sản phẩm:</span>
                <span>{qcPreview.sanPhamName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Số lượng thành phẩm:</span>
                <span className="font-semibold">{qcPreview.soLuong}</span>
              </div>
              {qcPreview.keHoachInfo?.maKeHoach && (
                <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <div>
                    Kế hoạch nguồn:{" "}
                    <span className="font-semibold">
                      {qcPreview.keHoachInfo.maKeHoach}
                    </span>
                  </div>
                  {typeof qcPreview.keHoachInfo.soLuongCanSanXuat === "number" && (
                    <div>
                      Số lượng cần sản xuất trong kế hoạch:{" "}
                      <span className="font-semibold">
                        {qcPreview.keHoachInfo.soLuongCanSanXuat}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {!qcPreview.keHoachInfo?.maKeHoach && (
                <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                  Không lấy được thông tin từ phiếu kế hoạch. Số lượng thành phẩm đang
                  được giả lập ngẫu nhiên.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (creatingQc) return;
                  setQcModalOpen(false);
                  setQcPreview(null);
                }}
                className="px-4 py-2 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
                disabled={creatingQc}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmCreateQcRequest}
                className="px-4 py-2 text-sm rounded-full bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-60"
                disabled={creatingQc}
              >
                {creatingQc ? "Đang tạo phiếu..." : "Xác nhận tạo phiếu"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

