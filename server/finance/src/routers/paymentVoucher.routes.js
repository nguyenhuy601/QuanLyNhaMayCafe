const express = require("express");
const router = express.Router();
const controller = require("../controllers/paymentVoucher.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Lấy danh sách phiếu thanh toán
router.get("/", verifyToken, controller.getAllVouchers);

// Tạo phiếu thanh toán mới
router.post("/", verifyToken, authorizeRoles(["Admin", "Kế toán"]), controller.createVoucher);

// Cập nhật trạng thái phiếu
router.put("/:id", verifyToken, authorizeRoles(["Admin", "Kế toán trưởng"]), controller.updateVoucherStatus);

// Xóa phiếu chưa duyệt
router.delete("/:id", verifyToken, authorizeRoles(["Admin"]), controller.deleteVoucher);

module.exports = router;
