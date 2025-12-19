import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCircle2, ClipboardList, Award, X, CheckCircle2, Package } from "lucide-react";
import { 
  fetchTeams, 
  assignTeamLeader, 
  assignTeamMember, 
  removeTeamMember,
  fetchManagerAssignments,
} from "../../../services/factoryService";
import { getAllUsers, getAllRoles } from "../../../api/adminAPI";
import { getAllQcResults } from "../../../services/qcService";
import PhieuNhapThanhPham from "../../warehouseProduct/components/PhieuNhapThanhPham";

export default function FactoryTeams() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assigningTeam, setAssigningTeam] = useState(null);
  const [selectedLeaderId, setSelectedLeaderId] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [assigningMemberTeam, setAssigningMemberTeam] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [memberAssignLoading, setMemberAssignLoading] = useState(false);
  const [memberAssignError, setMemberAssignError] = useState("");
  const [creatingReceipt, setCreatingReceipt] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedQcResult, setSelectedQcResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [teamRes, usersRes, rolesRes] = await Promise.all([
          fetchTeams(),
          getAllUsers(),
          getAllRoles(),
        ]);
        setTeams(Array.isArray(teamRes) ? teamRes : []);
        setUsers(Array.isArray(usersRes) ? usersRes : []);
        setRoles(Array.isArray(rolesRes) ? rolesRes : []);
      } catch (err) {
        setError("Không thể tải danh sách tổ. Kiểm tra quyền/đăng nhập.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const roleIdBySlug = React.useMemo(() => {
    const map = {};
    roles.forEach((r) => {
      const key = (r.tenRole || r.maRole || "").toLowerCase();
      if (key) {
        map[key] = r._id;
      }
    });
    return map;
  }, [roles]);

  const isTeamLeaderUser = (user) => {
    if (!user) return false;
    const field = user.roles || user.role || [];
    const roleIds = Array.isArray(field) ? field : [field];

    const totruongId = roleIdBySlug["totruong"];
    if (totruongId) {
      return roleIds.some((id) => String(id) === String(totruongId));
    }

    // Fallback: nếu không tìm được roleId theo slug, cho phép tất cả (để tránh lọc trống)
    return true;
  };

  const isWorkerUser = (user) => {
    if (!user) return false;
    const field = user.roles || user.role || [];
    const roleIds = Array.isArray(field) ? field : [field];

    const workerId = roleIdBySlug["worker"];
    if (workerId) {
      return roleIds.some((id) => String(id) === String(workerId));
    }

    return false;
  };

  const normalizeTasks = (team) => {
    const tasks = [];
    if (team.mota) tasks.push(team.mota);
    if (team.nhomSanPham) tasks.push(`Nhóm SP: ${team.nhomSanPham}`);
    if (team.nguyenLieu) tasks.push(`Nguyên liệu: ${team.nguyenLieu}`);
    if (team.xuongInfo?.tenXuong) tasks.push(`Xưởng: ${team.xuongInfo.tenXuong}`);
    return tasks.length ? tasks : ["Chưa có mô tả"];
  };

  // Loại bỏ các tổ trùng nhau (trùng theo: xưởng + nhóm SP + nguyên liệu + tên tổ)
  const uniqueTeams = React.useMemo(() => {
    const seen = new Set();
    const result = [];
    teams.forEach((t) => {
      const key = [
        t.xuongInfo?.tenXuong || "",
        t.nhomSanPham || "",
        t.nguyenLieu || "",
        t.tenTo || "",
      ]
        .join("|")
        .toLowerCase();

      if (!seen.has(key)) {
        seen.add(key);
        result.push(t);
      }
    });
    return result;
  }, [teams]);

  // Kiểm tra xem tổ có hoàn thành không (tất cả thành viên đều hoàn thành)
  const isTeamCompleted = (team) => {
    if (!team.thanhVien || !Array.isArray(team.thanhVien) || team.thanhVien.length === 0) {
      return false;
    }
    return team.thanhVien.every((tv) => tv.hoanThanh === true);
  };

  const displayTeams = uniqueTeams.map((t, idx) => {
    const leaderName = t.toTruong?.[0]?.hoTen || t.toTruong?.[0]?.email || t.toTruong?.[0]?.maNV || "Chưa gán tổ trưởng";
    const membersCount = Array.isArray(t.thanhVien) ? t.thanhVien.length : 0;
    const completed = isTeamCompleted(t);
    return {
      id: t.maTo || t._id || `T${idx + 1}`,
      rawId: t._id,
      leaderId: t.toTruong?.[0]?.id || "",
      name: t.tenTo || "Không tên",
      leader: leaderName,
      members: membersCount,
      performance: t.hieuSuat ? `${t.hieuSuat}%` : "—",
      completed: completed,
      tasks: normalizeTasks(t),
      teamData: t, // Lưu toàn bộ dữ liệu team để dùng sau
    };
  });

  // Sắp xếp tổ theo chuẩn quy trình sản xuất cà phê
  const orderedTeams = React.useMemo(() => {
    const stepOrder = [
      "chuẩn bị & phối trộn",
      "rang",
      "ủ nghỉ",
      "xay",
      "sàng lọc & phân loại",
      "đóng gói",
      "dán nhãn",
    ];

    const getIndex = (name) => {
      if (!name) return Number.MAX_SAFE_INTEGER;
      const lower = name.toLowerCase();
      const idx = stepOrder.findIndex((k) => lower.includes(k));
      return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
    };

    const clone = [...displayTeams];
    clone.sort((a, b) => {
      const ia = getIndex(a.name);
      const ib = getIndex(b.name);
      if (ia !== ib) return ia - ib;
      return a.name.localeCompare(b.name);
    });
    return clone;
  }, [displayTeams]);

  // Kiểm tra xem tất cả các tổ đã hoàn thành chưa (trong cùng xưởng, nhóm SP, nguyên liệu)
  const allTeamsCompleted = React.useMemo(() => {
    if (orderedTeams.length === 0) return false;
    
    // Lọc các tổ theo cùng xưởng, nhóm SP, nguyên liệu (lấy từ tổ đầu tiên)
    const firstTeam = orderedTeams[0];
    if (!firstTeam.teamData) return false;
    
    const sameGroupTeams = orderedTeams.filter((t) => {
      const teamData = t.teamData;
      return (
        (teamData.xuongInfo?.id === firstTeam.teamData.xuongInfo?.id ||
          teamData.xuong?.toString() === firstTeam.teamData.xuong?.toString()) &&
        teamData.nhomSanPham === firstTeam.teamData.nhomSanPham &&
        teamData.nguyenLieu === firstTeam.teamData.nguyenLieu
      );
    });
    
    // Kiểm tra tất cả tổ trong cùng nhóm đã hoàn thành
    return sameGroupTeams.length > 0 && sameGroupTeams.every((t) => t.completed === true);
  }, [orderedTeams]);

  const handleCreateFinishedReceipt = async () => {
    try {
      setCreatingReceipt(true);
      
      // Lấy danh sách QC results đã đạt
      const qcResults = await getAllQcResults();
      
      const passedQcResults = Array.isArray(qcResults) 
        ? qcResults.filter(qc => qc.ketQuaChung === "Dat" || qc.ketQuaChung === "Dat")
        : [];
      
      if (passedQcResults.length === 0) {
        alert("Không có phiếu QC nào đạt để tạo đơn nhập thành phẩm.");
        return;
      }
      
      // Lấy phiếu QC mới nhất đã đạt
      const latestQcResult = passedQcResults.sort((a, b) => {
        const dateA = new Date(a.ngayKiemTra || 0);
        const dateB = new Date(b.ngayKiemTra || 0);
        return dateB - dateA;
      })[0];
      
      setSelectedQcResult(latestQcResult);
      setReceiptModalOpen(true);
    } catch (err) {
      alert("Không thể lấy thông tin phiếu QC: " + (err?.response?.data?.error || err.message));
    } finally {
      setCreatingReceipt(false);
    }
  };

  const handleOpenAssignModal = (team) => {
    setAssignError("");
    setAssigningTeam(team);
    setSelectedLeaderId(team.leaderId || "");
    setAssignModalOpen(true);
  };

  const handleCloseAssignModal = () => {
    setAssignModalOpen(false);
    setAssigningTeam(null);
    setSelectedLeaderId("");
    setAssignError("");
  };

  const handleAssignLeader = async () => {
    if (!assigningTeam || !selectedLeaderId) {
      setAssignError("Vui lòng chọn tổ trưởng.");
      return;
    }

    const user = users.find((u) => u._id === selectedLeaderId);
    if (!user) {
      setAssignError("Không tìm thấy thông tin nhân sự đã chọn.");
      return;
    }

    try {
      setAssignLoading(true);
      setAssignError("");

      const payload = {
        id: user._id,
        hoTen: user.hoTen || user.name || "",
        email: user.email || "",
        maNV: user.maNV || "",
        role: "totruong",
      };

      const res = await assignTeamLeader(assigningTeam.rawId || assigningTeam.id, payload);

      if (res?.to) {
        setTeams((prev) =>
          prev.map((t) => (t._id === res.to._id ? res.to : t))
        );
      }

      handleCloseAssignModal();
    } catch (err) {
      setAssignError("Không thể gán tổ trưởng. Vui lòng thử lại.");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleOpenMemberModal = (team) => {
    setMemberAssignError("");
    setAssigningMemberTeam(team);
    setSelectedMemberId("");
    setMemberModalOpen(true);
  };

  const handleCloseMemberModal = () => {
    setMemberModalOpen(false);
    setAssigningMemberTeam(null);
    setSelectedMemberId("");
    setMemberAssignError("");
  };

  const handleAssignMember = async () => {
    if (!assigningMemberTeam || !selectedMemberId) {
      setMemberAssignError("Vui lòng chọn công nhân.");
      return;
    }

    const user = users.find((u) => u._id === selectedMemberId);
    if (!user) {
      setMemberAssignError("Không tìm thấy thông tin công nhân đã chọn.");
      return;
    }

    try {
      setMemberAssignLoading(true);
      setMemberAssignError("");

      const payload = {
        id: user._id,
        hoTen: user.hoTen || user.name || "",
        email: user.email || "",
        maNV: user.maNV || "",
        role: "worker",
      };

      const res = await assignTeamMember(
        assigningMemberTeam.rawId || assigningMemberTeam.id,
        payload
      );

      if (res?.to) {
        setTeams((prev) =>
          prev.map((t) => (t._id === res.to._id ? res.to : t))
        );
      }

      handleCloseMemberModal();
    } catch (err) {
      setMemberAssignError("Không thể gán công nhân. Vui lòng thử lại.");
    } finally {
      setMemberAssignLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-amber-800">Đang tải danh sách tổ...</div>;
  if (error) return <div className="p-4 text-red-700">{error}</div>;

  // Kiểm tra xem một công nhân đã thuộc tổ nào chưa
  const userHasAnyTeam = (user) => {
    if (!user) return false;
    const id = user._id?.toString();
    const email = user.email?.toLowerCase();
    const maNV = user.maNV;

    return teams.some(
      (t) =>
        Array.isArray(t.thanhVien) &&
        t.thanhVien.some((tv) => {
          const tvId = tv.id?.toString() || tv._id?.toString();
          const tvEmail = tv.email?.toLowerCase();
          const tvMaNV = tv.maNV;
          return (
            (id && tvId && tvId === id) ||
            (email && tvEmail && tvEmail === email) ||
            (maNV && tvMaNV && tvMaNV === maNV)
          );
        })
    );
  };

  return (
    <div className="space-y-6 text-amber-900">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
          <Users size={24} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
            Teams
          </p>
          <h1 className="text-3xl font-bold text-amber-900">
            Thông tin các tổ sản xuất
          </h1>
        </div>
        {allTeamsCompleted && (
          <button
            type="button"
            onClick={handleCreateFinishedReceipt}
            className="ml-auto inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition"
          >
            <Package size={18} />
            Tạo đơn nhập thành phẩm
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {orderedTeams.map((team) => (
          <div
            key={team.id}
            className="bg-white border border-amber-100 rounded-3xl shadow p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-amber-400">
                  {team.id}
                </p>
                <h2 className="text-xl font-semibold text-amber-900">
                  {team.name}
                </h2>
              </div>
              <Award className="text-amber-500" size={28} />
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3">
              <UserCircle2 size={32} className="text-amber-600" />
              <div className="flex-1">
                <p className="text-xs text-amber-500">Tổ trưởng phụ trách</p>
                <p className="font-semibold">{team.leader}</p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenAssignModal(team)}
                className="text-xs font-semibold text-amber-700 border border-amber-300 rounded-full px-3 py-1 hover:bg-amber-50 transition"
              >
                Gán tổ trưởng
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-2xl bg-gray-50 px-3 py-2">
                <p className="text-xs text-gray-500">Thành viên</p>
                <p className="font-semibold text-gray-800">
                  {typeof team.members === "number" ? team.members : "—"}
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 px-3 py-2">
                <p className="text-xs text-gray-500">Hiệu suất</p>
                <p className="font-semibold text-amber-700">{team.performance}</p>
              </div>
              <div className="col-span-2 rounded-2xl bg-white border border-amber-100 px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Trạng thái</span>
                  {team.completed ? (
                    <div className="flex items-center gap-1 text-green-700 font-semibold">
                      <CheckCircle2 size={16} />
                      <span>Hoàn thành</span>
                    </div>
                  ) : (
                    <span className="text-xs text-amber-700 font-semibold">Đang thực hiện</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 mb-2">
                <ClipboardList size={16} />
                Nhiệm vụ chính
              </div>
              <ul className="space-y-1 text-sm text-amber-900">
                {team.tasks.map((task) => (
                  <li key={task} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleOpenMemberModal(team)}
                className="text-xs font-semibold text-amber-700 border border-amber-300 rounded-full px-3 py-1 hover:bg-amber-50 transition"
              >
                Thêm thành viên
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-amber-700 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Tổ</th>
              <th className="px-4 py-3 text-left font-semibold">Tổ trưởng</th>
              <th className="px-4 py-3 text-left font-semibold">Thành viên</th>
              <th className="px-4 py-3 text-left font-semibold">Hiệu suất</th>
              <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-50 bg-white">
            {orderedTeams.map((team) => (
              <tr key={team.id} className="hover:bg-amber-50/60">
                <td className="px-4 py-3 font-semibold">{team.name}</td>
                <td className="px-4 py-3">{team.leader}</td>
                <td className="px-4 py-3">
                  {typeof team.members === "number" ? `${team.members} người` : "—"}
                </td>
                <td className="px-4 py-3 text-amber-700 font-semibold">
                  {team.performance}
                </td>
                <td className="px-4 py-3">
                  {team.completed ? (
                    <div className="flex items-center gap-1 text-green-700 font-semibold">
                      <CheckCircle2 size={16} />
                      <span>Hoàn thành</span>
                    </div>
                  ) : (
                    <span className="text-sm text-amber-700 font-semibold">Đang thực hiện</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-amber-900">
              Gán tổ trưởng cho {assigningTeam?.name}
            </h2>
            <div className="space-y-2">
              <label className="block text-sm text-gray-700 mb-1">
                Chọn nhân sự làm tổ trưởng
              </label>
              <select
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={selectedLeaderId}
                onChange={(e) => setSelectedLeaderId(e.target.value)}
              >
                <option value="">-- Chọn tổ trưởng --</option>
                {users
                  .filter(isTeamLeaderUser)
                  .map((u) => (
                    <option key={u._id} value={u._id}>
                      {(u.hoTen || u.name || u.email || "Không tên") +
                        (u.maNV ? ` (${u.maNV})` : "")}
                    </option>
                  ))}
              </select>
              {assignError && (
                <p className="text-xs text-red-600 mt-1">{assignError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseAssignModal}
                className="px-4 py-2 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
                disabled={assignLoading}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAssignLeader}
                className="px-4 py-2 text-sm rounded-full bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-60"
                disabled={assignLoading}
              >
                {assignLoading ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {memberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-amber-900">
              Quản lý thành viên · {assigningMemberTeam?.name}
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Cột trái: thêm thành viên */}
              <div className="space-y-2">
                <label className="block text-sm text-gray-700 mb-1">
                  Thêm công nhân vào tổ
                </label>
                <select
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                >
                  <option value="">-- Chọn công nhân --</option>
                  {users
                    // Chỉ hiển thị công nhân có role worker và CHƯA thuộc tổ nào
                    .filter((u) => isWorkerUser(u) && !userHasAnyTeam(u))
                    .map((u) => (
                      <option key={u._id} value={u._id}>
                        {(u.hoTen || u.name || u.email || "Không tên") +
                          (u.maNV ? ` (${u.maNV})` : "")}
                      </option>
                    ))}
                </select>
                {memberAssignError && (
                  <p className="text-xs text-red-600 mt-1">
                    {memberAssignError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleAssignMember}
                  disabled={memberAssignLoading || !selectedMemberId}
                  className="mt-2 inline-flex items-center justify-center rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                >
                  {memberAssignLoading ? "Đang thêm..." : "Thêm vào tổ"}
                </button>
              </div>

              {/* Cột phải: danh sách thành viên hiện tại */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-amber-900">
                  Thành viên hiện tại
                </p>
                <div className="max-h-64 overflow-auto border border-amber-100 rounded-xl p-2 bg-amber-50/40">
                  {(
                    teams.find(
                      (t) =>
                        t._id === (assigningMemberTeam?.rawId || assigningMemberTeam?.id)
                    )?.thanhVien || []
                  ).length === 0 ? (
                    <p className="text-xs text-gray-500">
                      Chưa có thành viên nào trong tổ này.
                    </p>
                  ) : (
                    <ul className="space-y-1 text-sm">
                      {(
                        teams.find(
                          (t) =>
                            t._id ===
                            (assigningMemberTeam?.rawId || assigningMemberTeam?.id)
                        )?.thanhVien || []
                      ).map((m) => (
                        <li
                          key={m.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-1.5"
                        >
                          <div>
                            <p className="font-medium">
                              {m.hoTen || m.email || "Không tên"}
                            </p>
                            {m.maNV && (
                              <p className="text-xs text-amber-700">
                                Mã NV: {m.maNV}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                await removeTeamMember(
                                  assigningMemberTeam.rawId ||
                                    assigningMemberTeam.id,
                                  m.id
                                );
                                setTeams((prev) =>
                                  prev.map((t) =>
                                    t._id ===
                                    (assigningMemberTeam.rawId ||
                                      assigningMemberTeam.id)
                                      ? {
                                          ...t,
                                          thanhVien: (t.thanhVien || []).filter(
                                            (tv) => tv.id !== m.id
                                          ),
                                        }
                                      : t
                                  )
                                );
                              } catch (err) {
                              }
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-red-200 px-2 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                          >
                            <X size={12} />
                            Xóa khỏi tổ
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseMemberModal}
                className="px-4 py-2 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
                disabled={memberAssignLoading}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal tạo phiếu nhập thành phẩm */}
      {receiptModalOpen && selectedQcResult && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="relative w-[700px] max-h-[90vh] overflow-y-auto">
            <PhieuNhapThanhPham 
              selectedQC={selectedQcResult} 
              onClose={() => {
                setReceiptModalOpen(false);
                setSelectedQcResult(null);
              }} 
            />
            <button
              onClick={() => {
                setReceiptModalOpen(false);
                setSelectedQcResult(null);
              }}
              className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 z-10"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

