const WorkAssignment = require("../models/WorkAssignment");
const ProductionLog = require("../models/ProductionLog");
const ToSanXuat = require("../models/ToSanXuat");

/** Lấy danh sách phân công - Xưởng trưởng chỉ xem kế hoạch có sản phẩm phụ trách */
exports.getAssignments = async (req, res) => {
  try {
    let filter = {};
    
    // Nếu là xưởng trưởng, chỉ hiển thị kế hoạch có sản phẩm trong danh sách phụ trách
    if (req.user?.role === "xuongtruong" && req.user?.sanPhamPhuTrach?.length > 0) {
      const productIds = req.user.sanPhamPhuTrach.map(sp => sp.productId).filter(Boolean);
      
      if (productIds.length > 0) {
        filter["keHoach.sanPham.productId"] = { $in: productIds };
      } else {
        // Nếu không có productId nào hợp lệ, trả về mảng rỗng
        return res.status(200).json([]);
      }
    }
    
    const list = await WorkAssignment.find(filter).sort({ createdAt: -1 });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tổ trưởng chỉ xem phân công của tổ mình */
exports.getAssignmentsByTeam = async (req, res) => {
  try {
    // Xác định tổ mà tổ trưởng phụ trách dựa trên thông tin tài khoản
    const leaderId = req.user?.id?.toString() || req.user?._id?.toString();
    const leaderEmail = req.user?.email?.toLowerCase();

    if (!leaderId && !leaderEmail) {
      return res.status(403).json({
        message: "Không xác định được tổ của bạn. Vui lòng liên hệ quản trị viên.",
      });
    }

    // Tìm các tổ có toTruong trùng id hoặc email
    const teamFilter = {
      toTruong: {
        $elemMatch: {
          $or: [
            leaderId ? { id: leaderId } : null,
            leaderEmail ? { email: leaderEmail } : null,
          ].filter(Boolean),
        },
      },
    };

    const teams = await ToSanXuat.find(teamFilter).select("_id maTo tenTo");
    if (!teams.length) {
      return res.status(200).json([]);
    }

    const teamIds = teams.map((t) => t._id.toString());

    // Tìm các phân công có tổ thuộc danh sách trên
    const list = await WorkAssignment.find({
      "congViec.to.id": { $in: teamIds },
    }).sort({ createdAt: -1 });
    
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Xưởng trưởng tạo phân công cho tổ */
exports.createAssignment = async (req, res) => {
  try {
    const payload = { ...req.body };
    payload.ngay = req.body.ngay || req.body.ngayPhanCong || new Date();
    payload.trangThai = req.body.trangThai || "Dang thuc hien";

    if (!payload.nguoiLap && req.user) {
      payload.nguoiLap = {
        id: req.user.id || req.user._id,
        hoTen: req.user.employee?.hoTen || req.user.hoTen || req.user.username,
        position: req.user.role || req.user.position,
      };
    }

    const assignment = await WorkAssignment.create(payload);
    res.status(201).json({ message: "Phân công thành công", assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Tổ trưởng tạo phân công ca làm đơn giản cho tổ của mình
 * Body tối thiểu: { date, shift, tasks, worker: { id, hoTen, email, maNV, role }, team: { id, tenTo } }
 */
exports.createAssignmentByTeamLeader = async (req, res) => {
  try {
    const { date, shift, tasks, worker, team } = req.body;

    if (!worker || !worker.id) {
      return res.status(400).json({ message: "Thiếu thông tin công nhân" });
    }
    if (!team || !team.id) {
      return res.status(400).json({ message: "Thiếu thông tin tổ" });
    }

    const payload = {
      ngay: date ? new Date(date) : new Date(),
      caLam: {
        id: "",
        tenCa: shift || "Ca không xác định",
      },
      congViec: [
        {
          to: {
            id: team.id,
            tenTo: team.tenTo || team.name || "",
          },
          moTa: tasks || "",
        },
      ],
      nguoiLap: {
        id: req.user?.id || req.user?._id,
        hoTen: req.user?.employee?.hoTen || req.user?.hoTen || req.user?.username,
        position: "totruong",
      },
      trangThai: "Dang thuc hien",
      nhanSu: [
        {
          id: worker.id,
          hoTen: worker.hoTen || worker.name || "",
          email: worker.email || "",
          maNV: worker.maNV || "",
          role: worker.role || "worker",
        },
      ],
      ghiChu: tasks || "",
    };

    const assignment = await WorkAssignment.create(payload);
    res
      .status(201)
      .json({ message: "Phân công ca làm thành công", assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật trạng thái phân công (hoàn thành / hủy) */
exports.updateAssignment = async (req, res) => {
  try {
    const updated = await WorkAssignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật phân công thành công", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Ghi nhận kết quả sản xuất cho một phân công */
exports.submitProductionLog = async (req, res) => {
  try {
    const { assignmentId, soLuongHoanThanh, soLuongLoi, ghiChu, chiTietLoi } = req.body;

    const assignment = await WorkAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Không tìm thấy phân công" });
    }

    const logPayload = {
      phanCong: assignment._id,
      keHoach: assignment.keHoach,
      xuong: assignment.xuong,
      to: req.body.to || assignment.congViec?.[0]?.to,
      ca: assignment.caLam,
      ngay: req.body.ngay || assignment.ngay || new Date(),
      sanPham: assignment.keHoach?.sanPham,
      soLuongThucTe: soLuongHoanThanh,
      soLuongLoi: soLuongLoi || 0,
      soLuongDat: req.body.soLuongDat || assignment.keHoach?.soLuongCanSanXuat || 0,
      ghiChu,
      chiTietLoi: chiTietLoi || [],
      nguoiGhi: req.body.nguoiGhi || {
        id: req.user?.id || req.user?._id,
        hoTen: req.user?.employee?.hoTen || req.user?.hoTen || req.user?.username,
      },
    };

    const log = await ProductionLog.create(logPayload);

    await WorkAssignment.findByIdAndUpdate(assignmentId, { trangThai: "Hoan thanh" });

    res.status(201).json({ message: "Đã ghi nhận kết quả sản xuất", log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
