const ProductionLog = require("../models/ProductionLog");
const WorkAssignment = require("../models/WorkAssignment");
const ToSanXuat = require("../models/ToSanXuat");
const { publishEvent } = require("../utils/eventPublisher");
const axios = require("axios");

const GATEWAY_URL = process.env.GATEWAY_URL || "http://api-gateway:4000";

/** Xưởng trưởng xem tất cả logs */
exports.getLogs = async (req, res) => {
  try {
    const { planId, teamId, startDate, endDate } = req.query;
    let filter = {};

    // Lọc theo kế hoạch
    if (planId) {
      filter["keHoach.planId"] = planId;
    }

    // Lọc theo tổ
    if (teamId) {
      filter["to.id"] = teamId;
    }

    // Lọc theo ngày
    if (startDate || endDate) {
      filter.ngay = {};
      if (startDate) filter.ngay.$gte = new Date(startDate);
      if (endDate) filter.ngay.$lte = new Date(endDate);
    }

    // Nếu là xưởng trưởng, chỉ hiển thị logs của kế hoạch có sản phẩm phụ trách
    if (req.user?.role === "xuongtruong" && req.user?.sanPhamPhuTrach?.length > 0) {
      const productIds = req.user.sanPhamPhuTrach.map(sp => sp.productId).filter(Boolean);
      if (productIds.length > 0) {
        filter["sanPham.productId"] = { $in: productIds };
      } else {
        return res.status(200).json([]);
      }
    }

    const logs = await ProductionLog.find(filter)
      .populate("phanCong")
      .sort({ createdAt: -1 });
    
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tổ trưởng chỉ xem logs của tổ mình */
exports.getLogsByTeam = async (req, res) => {
  try {
    // Xác định tổ mà tổ trưởng phụ trách
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

    const teams = await ToSanXuat.find(teamFilter).select("_id");
    if (!teams.length) {
      return res.status(200).json([]);
    }

    const teamIds = teams.map((t) => t._id.toString());

    // Tìm logs của các tổ này
    const logs = await ProductionLog.find({
      "to.id": { $in: teamIds }
    })
      .populate("phanCong")
      .sort({ createdAt: -1 });
    
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo ProductionLog từ giả lập (cho xưởng trưởng) */
exports.createLogFromSimulation = async (req, res) => {
  try {
    const { teamId, planId, soLuongThucTe, ghiChu } = req.body;

    if (!teamId || !planId) {
      return res.status(400).json({ message: "Thiếu teamId hoặc planId" });
    }

    // Tìm assignment có teamId và planId
    const assignment = await WorkAssignment.findOne({
      "congViec.to.id": teamId,
      "keHoach.planId": planId,
      trangThai: { $in: ["Dang thuc hien", "Cho xac nhan"] }
    }).sort({ createdAt: -1 });

    if (!assignment) {
      return res.status(404).json({ 
        message: "Không tìm thấy phân công cho tổ này trong kế hoạch" 
      });
    }

    // Tìm công việc của tổ này trong assignment
    const congViec = assignment.congViec?.find(cv => cv.to?.id === teamId);
    if (!congViec) {
      return res.status(404).json({ 
        message: "Không tìm thấy công việc của tổ trong phân công" 
      });
    }

    // Tính số lượng thực tế (nếu không có thì dùng soLuongCanSanXuat)
    const soLuong = soLuongThucTe || assignment.keHoach?.soLuongCanSanXuat || 0;

    // Tìm log hiện tại hoặc tạo mới
    let log = await ProductionLog.findOne({
      phanCong: assignment._id,
      "to.id": teamId,
      "keHoach.planId": planId,
    });

    if (log) {
      // Cập nhật log hiện tại
      log.soLuongThucTe = soLuong;
      log.soLuongDat = soLuong;
      if (ghiChu) {
        log.ghiChu = ghiChu;
      }
      await log.save();
    } else {
      // Tạo log mới
      const logPayload = {
        phanCong: assignment._id,
        keHoach: assignment.keHoach || {},
        xuong: assignment.xuong || {},
        to: congViec.to || {},
        ca: assignment.caLam || {},
        ngay: new Date(),
        sanPham: assignment.keHoach?.sanPham || {},
        soLuongThucTe: soLuong,
        soLuongDat: soLuong,
        soLuongLoi: 0,
        chiTietLoi: [],
        ghiChu: ghiChu || "Giả lập tự động",
        nguoiGhi: {
          id: req.user?.id || req.user?._id,
          hoTen: req.user?.hoTen || req.user?.username || "Hệ thống",
        },
        trangThai: "Dang ghi",
      };

      log = await ProductionLog.create(logPayload);
    }

    res.status(200).json({
      message: "Đã lưu ProductionLog từ giả lập",
      log,
    });
  } catch (err) {
    console.error("Error creating log from simulation:", err);
    res.status(500).json({ error: err.message });
  }
};

/** Tạo hoặc cập nhật log sản xuất (cho tổ trưởng/công nhân ghi nhận sản lượng) */
exports.createOrUpdateLog = async (req, res) => {
  try {
    const { assignmentId, soLuongThucTe, soLuongLoi, chiTietLoi, ghiChu } = req.body;

    if (!assignmentId) {
      return res.status(400).json({ message: "Thiếu assignmentId" });
    }

    const assignment = await WorkAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Không tìm thấy phân công" });
    }

    // Tìm log hiện tại của phân công này (nếu có)
    let log = await ProductionLog.findOne({
      phanCong: assignmentId,
      trangThai: { $in: ["Dang ghi", "Cho kiem tra"] }
    });

    if (log) {
      // Cập nhật log hiện tại (cộng dồn sản lượng)
      log.soLuongThucTe = (log.soLuongThucTe || 0) + (soLuongThucTe || 0);
      log.soLuongLoi = (log.soLuongLoi || 0) + (soLuongLoi || 0);
      if (chiTietLoi && Array.isArray(chiTietLoi)) {
        log.chiTietLoi = [...(log.chiTietLoi || []), ...chiTietLoi];
      }
      if (ghiChu) {
        log.ghiChu = log.ghiChu ? `${log.ghiChu}\n${ghiChu}` : ghiChu;
      }
      await log.save();
    } else {
      // Tạo log mới
      const logPayload = {
        phanCong: assignment._id,
        keHoach: assignment.keHoach || {},
        xuong: assignment.xuong || {},
        to: assignment.congViec?.[0]?.to || {},
        ca: assignment.caLam || {},
        ngay: new Date(),
        sanPham: assignment.keHoach?.sanPham || {},
        soLuongThucTe: soLuongThucTe || 0,
        soLuongLoi: soLuongLoi || 0,
        soLuongDat: assignment.keHoach?.soLuongCanSanXuat || 0,
        chiTietLoi: chiTietLoi || [],
        ghiChu: ghiChu || "",
        nguoiGhi: {
          id: req.user?.id || req.user?._id,
          hoTen: req.user?.hoTen || req.user?.username || "Unknown",
        },
        trangThai: "Dang ghi",
      };

      log = await ProductionLog.create(logPayload);
    }

    res.status(200).json({
      message: log.soLuongThucTe === soLuongThucTe ? "Đã tạo log mới" : "Đã cập nhật log",
      log,
    });
  } catch (err) {
    console.error("❌ Error creating/updating log:", err);
    res.status(500).json({ error: err.message });
  }
};

/** Xem tiến độ theo kế hoạch */
exports.getPlanProgress = async (req, res) => {
  try {
    const { planId } = req.params;
    const token = req.headers.authorization;
    const headers = token ? { Authorization: token } : {};

    // Lấy thông tin kế hoạch
    let plan = null;
    try {
      const planResponse = await axios.get(`${GATEWAY_URL}/plan/${planId}`, { headers });
      plan = planResponse.data;
    } catch (err) {
      console.warn("⚠️ Không thể lấy thông tin kế hoạch:", err.message);
    }

    // Tính tổng sản lượng đã làm
    const logs = await ProductionLog.find({
      "keHoach.planId": planId,
      trangThai: { $ne: "Da gui QC" } // Chỉ tính logs chưa gửi QC
    });

    const totalThucTe = logs.reduce((sum, log) => sum + (log.soLuongThucTe || 0), 0);
    const totalLoi = logs.reduce((sum, log) => sum + (log.soLuongLoi || 0), 0);
    const totalDat = totalThucTe - totalLoi;
    const soLuongCanSanXuat = plan?.soLuongCanSanXuat || 0;
    const tiLeHoanThanh = soLuongCanSanXuat > 0 
      ? Math.round((totalDat / soLuongCanSanXuat) * 100) 
      : 0;

    // Thống kê theo tổ
    const statsByTeam = {};
    logs.forEach(log => {
      const teamId = log.to?.id || "Unknown";
      if (!statsByTeam[teamId]) {
        statsByTeam[teamId] = {
          tenTo: log.to?.tenTo || "Chưa xác định",
          soLuongThucTe: 0,
          soLuongLoi: 0,
          soLuongDat: 0,
          soLog: 0,
        };
      }
      statsByTeam[teamId].soLuongThucTe += log.soLuongThucTe || 0;
      statsByTeam[teamId].soLuongLoi += log.soLuongLoi || 0;
      statsByTeam[teamId].soLuongDat += (log.soLuongThucTe || 0) - (log.soLuongLoi || 0);
      statsByTeam[teamId].soLog += 1;
    });

    res.status(200).json({
      planId,
      maKeHoach: plan?.maKeHoach || "N/A",
      soLuongCanSanXuat,
      soLuongThucTe: totalThucTe,
      soLuongLoi: totalLoi,
      soLuongDat: totalDat,
      tiLeHoanThanh: Math.min(tiLeHoanThanh, 100), // Không vượt quá 100%
      thongKeTheoTo: Object.values(statsByTeam),
      tongSoLog: logs.length,
    });
  } catch (err) {
    console.error("❌ Error getting plan progress:", err);
    res.status(500).json({ error: err.message });
  }
};

/** Dashboard tiến độ tổng quan (cho xưởng trưởng) */
exports.getProgressDashboard = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const headers = token ? { Authorization: token } : {};

    // Lấy danh sách kế hoạch đang thực hiện
    let plans = [];
    try {
      const plansResponse = await axios.get(`${GATEWAY_URL}/plan?trangThai=Đang thực hiện`, { headers });
      plans = Array.isArray(plansResponse.data) ? plansResponse.data : [];
      
      // Nếu là xưởng trưởng, lọc theo sản phẩm phụ trách
      if (req.user?.role === "xuongtruong" && req.user?.sanPhamPhuTrach?.length > 0) {
        const productIds = req.user.sanPhamPhuTrach.map(sp => sp.productId).filter(Boolean);
        plans = plans.filter(p => 
          p.sanPham?.productId && productIds.includes(p.sanPham.productId)
        );
      }
    } catch (err) {
      console.warn("⚠️ Không thể lấy danh sách kế hoạch:", err.message);
    }

    // Tính tiến độ cho từng kế hoạch
    const progressList = await Promise.all(
      plans.map(async (plan) => {
        const logs = await ProductionLog.find({
          "keHoach.planId": plan._id || plan.id,
          trangThai: { $ne: "Da gui QC" }
        });

        const totalThucTe = logs.reduce((sum, log) => sum + (log.soLuongThucTe || 0), 0);
        const totalLoi = logs.reduce((sum, log) => sum + (log.soLuongLoi || 0), 0);
        const totalDat = totalThucTe - totalLoi;
        const soLuongCanSanXuat = plan.soLuongCanSanXuat || 0;
        const tiLeHoanThanh = soLuongCanSanXuat > 0 
          ? Math.round((totalDat / soLuongCanSanXuat) * 100) 
          : 0;

        return {
          planId: plan._id || plan.id,
          maKeHoach: plan.maKeHoach || "N/A",
          tenSanPham: plan.sanPham?.tenSanPham || "N/A",
          soLuongCanSanXuat,
          soLuongThucTe: totalThucTe,
          soLuongLoi: totalLoi,
          soLuongDat: totalDat,
          tiLeHoanThanh: Math.min(tiLeHoanThanh, 100),
          ngayBatDau: plan.ngayBatDauDuKien,
          ngayKetThuc: plan.ngayKetThucDuKien,
        };
      })
    );

    res.status(200).json({
      tongSoKeHoach: progressList.length,
      danhSachTienDo: progressList,
    });
  } catch (err) {
    console.error("❌ Error getting progress dashboard:", err);
    res.status(500).json({ error: err.message });
  }
};

/** Kết thúc ca – gửi sang QC kiểm tra */
exports.finishProduction = async (req, res) => {
  try {
    const log = await ProductionLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: "Không tìm thấy bản ghi" });

    log.trangThai = "Cho kiem tra";
    await log.save();

    // Gửi event sang QC-Service
    await publishEvent("PRODUCTION_DONE", log);
    res.status(200).json({ message: "Đã gửi thành phẩm sang QC", log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Xóa tất cả nhật ký sản xuất theo kế hoạch */
exports.deleteLogsByPlanId = async (req, res) => {
  try {
    const { planId } = req.params;
    
    if (!planId) {
      return res.status(400).json({ message: "Thiếu planId" });
    }

    const result = await ProductionLog.deleteMany({
      "keHoach.planId": planId.toString()
    });

    console.log(`✅ [deleteLogsByPlanId] Đã xóa ${result.deletedCount} nhật ký sản xuất cho kế hoạch ${planId}`);
    
    res.status(200).json({
      message: `Đã xóa ${result.deletedCount} nhật ký sản xuất`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("❌ [deleteLogsByPlanId] Lỗi:", err.message);
    res.status(500).json({ error: err.message });
  }
};
