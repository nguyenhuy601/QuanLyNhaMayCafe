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
 * API: Tạo kế hoạch sản xuất (FE gọi trực tiếp)
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

    if (!materialsOk) {
      // ❗Thiếu nguyên vật liệu → tạo phiếu yêu cầu bổ sung
      const request = await MaterialRequest.create({
        ngayYeuCau: new Date(),
        noiDung: `Missing materials for order ${orderData.maDH}`,
        trangThai: "Pending",
        nguoiYeuCau: orderData.nguoiTao,
      });

      console.log("⚠️ Material Request created:", request._id);
      return res.status(200).json({
        message: "Material not enough, material request created.",
        materialRequestId: request._id,
      });
    }

    // ✅ Đủ NVL → tạo kế hoạch sản xuất
    const plan = await ProductionPlan.create({
      donHangLienQuan: [], // FE hiện chưa gửi danh sách order _id, để trống hoặc bổ sung sau
      sanPham: orderData.sanPham,
      soLuongCanSanXuat: orderData.soLuongCanSanXuat,
      ngayBatDauDuKien: orderData.ngayBatDauDuKien,
      ngayKetThucDuKien: orderData.ngayKetThucDuKien,
      xuongPhuTrach: orderData.xuongPhuTrach,
      nguoiLap: orderData.nguoiTao,
      ghiChu: orderData.ghiChu || "",
      trangThai: "Đang chờ phân xưởng tiếp nhận",
    });

    console.log("🗂️ Production plan created:", plan.maKeHoach);

    // Phát sự kiện sang các service khác (nếu có)
    await publishEvent("PLAN_READY", plan);

    res.status(201).json({
      message: "Production plan created successfully.",
      plan,
    });
  } catch (err) {
    console.error("❌ Error creating Production Plan:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Lấy danh sách kế hoạch hiện tại
 */
exports.getPlans = async (req, res) => {
  try {
    const plans = await ProductionPlan.find()
      .populate("sanPham nguoiLap")
      .sort({ ngayLap: -1 });

    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
