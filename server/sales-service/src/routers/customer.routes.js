const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Lấy danh sách khách hàng
router.get("/", verifyToken, customerController.getAllCustomers);

// Tạo khách hàng mới
router.post("/", verifyToken, authorizeRoles(["Admin", "Kinh doanh"]), customerController.createCustomer);

// Cập nhật khách hàng
router.put("/:id", verifyToken, authorizeRoles(["Admin", "Kinh doanh"]), customerController.updateCustomer);

// Xóa khách hàng
router.delete("/:id", verifyToken, authorizeRoles(["Admin"]), customerController.deleteCustomer);

module.exports = router;
