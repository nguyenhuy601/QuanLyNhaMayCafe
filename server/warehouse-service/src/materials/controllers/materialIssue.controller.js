const MaterialIssue = require("../../models/MaterialIssue");
const MaterialRequest = require("../../models/MaterialRequest");
const axios = require("axios");
const { updateProductQuantity } = require("../../utils/productClient");

// Lấy gateway URL từ env, fallback cho docker/k8s/local
const GATEWAY_URL = process.env.GATEWAY_URL || "http://api-gateway:4000";

exports.getAllIssues = async (req, res) => {
  try {
    const list = await MaterialIssue.find();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Lấy danh sách phiếu xuất kho chờ duyệt (trangThai: "Cho xuat")
 */
exports.getPendingIssues = async (req, res) => {
  try {
    const list = await MaterialIssue.find({ trangThai: "Cho xuat" }).sort({ ngayXuat: -1 });
    console.log(`📋 [warehouse-service] Found ${list.length} pending issues (Cho xuat)`);
    res.status(200).json(list);
  } catch (err) {
    console.error("❌ [warehouse-service] Error fetching pending issues:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Duyệt phiếu xuất NVL (chuyển từ "Cho xuat" sang "Da xuat" và trừ kho)
 */
exports.approveIssue = async (req, res) => {
  try {
    const issue = await MaterialIssue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({ message: "Không tìm thấy phiếu xuất NVL" });
    }
    
    if (issue.trangThai !== "Cho xuat") {
      return res.status(400).json({ 
        message: `Không thể duyệt phiếu. Trạng thái hiện tại: ${issue.trangThai}. Chỉ có thể duyệt phiếu có trạng thái "Cho xuat".` 
      });
    }
    
    // Cập nhật trạng thái
    issue.trangThai = "Da xuat";
    await issue.save();
    
    // Trừ số lượng khỏi kho
    const authHeader = req.headers.authorization;
    const token = authHeader ? (authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`) : null;
    
    if (issue.chiTiet && Array.isArray(issue.chiTiet)) {
      console.log(`🔄 [warehouse-service] Approving issue, updating quantities for ${issue.chiTiet.length} items`);
      for (const item of issue.chiTiet) {
        if (item.sanPham && item.soLuong) {
          try {
            await updateProductQuantity(item.sanPham, -item.soLuong, token); // Giảm số lượng
            console.log(`✅ [warehouse-service] Updated quantity for product ${item.sanPham}: -${item.soLuong}`);
          } catch (err) {
            console.error(`❌ Error updating quantity for product ${item.sanPham}:`, err.message);
          }
        }
      }
    }
    
    res.status(200).json({
      message: "Đã duyệt phiếu xuất NVL và trừ kho thành công",
      issue: await MaterialIssue.findById(req.params.id)
    });
  } catch (err) {
    console.error("❌ Error approving issue:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Danh sách phiếu đã xuất (BGĐ duyệt) cần xưởng trưởng xác nhận (trangThai: "Da xuat")
 */
exports.getIssuesWaitingWarehouseHead = async (req, res) => {
  try {
    const list = await MaterialIssue.find({ trangThai: "Da xuat" }).sort({ updatedAt: -1 });
    console.log(`📋 [warehouse-service] Found ${list.length} issues waiting warehouse head confirmation (Da xuat)`);
    res.status(200).json(list);
  } catch (err) {
    console.error("❌ [warehouse-service] Error fetching issues waiting warehouse head:", err.message);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Xưởng trưởng xác nhận đã nhận NVL (từ "Da xuat" -> "Da nhan")
 */
exports.confirmIssueReceived = async (req, res) => {
  try {
    const issue = await MaterialIssue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: "Không tìm thấy phiếu xuất NVL" });
    }

    if (issue.trangThai !== "Da xuat") {
      return res.status(400).json({
        message: `Không thể xác nhận. Trạng thái hiện tại: ${issue.trangThai}. Chỉ xác nhận khi phiếu ở trạng thái "Da xuat".`,
      });
    }

    issue.trangThai = "Da nhan";
    await issue.save();

    console.log(`✅ [warehouse-service] Warehouse head confirmed receipt for issue ${issue._id}`);
    res.status(200).json({ message: "Đã xác nhận NVL đã đến xưởng", issue });
  } catch (err) {
    console.error("❌ [warehouse-service] Error confirming issue received:", err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.createIssue = async (req, res) => {
  try {
    console.log("📥 [warehouse-service] Received issue data:", JSON.stringify(req.body, null, 2));

    // Kiểm tra kế hoạch đã duyệt chưa (nếu có keHoach) - trước khi tạo
    if (req.body.keHoach) {
      try {
        const authHeader = req.headers.authorization;
        const headers = authHeader ? { Authorization: authHeader } : {};
        const planResponse = await axios.get(`${GATEWAY_URL}/plan/${req.body.keHoach}`, { headers });
        const plan = planResponse.data;
        if (plan.trangThai !== "Đã duyệt") {
          return res.status(400).json({
            error: "Kế hoạch chưa được duyệt",
            message: `Không thể tạo phiếu xuất. Kế hoạch trạng thái: ${plan.trangThai}.`,
          });
        }
        console.log("✅ [warehouse-service] Plan is approved, proceeding with issue creation");
      } catch (err) {
        console.error("❌ [warehouse-service] Error checking plan status:", err.message);
        console.warn("⚠️ [warehouse-service] Could not verify plan status, proceeding anyway");
      }
    }

    // Kiểm tra MaterialRequest đã được duyệt chưa (nếu có keHoach) - trước khi tạo
    let materialRequestApproved = false;
    if (req.body.keHoach) {
      try {
        const materialRequest = await MaterialRequest.findOne({
          keHoach: req.body.keHoach,
          trangThai: { $in: ["Đã duyệt", "Đã đặt hàng", "Hoàn thành"] },
        });
        if (materialRequest) {
          materialRequestApproved = true;
          console.log(`✅ [warehouse-service] MaterialRequest ${materialRequest.maPhieu} approved, allowing issue creation`);
        } else {
          const anyRequest = await MaterialRequest.findOne({ keHoach: req.body.keHoach });
          if (anyRequest) {
            console.warn(`⚠️ [warehouse-service] MaterialRequest ${anyRequest.maPhieu} exists but not approved (status: ${anyRequest.trangThai})`);
            return res.status(400).json({
              error: "MaterialRequest chưa được duyệt",
              message: `Không thể tạo phiếu xuất. Phiếu yêu cầu NVL (${anyRequest.maPhieu}) chưa được duyệt (trạng thái: ${anyRequest.trangThai}).`,
            });
          } else {
            console.warn(`⚠️ [warehouse-service] No MaterialRequest found for plan ${req.body.keHoach}`);
            materialRequestApproved = true; // cho phép nếu không cần request
          }
        }
      } catch (err) {
        console.error("❌ [warehouse-service] Error checking MaterialRequest:", err.message);
        console.warn("⚠️ [warehouse-service] Cannot verify MaterialRequest, will NOT update inventory if approved later");
        materialRequestApproved = false;
      }
    } else {
      materialRequestApproved = true;
      console.log("ℹ️ [warehouse-service] No keHoach provided, allowing issue creation");
    }

    // Chuẩn hóa dữ liệu tạo phiếu
    const issueData = {
      maPhieuXuat: req.body.maPhieuXuat,
      keHoach: req.body.keHoach || null,
      nguoiLap: req.body.nguoiLap || req.user?.id || null,
      ngayXuat: req.body.ngayXuat ? new Date(req.body.ngayXuat) : new Date(),
      chiTiet: req.body.chiTiet || [],
      xuongNhan: req.body.xuongNhan || null,
      trangThai: req.body.trangThai || "Cho xuat", // Mặc định chờ xuất, cần duyệt
    };

    console.log("📝 [warehouse-service] Creating issue with data:", JSON.stringify(issueData, null, 2));

    let issue;
    try {
      issue = await MaterialIssue.create(issueData);
      console.log("✅ [warehouse-service] MaterialIssue created:", issue._id);
      console.log("📋 [warehouse-service] Issue details:", JSON.stringify({
        _id: issue._id,
        maPhieuXuat: issue.maPhieuXuat,
        keHoach: issue.keHoach,
        chiTiet: issue.chiTiet,
        trangThai: issue.trangThai,
      }, null, 2));
    } catch (createError) {
      if (createError.code === 11000) {
        console.error("❌ [warehouse-service] Duplicate maPhieuXuat:", issueData.maPhieuXuat);
        return res.status(400).json({
          error: "Mã phiếu đã tồn tại",
          message: `Mã phiếu xuất ${issueData.maPhieuXuat} đã được sử dụng. Vui lòng chọn mã khác.`,
        });
      }
      console.error("❌ [warehouse-service] Error creating issue in DB:", createError.message);
      console.error("❌ [warehouse-service] Error details:", JSON.stringify(createError, null, 2));
      throw createError;
    }

    // CHỈ trừ số lượng khi trạng thái là "Da xuat" và MaterialRequest đã duyệt/không cần
    if (issue.trangThai === "Da xuat" && materialRequestApproved && issue.chiTiet && Array.isArray(issue.chiTiet)) {
      const authHeader = req.headers.authorization;
      const token = authHeader ? (authHeader.startsWith('Bearer ') ? authHeader : `Bearer ${authHeader}`) : null;

      console.log(`🔄 [warehouse-service] Issue status is "Da xuat", updating quantities for ${issue.chiTiet.length} items`);
      for (const item of issue.chiTiet) {
        if (item.sanPham && item.soLuong) {
          try {
            await updateProductQuantity(item.sanPham, -item.soLuong, token); // Giảm số lượng
            console.log(`✅ [warehouse-service] Updated quantity for product ${item.sanPham}: -${item.soLuong}`);
          } catch (err) {
            console.error(`❌ Error updating quantity for product ${item.sanPham}:`, err.message);
          }
        }
      }
    } else {
      if (issue.trangThai === "Cho xuat") {
        console.log("ℹ️ [warehouse-service] Issue status is 'Cho xuat', NOT updating inventory. Issue needs to be approved first.");
      } else if (!materialRequestApproved) {
        console.warn("⚠️ [warehouse-service] MaterialRequest not approved, NOT updating inventory quantities");
      }
    }

    res.status(201).json({ message: "Đã tạo phiếu xuất NVL", issue });
  } catch (err) {
    console.error("❌ [warehouse-service] Error creating issue:", err.message);
    res.status(500).json({ error: err.message });
  }
};
