const ProductionPlan = require("../models/ProductionPlan");
const MaterialRequest = require("../models/MaterialRequest");
const { publishEvent } = require("../utils/eventPublisher");

/**
 * Kiểm tra tồn kho NVL (giả lập — sau này gọi warehouse-service)
 */
async function checkMaterialAvailability(order) {
  // 🧪 Giả lập: 70% có sẵn, 30% thiếu
  return Math.random() > 0.3;
}

/**
 * 🟢 CREATE - Tạo kế hoạch sản xuất mới
 */
exports.createProductionPlan = async (req, res) => {
  try {
    const orderData = req.body;

    // 🔍 Kiểm tra dữ liệu đầu vào
    if (
      !orderData.maDH ||
      !orderData.sanPham ||
      !orderData.soLuongCanSanXuat ||
      !orderData.ngayBatDauDuKien ||
      !orderData.ngayKetThucDuKien ||
      !orderData.xuongPhuTrach
    ) {
      return res
        .status(400)
        .json({ message: "Thiếu thông tin cần thiết để tạo kế hoạch." });
    }

    const materialsOk = await checkMaterialAvailability(orderData);

    // ❌ Nếu thiếu NVL → tạo phiếu yêu cầu bổ sung
    if (!materialsOk) {
      // Create MaterialRequest instance and save so pre-save hooks (maPhieu) run reliably
      const request = new MaterialRequest({
        ngayYeuCau: new Date(),
        noiDung: `Thiếu nguyên vật liệu cho đơn hàng ${orderData.maDH}`,
        // Use enum value matching schema
        trangThai: "Cho phe duyet",
        nguoiTao: orderData.nguoiTao,
      });

      await request.save();

      console.log("⚠️ Material Request created:", request._id);
      return res.status(200).json({
        message: "Thiếu nguyên vật liệu, đã tạo phiếu yêu cầu.",
        materialRequestId: request._id,
      });
    }

    // ✅ Đủ NVL → tạo kế hoạch sản xuất
    // Create production plan, let model default for trangThai
    const plan = await ProductionPlan.create({
      donHangLienQuan: orderData.donHangLienQuan || [],
      sanPham: orderData.sanPham,
      soLuongCanSanXuat: orderData.soLuongCanSanXuat,
      ngayBatDauDuKien: orderData.ngayBatDauDuKien,
      ngayKetThucDuKien: orderData.ngayKetThucDuKien,
      xuongPhuTrach: orderData.xuongPhuTrach,
      nguoiLap: orderData.nguoiTao,
      ghiChu: orderData.ghiChu || "",
      // do not set trangThai here; use model default (e.g., "Chua duyet")
    });

    console.log("🗂️ Production plan created:", plan.maKeHoach);
    await publishEvent("PLAN_READY", plan);

    res.status(201).json({
      message: "Tạo kế hoạch sản xuất thành công.",
      plan,
    });
  } catch (err) {
    console.error("❌ Error creating Production Plan:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 📋 READ - Lấy danh sách tất cả kế hoạch sản xuất
 */
exports.getPlans = async (req, res) => {
  try {
    const plans = await ProductionPlan.find()
      .sort({ createdAt: -1 });

    res.status(200).json(plans);
  } catch (err) {
    console.error("❌ Error fetching plans:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 📄 READ - Lấy chi tiết kế hoạch theo ID
 */
exports.getPlanById = async (req, res) => {
  try {
    const plan = await ProductionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: "Không tìm thấy kế hoạch." });
    }

    res.status(200).json(plan);
  } catch (err) {
    console.error("❌ Error fetching plan by ID:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * ✏️ UPDATE - Cập nhật thông tin kế hoạch
 */
exports.updateProductionPlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const updateData = req.body;

    const plan = await ProductionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Không tìm thấy kế hoạch." });
    }

    // Gộp dữ liệu cập nhật
    Object.assign(plan, updateData, { updatedAt: new Date() });
    await plan.save();

    console.log("📝 Production plan updated:", plan.maKeHoach);
    await publishEvent("PLAN_UPDATED", plan);

    res.status(200).json({
      message: "Cập nhật kế hoạch thành công.",
      plan,
    });
  } catch (err) {
    console.error("❌ Error updating plan:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 🗑️ DELETE - Xóa kế hoạch sản xuất
 */
exports.deleteProductionPlan = async (req, res) => {
  try {
    const planId = req.params.id;
    const plan = await ProductionPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({ message: "Không tìm thấy kế hoạch." });
    }

    await plan.deleteOne();
    console.log("🗑️ Production plan deleted:", planId);

    await publishEvent("PLAN_DELETED", { _id: planId });

    res.status(200).json({ message: "Đã xóa kế hoạch sản xuất." });
  } catch (err) {
    console.error("❌ Error deleting plan:", err.message);
    res.status(500).json({ error: err.message });
  }
};
