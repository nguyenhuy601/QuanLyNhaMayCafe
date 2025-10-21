const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employee.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Lấy danh sách nhân viên
router.get("/", verifyToken, employeeController.getAllEmployees);

// Tạo nhân viên mới (chỉ HR/Admin)
router.post("/", verifyToken, authorizeRoles(["Admin", "HR"]), employeeController.createEmployee);

// Cập nhật nhân viên
router.put("/:id", verifyToken, authorizeRoles(["Admin", "HR"]), employeeController.updateEmployee);

// Xóa nhân viên
router.delete("/:id", verifyToken, authorizeRoles(["Admin"]), employeeController.deleteEmployee);

module.exports = router;