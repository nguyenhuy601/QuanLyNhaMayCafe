const ProductionPlan = require("../models/ProductionPlan");
const { publishEvent } = require("../utils/eventPublisher");

/**
 * Kiểm tra tồn kho NVL (giả lập — sau này gọi warehouse-service)
 */
async function checkMaterialAvailability(order) {
  // 🧪 Giả lập: 70% có sẵn, 30% thiếu
  return Math.random() > 0.3;
}

const buildOrderData = (source) => {
  if (!source) return null;
  const raw = source.body || source;
  const payload = raw.order || raw;

  // Chuẩn hóa một số field nếu payload tới từ ORDER_APPROVED
  if (!payload.sanPham && payload.chiTiet?.length) {
    const firstItem = payload.chiTiet[0];
    payload.sanPham = {
      productId:
        firstItem.sanPham?._id ||
        firstItem.sanPham?.productId ||
        firstItem.sanPham ||
        firstItem.productId,
      tenSanPham:
        firstItem.sanPham?.tenSP ||
        firstItem.sanPham?.tenSanPham ||
        firstItem.productName,
      maSP: firstItem.sanPham?.maSP || firstItem.maSP,
      loai: "sanpham",
    };
  }

  if (!payload.soLuongCanSanXuat && payload.chiTiet?.[0]?.soLuong) {
    payload.soLuongCanSanXuat = payload.chiTiet[0].soLuong;
  }

  // Lấy đơn vị từ chiTiet
  if (!payload.donVi && payload.chiTiet?.[0]?.donVi) {
    payload.donVi = payload.chiTiet[0].donVi;
  }

  // Tính số lượng NVL ước tính nếu chưa có
  if (!payload.soLuongNVLUocTinh && payload.soLuongCanSanXuat) {
    payload.soLuongNVLUocTinh = Math.round(payload.soLuongCanSanXuat * 1.1);
  }

  if (!payload.donHangLienQuan?.length) {
    payload.donHangLienQuan = [
      {
        orderId: payload._id || payload.id,
        maDonHang: payload.maDH,
        tenKhachHang: payload.khachHang?.tenKH || payload.customerName,
        tongTien: payload.tongTien,
      },
    ];
  }

  if (!payload.ngayBatDauDuKien) {
    const ngayDat = payload.ngayDat ? new Date(payload.ngayDat) : new Date();
    payload.ngayBatDauDuKien = ngayDat.toISOString();
  } else if (typeof payload.ngayBatDauDuKien === 'string') {
    // Đảm bảo là Date object nếu là string
    payload.ngayBatDauDuKien = new Date(payload.ngayBatDauDuKien);
  }
  
  if (!payload.ngayKetThucDuKien) {
    const ngayGiao = payload.ngayYeuCauGiao ? new Date(payload.ngayYeuCauGiao) : payload.ngayBatDauDuKien;
    payload.ngayKetThucDuKien = ngayGiao instanceof Date ? ngayGiao : new Date(ngayGiao);
  } else if (typeof payload.ngayKetThucDuKien === 'string') {
    // Đảm bảo là Date object nếu là string
    payload.ngayKetThucDuKien = new Date(payload.ngayKetThucDuKien);
  }

  if (!payload.xuongPhuTrach) {
    payload.xuongPhuTrach = "Xưởng chính";
  }

  if (!payload.nguoiLap) {
    payload.nguoiLap = source.user?.username || "system";
  }

  // Đảm bảo nvlCanThiet là array (có thể rỗng khi tạo từ event)
  if (!payload.nvlCanThiet) {
    payload.nvlCanThiet = [];
  }

  return payload;
};

const createPlanInternal = async (orderData) => {
  if (!orderData) {
    throw new Error("Thiếu payload tạo kế hoạch");
  }

  // Lấy mã đơn hàng từ donHangLienQuan
  const firstOrder = orderData.donHangLienQuan?.[0];
  const maDH = firstOrder?.maDonHang || firstOrder?.maDH || orderData.maDonHang;

  // Kiểm tra đầu vào đúng theo payload mới
  if (
    !maDH ||
    !orderData.sanPham ||
    !orderData.soLuongCanSanXuat ||
    !orderData.ngayBatDauDuKien ||
    !orderData.ngayKetThucDuKien ||
    !orderData.xuongPhuTrach
  ) {
    // Log chi tiết để debug
    console.error("❌ Validation failed for plan creation:", {
      maDH: !!maDH,
      sanPham: !!orderData.sanPham,
      soLuongCanSanXuat: orderData.soLuongCanSanXuat,
      ngayBatDauDuKien: orderData.ngayBatDauDuKien,
      ngayKetThucDuKien: orderData.ngayKetThucDuKien,
      xuongPhuTrach: orderData.xuongPhuTrach,
      orderDataKeys: Object.keys(orderData),
    });
    throw new Error("Thiếu thông tin cần thiết để tạo kế hoạch.");
  }

  // Tính số lượng NVL thực tế từ nvlCanThiet
  const soLuongNVLThucTe = orderData.nvlCanThiet?.reduce((sum, nvl) => sum + (nvl.soLuong || 0), 0) || 0;

  // Đủ NVL → tạo kế hoạch sản xuất
  const plan = await ProductionPlan.create({
    donHangLienQuan: orderData.donHangLienQuan || [],
    sanPham: orderData.sanPham,
    soLuongCanSanXuat: orderData.soLuongCanSanXuat,
    donVi: orderData.donVi || null, // Lưu đơn vị
    soLuongNVLUocTinh: orderData.soLuongNVLUocTinh || 0, // Số lượng NVL ước tính (hiển thị)
    soLuongNVLThucTe: orderData.soLuongNVLThucTe || soLuongNVLThucTe, // Số lượng NVL thực tế đã tính
    soLuongNVLTho: orderData.soLuongNVLTho || 0, // Số lượng NVL thô (hạt cà phê) - kg
    soLuongBaoBi: orderData.soLuongBaoBi || 0, // Số lượng bao bì - túi
    soLuongTemNhan: orderData.soLuongTemNhan || 0, // Số lượng tem nhãn
    ngayBatDauDuKien: orderData.ngayBatDauDuKien,
    ngayKetThucDuKien: orderData.ngayKetThucDuKien,
    xuongPhuTrach: orderData.xuongPhuTrach,
    nguoiLap: orderData.nguoiLap,
    nvlCanThiet: orderData.nvlCanThiet || [],
    ghiChu: orderData.ghiChu || "",
  });

  await publishEvent("PLAN_READY", plan);
  return { plan };
};

/**
 * 🟢 CREATE - Tạo kế hoạch sản xuất mới qua HTTP
 */
exports.createProductionPlan = async (req, res) => {
  try {
    const result = await createPlanInternal(buildOrderData(req));

    return res.status(201).json({
      message: "Tạo kế hoạch sản xuất thành công.",
      plan: result.plan,
    });
  } catch (err) {
    console.error("❌ Error creating Production Plan:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * 📬 CREATE via message queue
 */
exports.createPlanFromEvent = async (payload) => {
  try {
    await createPlanInternal(payload);
  } catch (err) {
    console.error("❌ Error creating plan from event:", err.message);
  }
};


/**
 * 📋 READ - Lấy danh sách tất cả kế hoạch sản xuất
 * Xưởng trưởng chỉ thấy kế hoạch có sản phẩm trong danh sách phụ trách
 */
exports.getPlans = async (req, res) => {
  try {
    let filter = {};
    
    // Nếu là xưởng trưởng, chỉ hiển thị kế hoạch có sản phẩm trong danh sách phụ trách HOẶC xưởng phụ trách khớp
    if (req.user?.role === "xuongtruong") {
      const productIds = req.user.sanPhamPhuTrach?.map(sp => sp.productId).filter(Boolean) || [];
      const xuongPhuTrach = req.user.xuongPhuTrach || req.user.xuongInfo?.tenXuong;
      
      // Tạo filter phức hợp: sản phẩm phụ trách HOẶC xưởng phụ trách
      const orConditions = [];
      
      if (productIds.length > 0) {
        orConditions.push({ "sanPham.productId": { $in: productIds } });
      }
      
      if (xuongPhuTrach) {
        orConditions.push({ xuongPhuTrach: xuongPhuTrach });
      }
      
      if (orConditions.length > 0) {
        filter.$or = orConditions;
      } else {
        // Nếu không có điều kiện nào, trả về mảng rỗng
        return res.status(200).json([]);
      }
    }
    
    const plans = await ProductionPlan.find(filter).sort({ createdAt: -1 });

    res.status(200).json(
      plans.map((plan) => ({
        ...plan.toObject(),
        trangThai: plan.trangThai || "Chờ duyệt",
      }))
    );
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

    res.status(200).json({
      ...plan.toObject(),
      trangThai: plan.trangThai || "Chờ duyệt",
    });
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
      plan: {
        ...plan.toObject(),
        trangThai: plan.trangThai || "Chờ duyệt",
      },
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
