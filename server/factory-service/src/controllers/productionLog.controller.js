const ProductionLog = require("../models/ProductionLog");
const { publishEvent } = require("../utils/eventPublisher");

exports.getLogs = async (req, res) => {
  try {
    const logs = await ProductionLog.find().populate("phanCong").sort({ createdAt: -1 });
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
