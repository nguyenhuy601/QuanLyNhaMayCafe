const AttendanceSheet = require("../models/AttendanceSheet");
const ShiftSchedule = require("../models/ShiftSchedule");
const ToSanXuat = require("../models/ToSanXuat");

const normalizeDateOnly = (value) => {
  const date = value ? new Date(value) : new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const getUserInfo = (user = {}) => ({
  id: user.id || user._id,
  hoTen: user.employee?.hoTen || user.hoTen || user.username,
});

// ================= Attendance =================
exports.listAttendanceSheets = async (req, res) => {
  try {
    const { date, from, to, caLam, teamId } = req.query;
    const filter = {};

    if (date) {
      const start = normalizeDateOnly(date);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.ngay = { $gte: start, $lt: end };
    } else if (from || to) {
      filter.ngay = {};
      if (from) filter.ngay.$gte = normalizeDateOnly(from);
      if (to) {
        const end = normalizeDateOnly(to);
        end.setDate(end.getDate() + 1);
        filter.ngay.$lt = end;
      }
    }

    if (caLam) filter.caLam = caLam;
    if (teamId) filter["toSanXuat.id"] = teamId;

    const sheets = await AttendanceSheet.find(filter).sort({ ngay: -1, caLam: 1 });
    res.status(200).json(sheets);
  } catch (err) {
    res.status(500).json({ message: "Không thể lấy danh sách chấm công", error: err.message });
  }
};

exports.saveAttendanceSheet = async (req, res) => {
  try {
    const { ngay, caLam = "ca_sang", toSanXuat, entries = [], trangThaiBang, ghiChuChung } = req.body;

    if (!ngay) return res.status(400).json({ message: "Thiếu ngày chấm công" });

    const normalizedDate = normalizeDateOnly(ngay);
    const teamInfo = toSanXuat || {
      id: req.body.teamId || req.user?.teamId || "default",
      tenTo: req.body.teamName || req.user?.teamName || "Tổ sản xuất",
    };

    const filter = {
      ngay: normalizedDate,
      caLam,
      "toSanXuat.id": teamInfo.id || "default",
    };

    let sheet = await AttendanceSheet.findOne(filter);
    let isNewSheet = false;

    if (sheet) {
      if (entries.length) sheet.entries = entries;
      sheet.toSanXuat = teamInfo;
      sheet.caLam = caLam;
      sheet.trangThaiBang = trangThaiBang || sheet.trangThaiBang;
      sheet.ghiChuChung = ghiChuChung ?? sheet.ghiChuChung;
      sheet.nguoiTao = sheet.nguoiTao || getUserInfo(req.user);
    } else {
      isNewSheet = true;
      sheet = new AttendanceSheet({
        ngay: normalizedDate,
        caLam,
        toSanXuat: teamInfo,
        entries,
        trangThaiBang: trangThaiBang || "draft",
        ghiChuChung,
        nguoiTao: getUserInfo(req.user),
      });
    }

    await sheet.save();
    res.status(isNewSheet ? 201 : 200).json(sheet);
  } catch (err) {
    res.status(500).json({ message: "Không thể lưu bảng chấm công", error: err.message });
  }
};

exports.addAttendanceEntry = async (req, res) => {
  try {
    const sheet = await AttendanceSheet.findById(req.params.id);
    if (!sheet) return res.status(404).json({ message: "Không tìm thấy bảng chấm công" });

    const entry = {
      workerId: req.body.workerId,
      maCongNhan: req.body.maCongNhan,
      hoTen: req.body.hoTen,
      caLam: req.body.caLam || sheet.caLam,
      trangThai: req.body.trangThai || "co_mat",
      ghiChu: req.body.ghiChu,
      isOvertime: req.body.isOvertime || false,
    };

    if (!entry.maCongNhan) {
      return res.status(400).json({ message: "Thiếu mã công nhân" });
    }

    sheet.entries.push(entry);
    await sheet.save();
    res.status(201).json(sheet);
  } catch (err) {
    res.status(500).json({ message: "Không thể thêm công nhân", error: err.message });
  }
};

exports.updateAttendanceEntry = async (req, res) => {
  try {
    const sheet = await AttendanceSheet.findById(req.params.id);
    if (!sheet) return res.status(404).json({ message: "Không tìm thấy bảng chấm công" });

    const entry = sheet.entries.id(req.params.entryId);
    if (!entry) return res.status(404).json({ message: "Không tìm thấy bản ghi công nhân" });

    const { trangThai, ghiChu, hoTen, isOvertime } = req.body;
    if (trangThai) entry.trangThai = trangThai;
    if (ghiChu !== undefined) entry.ghiChu = ghiChu;
    if (hoTen) entry.hoTen = hoTen;
    if (isOvertime !== undefined) entry.isOvertime = isOvertime;
    entry.updatedAt = new Date();

    await sheet.save();
    res.status(200).json(sheet);
  } catch (err) {
    res.status(500).json({ message: "Không thể cập nhật trạng thái", error: err.message });
  }
};

exports.removeAttendanceEntry = async (req, res) => {
  try {
    const sheet = await AttendanceSheet.findById(req.params.id);
    if (!sheet) return res.status(404).json({ message: "Không tìm thấy bảng chấm công" });

    const entry = sheet.entries.id(req.params.entryId);
    if (!entry) return res.status(404).json({ message: "Không tìm thấy bản ghi công nhân" });

    entry.remove();
    await sheet.save();
    res.status(200).json(sheet);
  } catch (err) {
    res.status(500).json({ message: "Không thể xóa công nhân", error: err.message });
  }
};

exports.updateAttendanceStatus = async (req, res) => {
  try {
    const sheet = await AttendanceSheet.findById(req.params.id);
    if (!sheet) return res.status(404).json({ message: "Không tìm thấy bảng chấm công" });

    sheet.trangThaiBang = req.body.trangThaiBang || "saved";
    sheet.ghiChuChung = req.body.ghiChuChung ?? sheet.ghiChuChung;
    await sheet.save();
    res.status(200).json(sheet);
  } catch (err) {
    res.status(500).json({ message: "Không thể cập nhật trạng thái bảng", error: err.message });
  }
};

// ================= Shift schedule =================
exports.listShiftSchedules = async (req, res) => {
  try {
    const { date, caLam, teamId } = req.query;
    const filter = {};
    if (date) {
      const start = normalizeDateOnly(date);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      filter.ngay = { $gte: start, $lt: end };
    }
    if (caLam) filter.caLam = caLam;
    if (teamId) filter["toSanXuat.id"] = teamId;

    const schedules = await ShiftSchedule.find(filter).sort({ ngay: -1, caLam: 1 });
    res.status(200).json(schedules);
  } catch (err) {
    res.status(500).json({ message: "Không thể lấy danh sách phân ca", error: err.message });
  }
};

exports.saveShiftSchedule = async (req, res) => {
  try {
    const { ngay, caLam, toSanXuat, members = [], trangThai, ghiChu } = req.body;
    if (!ngay || !caLam) {
      return res.status(400).json({ message: "Thiếu thông tin ngày hoặc ca làm" });
    }

    const normalizedDate = normalizeDateOnly(ngay);
    const teamInfo = toSanXuat || {
      id: req.body.teamId || req.user?.teamId || "default",
      tenTo: req.body.teamName || req.user?.teamName || "Tổ sản xuất",
    };

    const filter = {
      ngay: normalizedDate,
      caLam,
      "toSanXuat.id": teamInfo.id || "default",
    };

    let schedule = await ShiftSchedule.findOne(filter);
    let isNew = false;

    if (schedule) {
      if (members.length) schedule.members = members;
      schedule.trangThai = trangThai || schedule.trangThai;
      schedule.ghiChu = ghiChu ?? schedule.ghiChu;
      schedule.toSanXuat = teamInfo;
    } else {
      isNew = true;
      schedule = new ShiftSchedule({
        ngay: normalizedDate,
        caLam,
        toSanXuat: teamInfo,
        members,
        trangThai: trangThai || "draft",
        ghiChu,
        nguoiLap: getUserInfo(req.user),
      });
    }

    await schedule.save();
    res.status(isNew ? 201 : 200).json(schedule);
  } catch (err) {
    res.status(500).json({ message: "Không thể lưu phân ca", error: err.message });
  }
};

exports.addShiftMember = async (req, res) => {
  try {
    const schedule = await ShiftSchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: "Không tìm thấy phân ca" });

    if (!req.body.maCongNhan) {
      return res.status(400).json({ message: "Thiếu mã công nhân" });
    }

    const member = {
      workerId: req.body.workerId,
      maCongNhan: req.body.maCongNhan,
      hoTen: req.body.hoTen,
      nhiemVu: req.body.nhiemVu,
      trangThai: req.body.trangThai || "scheduled",
      ghiChu: req.body.ghiChu,
      isOvertime: req.body.isOvertime || false,
    };

    schedule.members.push(member);
    await schedule.save();

    // Đồng bộ: nếu có thông tin tổ sản xuất, auto thêm công nhân vào ToSanXuat.thanhVien
    if (schedule.toSanXuat && schedule.toSanXuat.id) {
      try {
        const to = await ToSanXuat.findById(schedule.toSanXuat.id);
        if (to) {
          const exists = to.thanhVien.some(
            (tv) => tv.id && tv.id.toString() === String(member.workerId)
          );
          if (!exists) {
            to.thanhVien.push({
              id: member.workerId,
              hoTen: member.hoTen,
              email: req.body.email || "",
              maNV: member.maCongNhan,
              role: "worker",
            });
            await to.save();
          }
        }
      } catch (syncErr) {
        console.warn(
          "⚠️ [teamleader] Không thể đồng bộ thanhVien cho tổ trong addShiftMember:",
          syncErr.message
        );
      }
    }

    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ message: "Không thể thêm phân công", error: err.message });
  }
};

exports.updateShiftMember = async (req, res) => {
  try {
    const schedule = await ShiftSchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: "Không tìm thấy phân ca" });

    const member = schedule.members.id(req.params.memberId);
    if (!member) return res.status(404).json({ message: "Không tìm thấy công nhân trong ca" });

    const { trangThai, nhiemVu, ghiChu, hoTen } = req.body;
    if (trangThai) member.trangThai = trangThai;
    if (nhiemVu) member.nhiemVu = nhiemVu;
    if (ghiChu !== undefined) member.ghiChu = ghiChu;
    if (hoTen) member.hoTen = hoTen;

    await schedule.save();
    res.status(200).json(schedule);
  } catch (err) {
    res.status(500).json({ message: "Không thể cập nhật phân công", error: err.message });
  }
};

exports.removeShiftMember = async (req, res) => {
  try {
    const schedule = await ShiftSchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: "Không tìm thấy phân ca" });

    const member = schedule.members.id(req.params.memberId);
    if (!member) return res.status(404).json({ message: "Không tìm thấy công nhân trong ca" });

    member.remove();
    await schedule.save();
    res.status(200).json(schedule);
  } catch (err) {
    res.status(500).json({ message: "Không thể xóa công nhân khỏi ca", error: err.message });
  }
};

// Xóa hẳn một lịch phân ca (theo id)
exports.deleteShiftSchedule = async (req, res) => {
  try {
    const deleted = await ShiftSchedule.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy phân ca" });
    }
    res.status(200).json({ message: "Đã xóa lịch phân ca", schedule: deleted });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Không thể xóa lịch phân ca", error: err.message });
  }
};

