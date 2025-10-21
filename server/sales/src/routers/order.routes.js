const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Lấy danh sách đơn hàng
router.get("/", verifyToken, orderController.getAllOrders);

// Tạo đơn hàng mới
router.post("/", verifyToken, authorizeRoles(["Admin", "Kinh doanh"]), orderController.createOrder);

// Cập nhật trạng thái đơn hàng (duyệt / hủy)
router.put("/:id", verifyToken, authorizeRoles(["Admin", "Kinh doanh"]), orderController.updateOrderStatus);

module.exports = router;
