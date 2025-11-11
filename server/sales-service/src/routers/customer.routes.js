const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customer.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// 🔍 Tìm khách hàng theo SĐT — không cần quyền đặc biệt
router.get("/search/:phone", verifyToken, authorizeRoles(["admin", "orders", "sales"]), customerController.findCustomerByPhone);

// 🧾 Lấy toàn bộ khách hàng
router.get("/", verifyToken, authorizeRoles(["admin", "orders", "sales"]), customerController.getAllCustomers);

// ➕ Tạo khách hàng
router.post("/", verifyToken, authorizeRoles(["orders", "sales"]), customerController.createCustomer);

// ✏️ Cập nhật
router.put("/update/:id", verifyToken, authorizeRoles(["orders"]), customerController.updateCustomer);

// 🗑️ Xóa
router.delete("/delete/:id", verifyToken, authorizeRoles(["orders"]), customerController.deleteCustomer);

module.exports = router;
