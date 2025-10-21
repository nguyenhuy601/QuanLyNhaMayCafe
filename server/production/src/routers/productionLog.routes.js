const express = require("express");
const router = express.Router();
const logController = require("../controllers/productionLog.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Lấy nhật ký sản xuất
router.get("/", verifyToken, logController.getAllLogs);

// Ghi nhật ký sản xuất
router.post("/", verifyToken, authorizeRoles(["Tổ trưởng", "Xưởng trưởng"]), logController.createLog);

module.exports = router;
