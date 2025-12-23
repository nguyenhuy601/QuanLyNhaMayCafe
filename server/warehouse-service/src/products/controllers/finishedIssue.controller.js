const FinishedIssue = require("../../models/FinishedIssue");
const { publishEvent } = require("../../utils/eventPublisher");
const { updateProductQuantity } = require("../../utils/productClient");
const axios = require("axios");

const GATEWAY_URL = process.env.GATEWAY_URL || "http://api-gateway:4000";

exports.getAllFinishedIssues = async (req, res) => {
  try {
    const list = await FinishedIssue.find();
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy danh sách phiếu xuất chờ duyệt
exports.getPendingFinishedIssues = async (req, res) => {
  try {
    const list = await FinishedIssue.find({ trangThai: "Cho duyet" }).sort({ createdAt: -1 });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Duyệt phiếu xuất thành phẩm
exports.approveFinishedIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await FinishedIssue.findById(id);
    
    if (!issue) {
      return res.status(404).json({ error: "Không tìm thấy phiếu xuất" });
    }

    if (issue.trangThai !== "Cho duyet") {
      return res.status(400).json({ error: "Phiếu xuất này không ở trạng thái chờ duyệt" });
    }

    // Cập nhật trạng thái thành "Da xuat"
    issue.trangThai = "Da xuat";
    await issue.save();

    // Trừ số lượng sản phẩm trong kho thành phẩm sau khi duyệt
    if (issue.chiTiet && Array.isArray(issue.chiTiet) && issue.chiTiet.length > 0) {
      const token = req.headers.authorization || req.headers.Authorization;
      
      for (const item of issue.chiTiet) {
        if (item.sanPham && item.soLuong && item.soLuong > 0) {
          try {
            // Trừ số lượng (số lượng âm = giảm)
            await updateProductQuantity(item.sanPham, -item.soLuong, token);
            console.log(`✅ [approveFinishedIssue] Đã trừ số lượng sản phẩm ${item.sanPham}: -${item.soLuong}`);
          } catch (qtyError) {
            console.error(`❌ [approveFinishedIssue] Lỗi trừ số lượng sản phẩm ${item.sanPham}:`, qtyError.message);
            // Không block response nếu lỗi cập nhật số lượng
          }
        }
      }
    }

    // Cập nhật trạng thái đơn hàng thành "Đã xuất kho" (nếu chưa cập nhật)
    if (issue.donHang) {
      try {
        const token = req.headers.authorization || req.headers.Authorization;
        const headers = token ? { Authorization: token } : {};
        await axios.put(
          `${GATEWAY_URL}/orders/${issue.donHang}`,
          { trangThai: "Đã xuất kho" },
          { headers }
        );
        console.log(`✅ [approveFinishedIssue] Đã cập nhật trạng thái đơn hàng ${issue.donHang} thành "Đã xuất kho"`);
      } catch (orderError) {
        console.error(`❌ [approveFinishedIssue] Lỗi cập nhật trạng thái đơn hàng:`, orderError.message);
        // Không block response nếu lỗi
      }
    }

    // Gửi event sang Sales-Service để cập nhật trạng thái đơn
    try {
      await publishEvent("FINISHED_ISSUE_APPROVED", issue);
    } catch (eventErr) {
      console.warn("⚠️ [approveFinishedIssue] Lỗi publish event (không block response):", eventErr.message);
    }

    res.status(200).json({ message: "Duyệt phiếu xuất thành công", issue });
  } catch (err) {
    console.error("❌ [approveFinishedIssue] Error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Từ chối phiếu xuất thành phẩm (chuyển từ "Cho duyet" sang "Tu choi")
 */
exports.rejectFinishedIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const issue = await FinishedIssue.findById(id);
    
    if (!issue) {
      return res.status(404).json({ error: "Không tìm thấy phiếu xuất" });
    }

    if (issue.trangThai !== "Cho duyet") {
      return res.status(400).json({ 
        error: `Không thể từ chối phiếu. Trạng thái hiện tại: ${issue.trangThai}. Chỉ có thể từ chối phiếu có trạng thái "Cho duyet".` 
      });
    }

    // Cập nhật trạng thái thành "Tu choi"
    issue.trangThai = "Tu choi";
    await issue.save();

    res.status(200).json({ message: "Đã từ chối phiếu xuất thành phẩm", issue });
  } catch (err) {
    console.error("❌ [rejectFinishedIssue] Error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createFinishedIssue = async (req, res) => {
  try {
    // Generate mã phiếu xuất tự động
    const count = await FinishedIssue.countDocuments();
    const maPhieuXuatTP = `PXTP${String(count + 1).padStart(6, '0')}`;

    const issue = await FinishedIssue.create({
      ...req.body,
      maPhieuXuatTP,
      ngayXuat: new Date(),
      trangThai: "Cho duyet", // Tạo với trạng thái chờ duyệt, sau khi duyệt mới trừ số lượng
    });

    // KHÔNG trừ số lượng ngay, chờ ban giám đốc duyệt
    // Số lượng sẽ được trừ trong hàm approveFinishedIssue

    // Cập nhật trạng thái đơn hàng thành "Đã xuất kho" để không cho chọn xuất nữa
    if (issue.donHang) {
      try {
        const token = req.headers.authorization || req.headers.Authorization;
        const headers = token ? { Authorization: token } : {};
        await axios.put(
          `${GATEWAY_URL}/orders/${issue.donHang}`,
          { trangThai: "Đã xuất kho" },
          { headers }
        );
        console.log(`✅ [createFinishedIssue] Đã cập nhật trạng thái đơn hàng ${issue.donHang} thành "Đã xuất kho"`);
      } catch (orderError) {
        console.error(`❌ [createFinishedIssue] Lỗi cập nhật trạng thái đơn hàng:`, orderError.message);
        // Không block response nếu lỗi
      }
    }

    // Gửi event sang Sales-Service để cập nhật trạng thái đơn
    // Không block response nếu RabbitMQ lỗi
    try {
      await publishEvent("FINISHED_ISSUE_CREATED", issue);
    } catch (eventErr) {
      console.warn("⚠️ [createFinishedIssue] Lỗi publish event (không block response):", eventErr.message);
    }

    res.status(201).json({ message: "Tạo phiếu xuất thành công, chờ duyệt", issue });
  } catch (err) {
    console.error("❌ [createFinishedIssue] Error:", err);
    if (err.code === 11000) {
      // Duplicate key error
      return res.status(400).json({ error: "Mã phiếu xuất đã tồn tại" });
    }
    res.status(500).json({ error: err.message });
  }
};
