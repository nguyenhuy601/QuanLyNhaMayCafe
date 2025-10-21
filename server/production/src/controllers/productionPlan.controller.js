const ProductionPlan = require("../models/ProductionPlan");

/** Lấy danh sách kế hoạch sản xuất */
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await ProductionPlan.find()
      .populate("nguoiTao xuong danhSachSanPham.sanPham")
      .sort({ ngayLap: -1 });
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo kế hoạch sản xuất mới */
exports.createPlan = async (req, res) => {
  try {
    const plan = await ProductionPlan.create(req.body);
    res.status(201).json({ message: "Tạo kế hoạch thành công", plan });

    // 🚀 TODO: Gửi event PLAN_CREATED đến material-service để kiểm tra NVL
    // RabbitMQ.publish("PLAN_CREATED", plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật kế hoạch */
exports.updatePlan = async (req, res) => {
  try {
    const updated = await ProductionPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật kế hoạch thành công", plan: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
