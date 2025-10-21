const express = require("express");
const router = express.Router();
const controller = require("../controllers/qcResult.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Lấy danh sách kết quả QC
router.get("/", verifyToken, controller.getAllResults);

// Ghi kết quả kiểm tra QC
router.post("/", verifyToken, authorizeRoles(["QC", "QC trưởng"]), controller.createResult);

module.exports = router;
