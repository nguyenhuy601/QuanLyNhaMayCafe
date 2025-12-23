const ProductionPlan = require("../models/ProductionPlan");
const { publishEvent } = require("../utils/eventPublisher");
const axios = require("axios");

const GATEWAY_URL = process.env.GATEWAY_URL || "http://api-gateway:4000";

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

  // Xử lý ngayBatDauDuKien
  if (!payload.ngayBatDauDuKien) {
    if (payload.ngayDat) {
      payload.ngayBatDauDuKien = new Date(payload.ngayDat);
    } else {
      payload.ngayBatDauDuKien = new Date();
    }
  } else if (typeof payload.ngayBatDauDuKien === 'string') {
    payload.ngayBatDauDuKien = new Date(payload.ngayBatDauDuKien);
  }
  
  // Xử lý ngayKetThucDuKien
  if (!payload.ngayKetThucDuKien) {
    if (payload.ngayYeuCauGiao) {
      payload.ngayKetThucDuKien = new Date(payload.ngayYeuCauGiao);
    } else if (payload.ngayBatDauDuKien) {
      // Nếu không có ngayYeuCauGiao, dùng ngayBatDauDuKien + 30 ngày
      const ngayBatDau = payload.ngayBatDauDuKien instanceof Date 
        ? payload.ngayBatDauDuKien 
        : new Date(payload.ngayBatDauDuKien);
      payload.ngayKetThucDuKien = new Date(ngayBatDau.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else {
      payload.ngayKetThucDuKien = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  } else if (typeof payload.ngayKetThucDuKien === 'string') {
    payload.ngayKetThucDuKien = new Date(payload.ngayKetThucDuKien);
  }

  // Xử lý xuongPhuTrach - mặc định nếu chưa có
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

const createPlanInternal = async (orderData, token = null) => {
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

  // ============================================
  // VALIDATION: Ràng buộc thời gian khi tạo kế hoạch
  // ============================================
  
  // 1. Lấy thông tin đầy đủ của các đơn hàng từ sales-service
  const orderIds = orderData.donHangLienQuan?.map(o => o.orderId).filter(Boolean) || [];
  if (orderIds.length === 0) {
    throw new Error("Không có đơn hàng nào trong kế hoạch");
  }

  // Lấy thông tin đơn hàng từ sales-service để validate
  let orders = [];
  if (token && orderIds.length > 0) {
    try {
      const headers = { Authorization: token };
      const orderPromises = orderIds.map(orderId => 
        axios.get(`${GATEWAY_URL}/orders/${orderId}`, { headers }).catch(err => {
          console.warn(`⚠️ Không thể lấy đơn hàng ${orderId}:`, err.message);
          return null;
        })
      );
      const orderResponses = await Promise.all(orderPromises);
      orders = orderResponses
        .filter(res => res && res.data)
        .map(res => res.data);
    } catch (err) {
      console.warn("⚠️ Lỗi khi lấy thông tin đơn hàng:", err.message);
    }
  }

  // Validation: Kiểm tra các đơn hàng có ngày tạo và ngày giao không cách quá 3 ngày
  if (orders.length > 1) {
    const ngayTaoList = orders.map(o => new Date(o.ngayDat || o.createdAt)).filter(d => !isNaN(d.getTime()));
    const ngayGiaoList = orders.map(o => new Date(o.ngayYeuCauGiao)).filter(d => !isNaN(d.getTime()));

    if (ngayTaoList.length > 0) {
      const minNgayTao = new Date(Math.min(...ngayTaoList));
      const maxNgayTao = new Date(Math.max(...ngayTaoList));
      const soNgayChenhLechTao = Math.floor((maxNgayTao - minNgayTao) / (1000 * 60 * 60 * 24));
      
      if (soNgayChenhLechTao > 3) {
        throw new Error(`Các đơn hàng có ngày tạo cách nhau quá 3 ngày (${soNgayChenhLechTao} ngày)`);
      }
    }

    if (ngayGiaoList.length > 0) {
      const minNgayGiao = new Date(Math.min(...ngayGiaoList));
      const maxNgayGiao = new Date(Math.max(...ngayGiaoList));
      const soNgayChenhLechGiao = Math.floor((maxNgayGiao - minNgayGiao) / (1000 * 60 * 60 * 24));
      
      if (soNgayChenhLechGiao > 3) {
        throw new Error(`Các đơn hàng có ngày giao cách nhau quá 3 ngày (${soNgayChenhLechGiao} ngày)`);
      }
    }

    // Validation: Thời gian từ ngày tạo đến ngày giao phải hơn 90 ngày
    if (ngayTaoList.length > 0 && ngayGiaoList.length > 0) {
      const minNgayTao = new Date(Math.min(...ngayTaoList));
      const maxNgayGiao = new Date(Math.max(...ngayGiaoList));
      const soNgayTuTaoDenGiao = Math.floor((maxNgayGiao - minNgayTao) / (1000 * 60 * 60 * 24));
      
      if (soNgayTuTaoDenGiao < 90) {
        throw new Error(`Thời gian từ ngày tạo đến ngày giao phải ít nhất 90 ngày. Hiện tại: ${soNgayTuTaoDenGiao} ngày`);
      }
    }

  }

  // 2. Validation: Ngày bắt đầu kế hoạch phải hơn 5 ngày so với ngày hiện tại
  const ngayBatDau = new Date(orderData.ngayBatDauDuKien);
  const ngayKetThuc = new Date(orderData.ngayKetThucDuKien);
  
  // Validation: Ngày kết thúc kế hoạch phải trước 5 ngày so với ngày giao
  if (orders.length > 0) {
    const ngayGiaoList = orders.map(o => new Date(o.ngayYeuCauGiao)).filter(d => !isNaN(d.getTime()));
    if (ngayGiaoList.length > 0) {
      const maxNgayGiao = new Date(Math.max(...ngayGiaoList));
      const soNgayTuKetThucDenGiao = Math.floor((maxNgayGiao - ngayKetThuc) / (1000 * 60 * 60 * 24));
      
      if (soNgayTuKetThucDenGiao < 5) {
        throw new Error(`Ngày kết thúc kế hoạch phải trước ngày giao ít nhất 5 ngày. Hiện tại: ${soNgayTuKetThucDenGiao} ngày`);
      }
    }
  }
  const ngayHienTai = new Date();
  ngayHienTai.setHours(0, 0, 0, 0);
  
  const soNgayTuHienTai = Math.floor((ngayBatDau - ngayHienTai) / (1000 * 60 * 60 * 24));
  if (soNgayTuHienTai < 5) {
    throw new Error(`Ngày bắt đầu kế hoạch phải cách ngày hiện tại ít nhất 5 ngày. Hiện tại: ${soNgayTuHienTai} ngày`);
  }

  // 3. Validation: Kiểm tra thời gian kế hoạch hợp lệ
  if (ngayKetThuc <= ngayBatDau) {
    throw new Error("Ngày kết thúc phải sau ngày bắt đầu");
  }

  // 4. Validation: Kiểm tra chồng lấp với kế hoạch khác
  // Chỉ kiểm tra chồng lấp với các kế hoạch cùng xưởng phụ trách
  // Loại trừ các kế hoạch đã hoàn thành, từ chối hoặc hủy
  const existingPlans = await ProductionPlan.find({
    $and: [
      {
        $or: [
          // Kế hoạch bắt đầu trong khoảng thời gian của kế hoạch mới
          {
            ngayBatDauDuKien: { $gte: ngayBatDau, $lte: ngayKetThuc }
          },
          // Kế hoạch kết thúc trong khoảng thời gian của kế hoạch mới
          {
            ngayKetThucDuKien: { $gte: ngayBatDau, $lte: ngayKetThuc }
          },
          // Kế hoạch bao trùm kế hoạch mới
          {
            ngayBatDauDuKien: { $lte: ngayBatDau },
            ngayKetThucDuKien: { $gte: ngayKetThuc }
          }
        ]
      },
      // Chỉ kiểm tra với các kế hoạch cùng xưởng phụ trách
      {
        xuongPhuTrach: orderData.xuongPhuTrach
      },
      // Bỏ qua các kế hoạch đã hoàn thành, từ chối hoặc hủy
      {
        trangThai: { $nin: ["Hoàn thành", "Từ chối", "Đã hủy"] }
      }
    ]
  });

  if (existingPlans.length > 0) {
    const planCodes = existingPlans.map(p => p.maKeHoach || p._id).join(", ");
    throw new Error(`Thời gian kế hoạch bị chồng lấp với kế hoạch khác: ${planCodes}`);
  }

  // 5. Validation: Nếu có thông tin đơn hàng đầy đủ, kiểm tra thêm
  // (Cần lấy từ sales-service hoặc truyền từ frontend)
  // Tạm thời bỏ qua nếu không có thông tin đầy đủ

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
    const token = req.headers.authorization || req.headers.Authorization;
    const result = await createPlanInternal(buildOrderData(req), token);

    return res.status(201).json({
      message: "Tạo kế hoạch sản xuất thành công.",
      plan: result.plan,
    });
  } catch (err) {
    console.error("❌ Error creating Production Plan:", err.message);
    const statusCode = err.message.includes("phải") || err.message.includes("không") || err.message.includes("bị chồng") ? 400 : 500;
    res.status(statusCode).json({ error: err.message });
  }
};

/**
 * 📬 CREATE via message queue
 */
exports.createPlanFromEvent = async (payload) => {
  try {
    // Xử lý payload có thể là { message, order } hoặc order object trực tiếp
    const orderData = buildOrderData(payload);
    
    if (!orderData) {
      console.error("❌ Error creating plan from event: Không thể parse payload");
      return;
    }
    
    await createPlanInternal(orderData);
  } catch (err) {
    console.error("❌ Error creating plan from event:", err.message);
    console.error("❌ Payload received:", JSON.stringify(payload, null, 2));
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

    const token = req.headers.authorization || req.headers.Authorization;
    const headers = token ? { Authorization: token } : {};

    console.log(`🗑️ [deleteProductionPlan] Bắt đầu xóa kế hoạch ${planId} và các dữ liệu liên quan...`);

    // 1. Xóa tất cả phân công công việc (WorkAssignment) liên quan
    try {
      await axios.delete(
        `${GATEWAY_URL}/factory/manager/assignments/plan/${planId}`,
        { headers }
      );
      console.log(`✅ [deleteProductionPlan] Đã xóa phân công công việc cho kế hoạch ${planId}`);
    } catch (assignmentErr) {
      console.warn("⚠️ [deleteProductionPlan] Lỗi khi xóa phân công công việc:", assignmentErr.message);
      // Tiếp tục xóa các dữ liệu khác
    }

    // 2. Xóa tất cả lô sản xuất (LoSanXuat) liên quan
    try {
      await axios.delete(
        `${GATEWAY_URL}/factory/api/lot/plan/${planId}`,
        { headers }
      );
      console.log(`✅ [deleteProductionPlan] Đã xóa lô sản xuất cho kế hoạch ${planId}`);
    } catch (lotErr) {
      console.warn("⚠️ [deleteProductionPlan] Lỗi khi xóa lô sản xuất:", lotErr.message);
      // Tiếp tục xóa các dữ liệu khác
    }

    // 3. Xóa tất cả nhật ký sản xuất (ProductionLog) liên quan
    try {
      await axios.delete(
        `${GATEWAY_URL}/factory/manager/production-logs/plan/${planId}`,
        { headers }
      );
      console.log(`✅ [deleteProductionPlan] Đã xóa nhật ký sản xuất cho kế hoạch ${planId}`);
    } catch (logErr) {
      console.warn("⚠️ [deleteProductionPlan] Lỗi khi xóa nhật ký sản xuất:", logErr.message);
      // Tiếp tục xóa kế hoạch
    }

    // 4. Xóa kế hoạch
    await plan.deleteOne();
    console.log("🗑️ [deleteProductionPlan] Đã xóa kế hoạch:", planId);

    // 5. Publish event
    await publishEvent("PLAN_DELETED", { _id: planId });

    res.status(200).json({ 
      message: "Đã xóa kế hoạch sản xuất và tất cả dữ liệu liên quan.",
      deletedPlanId: planId
    });
  } catch (err) {
    console.error("❌ [deleteProductionPlan] Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
