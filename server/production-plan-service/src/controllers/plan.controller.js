const ProductionPlan = require("../models/ProductionPlan");
const MaterialRequest = require("../models/MaterialRequest");
const Product = require("../models/Product");
const { publishEvent } = require("../utils/eventPublisher");

/**
 * Kiểm tra tồn kho NVL (giả lập — sau này gọi warehouse-service)
 */
async function checkMaterialAvailability(order) {
  // 🧪 Giả lập: 70% có sẵn, 30% thiếu
  return Math.random() > 0.3;
}

/**
 * Tạo kế hoạch sản xuất sau khi đơn hàng được duyệt
 */
exports.createProductionPlan = async (orderData) => {
  try {
    const materialsOk = await checkMaterialAvailability(orderData);

    if (!materialsOk) {
      // Thiếu NVL → tạo phiếu yêu cầu bổ sung
      const request = await MaterialRequest.create({
        ngayYeuCau: new Date(),
        noiDung: `Thiếu nguyên vật liệu cho đơn hàng ${orderData.maDH}`,
        trangThai: "Chờ duyệt",
        nguoiYeuCau: orderData.nguoiTao,
      });
      console.log("⚠️ Material Request created:", request._id);
      return;
    }

    // Đủ NVL → tạo kế hoạch sản xuất
    const plan = await ProductionPlan.create({
      donHang: orderData._id,
      ngayLap: new Date(),
      nguoiLap: orderData.nguoiTao,
      trangThai: "Đang chờ phân xưởng tiếp nhận",
    });
    console.log("🗂️ Production plan created:", plan._id);

    // Gửi event sang factory-service
    await publishEvent("PLAN_READY", plan);
  } catch (err) {
    console.error("❌ Lỗi tạo kế hoạch SX:", err.message);
  }
};

/**
 * Lấy danh sách kế hoạch hiện tại
 */
exports.getPlans = async (req, res) => {
  try {
    const plans = await ProductionPlan.find()
      .populate("donHang nguoiLap")
      .sort({ ngayLap: -1 });
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
