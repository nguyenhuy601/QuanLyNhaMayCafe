const MaterialReceipt = require("../../models/PurchaseReceipt");
const MaterialRequest = require("../../models/MaterialRequest");
const { updateProductQuantity } = require("../../utils/productClient");
const axios = require("axios");

const GATEWAY_URL = process.env.GATEWAY_URL || "http://api-gateway:4000";

exports.getAllReceipts = async (req, res) => {
  try {
    const list = await MaterialReceipt.find();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createReceipt = async (req, res) => {
  try {
    console.log("📥 [warehouse-service] Received receipt data:", JSON.stringify(req.body, null, 2));
    
    // Kiểm tra kế hoạch đã được duyệt chưa (nếu có keHoach)
    if (req.body.keHoach) {
      try {
        const authHeader = req.headers.authorization;
        const headers = authHeader ? { Authorization: authHeader } : {};
        const planResponse = await axios.get(`${GATEWAY_URL}/plan/${req.body.keHoach}`, { headers });
        const plan = planResponse.data;
        
        if (plan.trangThai !== "Đã duyệt") {
          return res.status(400).json({
            error: "Kế hoạch chưa được duyệt",
            message: `Không thể tạo phiếu nhập kho. Kế hoạch có trạng thái: ${plan.trangThai}. Chỉ có thể nhập kho khi kế hoạch đã được duyệt bởi ban giám đốc.`,
          });
        }
        console.log("✅ [warehouse-service] Plan is approved, proceeding with receipt creation");
      } catch (err) {
        console.error("❌ [warehouse-service] Error checking plan status:", err.message);
        // Nếu không kiểm tra được, vẫn cho phép tạo nhưng log warning
        console.warn("⚠️ [warehouse-service] Could not verify plan status, proceeding anyway");
      }
    }
    
    // Chỉ lấy các field hợp lệ từ model PurchaseReceipt
    const receiptData = {
      maPhieu: req.body.maPhieu,
      keHoach: req.body.keHoach || null, // Thêm keHoach
      nhaCungCap: req.body.nhaCungCap || null,
      nguoiLap: req.body.nguoiLap || req.user?.id || null,
      ngayNhap: req.body.ngayNhap ? new Date(req.body.ngayNhap) : new Date(),
      tongTien: req.body.tongTien || 0,
      chungTu: req.body.chungTu || "",
      ghiChu: req.body.ghiChu || "", // Thêm ghiChu
      chiTiet: req.body.chiTiet || [],
      trangThai: req.body.trangThai || "Cho nhap", // Mặc định là "Chờ nhập", cần duyệt trước khi cộng vào kho
    };
    
    console.log("📝 [warehouse-service] Creating receipt with data:", JSON.stringify(receiptData, null, 2));
    
    const receipt = await MaterialReceipt.create(receiptData);
    console.log("✅ [warehouse-service] Receipt (PurchaseReceipt) created:", receipt._id);
    console.log("📋 [warehouse-service] Receipt details:", JSON.stringify({
      maPhieu: receipt.maPhieu,
      keHoach: receipt.keHoach,
      chiTiet: receipt.chiTiet,
      trangThai: receipt.trangThai,
    }, null, 2));
    
    // LƯU Ý: MaterialReceipt (PurchaseReceipt) là phiếu NHẬP kho, KHÔNG phải MaterialRequest (phiếu YÊU CẦU NVL)
    // MaterialRequest chỉ được tạo tự động khi kế hoạch được duyệt và thiếu NVL
    
    // Kiểm tra MaterialRequest đã được duyệt chưa (nếu có keHoach)
    let materialRequestApproved = false;
    if (req.body.keHoach) {
      try {
        const materialRequest = await MaterialRequest.findOne({ 
          keHoach: req.body.keHoach,
          trangThai: { $in: ["Đã duyệt", "Đã đặt hàng", "Hoàn thành"] }
        });
        
        if (materialRequest) {
          materialRequestApproved = true;
          console.log(`✅ [warehouse-service] MaterialRequest ${materialRequest.maPhieu} is approved, allowing inventory update`);
        } else {
          // Kiểm tra xem có MaterialRequest nào cho kế hoạch này không
          const anyRequest = await MaterialRequest.findOne({ keHoach: req.body.keHoach });
          if (anyRequest) {
            console.warn(`⚠️ [warehouse-service] MaterialRequest ${anyRequest.maPhieu} exists but not approved (status: ${anyRequest.trangThai})`);
            return res.status(400).json({
              error: "MaterialRequest chưa được duyệt",
              message: `Không thể nhập kho. Phiếu yêu cầu NVL (${anyRequest.maPhieu}) chưa được duyệt bởi ban giám đốc. Trạng thái hiện tại: ${anyRequest.trangThai}. Vui lòng đợi Director duyệt phiếu yêu cầu NVL trước khi nhập kho.`,
            });
          } else {
            console.warn(`⚠️ [warehouse-service] No MaterialRequest found for plan ${req.body.keHoach}`);
            // Nếu không có MaterialRequest, có thể kế hoạch đủ NVL, cho phép nhập kho
            materialRequestApproved = true;
            console.log("ℹ️ [warehouse-service] No MaterialRequest needed (sufficient materials), allowing inventory update");
          }
        }
      } catch (err) {
        console.error("❌ [warehouse-service] Error checking MaterialRequest:", err.message);
        // Nếu không kiểm tra được, không cho phép cộng vào kho để an toàn
        console.warn("⚠️ [warehouse-service] Cannot verify MaterialRequest, NOT updating inventory");
        materialRequestApproved = false;
      }
    } else {
      // Nếu không có keHoach, cho phép nhập kho (có thể là nhập NVL không liên quan đến kế hoạch)
      materialRequestApproved = true;
      console.log("ℹ️ [warehouse-service] No keHoach provided, allowing inventory update");
    }
    
    // Lấy token từ request header để forward khi gọi API
    const authHeader = req.headers.authorization;
    const token = authHeader ? (authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`) : null;
    
    // CHỈ cộng số lượng vào kho khi:
    // 1. MaterialRequest đã được duyệt (hoặc không có MaterialRequest)
    // 2. VÀ trạng thái phiếu nhập là "Da nhap" (đã được duyệt)
    if (receipt.trangThai === "Da nhap" && materialRequestApproved && receipt.chiTiet && Array.isArray(receipt.chiTiet)) {
      console.log(`🔄 [warehouse-service] Receipt status is "Da nhap" and MaterialRequest approved, updating quantities for ${receipt.chiTiet.length} items`);
      for (const item of receipt.chiTiet) {
        if (item.sanPham && item.soLuong) {
          try {
            await updateProductQuantity(item.sanPham, item.soLuong, token);
            console.log(`✅ [warehouse-service] Updated quantity for product ${item.sanPham}: +${item.soLuong}`);
          } catch (err) {
            console.error(`❌ Error updating quantity for product ${item.sanPham}:`, err.message);
            // Không throw error để không block việc tạo phiếu nhập
          }
        }
      }
    } else {
      if (receipt.trangThai === "Cho nhap") {
        console.log("ℹ️ [warehouse-service] Receipt status is 'Cho nhap', NOT updating inventory. Receipt needs to be approved first.");
      } else if (!materialRequestApproved) {
        console.warn("⚠️ [warehouse-service] MaterialRequest not approved, NOT updating inventory quantities");
        console.warn("⚠️ [warehouse-service] Receipt created but inventory NOT updated. Please approve MaterialRequest first.");
      }
    }
    
    res.status(201).json({ message: "Đã tạo phiếu nhập NVL", receipt });
  } catch (err) {
    console.error("❌ [warehouse-service] Error creating receipt:", err.message);
    console.error("❌ [warehouse-service] Error stack:", err.stack);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Duyệt phiếu nhập NVL (chuyển từ "Cho nhap" sang "Da nhap" và cộng vào kho)
 */
exports.approveReceipt = async (req, res) => {
  try {
    const receipt = await MaterialReceipt.findById(req.params.id);
    
    if (!receipt) {
      return res.status(404).json({ message: "Không tìm thấy phiếu nhập NVL" });
    }
    
    if (receipt.trangThai !== "Cho nhap") {
      return res.status(400).json({ 
        message: `Không thể duyệt phiếu. Trạng thái hiện tại: ${receipt.trangThai}. Chỉ có thể duyệt phiếu có trạng thái "Cho nhap".` 
      });
    }
    
    // Kiểm tra MaterialRequest đã được duyệt chưa (nếu có keHoach)
    if (receipt.keHoach) {
      const materialRequest = await MaterialRequest.findOne({ 
        keHoach: receipt.keHoach,
        trangThai: { $in: ["Đã duyệt", "Đã đặt hàng", "Hoàn thành"] }
      });
      
      if (!materialRequest) {
        const anyRequest = await MaterialRequest.findOne({ keHoach: receipt.keHoach });
        if (anyRequest) {
          return res.status(400).json({
            error: "MaterialRequest chưa được duyệt",
            message: `Không thể duyệt phiếu nhập. Phiếu yêu cầu NVL (${anyRequest.maPhieu}) chưa được duyệt bởi ban giám đốc. Trạng thái hiện tại: ${anyRequest.trangThai}.`,
          });
        }
      }
    }
    
    // Cập nhật trạng thái
    receipt.trangThai = "Da nhap";
    await receipt.save();
    
    // Cộng số lượng vào kho
    const authHeader = req.headers.authorization;
    const token = authHeader ? (authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`) : null;
    
    if (receipt.chiTiet && Array.isArray(receipt.chiTiet)) {
      console.log(`🔄 [warehouse-service] Approving receipt, updating quantities for ${receipt.chiTiet.length} items`);
      for (const item of receipt.chiTiet) {
        if (item.sanPham && item.soLuong) {
          try {
            await updateProductQuantity(item.sanPham, item.soLuong, token);
            console.log(`✅ [warehouse-service] Updated quantity for product ${item.sanPham}: +${item.soLuong}`);
          } catch (err) {
            console.error(`❌ Error updating quantity for product ${item.sanPham}:`, err.message);
          }
        }
      }
    }
    
    res.status(200).json({
      message: "Đã duyệt phiếu nhập NVL và cộng vào kho thành công",
      receipt: await MaterialReceipt.findById(req.params.id)
    });
  } catch (err) {
    console.error("❌ Error approving receipt:", err.message);
    res.status(500).json({ error: err.message });
  }
};
