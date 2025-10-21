const express = require("express");
const router = express.Router();
const shiftController = require("../controllers/workShift.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Lấy danh sách ca làm việc
router.get("/", verifyToken, shiftController.getAllShifts);

// Tạo ca làm việc mới
router.post("/", verifyToken, authorizeRoles(["Admin", "Kế hoạch"]), shiftController.createShift);

module.exports = router;
