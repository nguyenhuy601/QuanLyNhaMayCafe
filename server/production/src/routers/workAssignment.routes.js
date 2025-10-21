const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/workAssignment.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Lấy danh sách phân công công việc
router.get("/", verifyToken, assignmentController.getAllAssignments);

// Tạo phân công mới
router.post("/", verifyToken, authorizeRoles(["Xưởng trưởng"]), assignmentController.createAssignment);

module.exports = router;
