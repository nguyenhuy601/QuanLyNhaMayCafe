const ProductionLog = require("../models/ProductionLog");
const { publishEvent } = require("../utils/eventPublisher");

/** Xưởng trưởng xem tất cả logs */
exports.getLogs = async (req, res) => {
  try {
    const logs = await ProductionLog.find().populate("phanCong").sort({ createdAt: -1 });
    res.status(200).json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tổ trưởng chỉ xem logs của tổ mình */
exports.getLogsByTeam = async (req, res) => {
  try {
    // Lấy ID tổ từ user
    const teamId = req.user?.teamId || req.user?.to?.id;
    
    if (!teamId) {
      return res.status(403).json({ 
        message: "Không xác định được tổ của bạn. Vui lòng liên hệ quản trị viên." 
      });
    }

    // Tìm logs của tổ này
    const logs = await ProductionLog.find({
      "to.id": teamId
    })
      .populate("phanCong")
      .sort({ createdAt: -1 });
    
    res.status(200).json(logs);
  } catch (err) {
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
