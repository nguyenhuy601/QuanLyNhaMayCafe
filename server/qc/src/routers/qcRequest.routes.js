const express = require("express");
const router = express.Router();
const controller = require("../controllers/qcRequest.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Lấy danh sách phiếu yêu cầu kiểm tra
router.get("/", verifyToken, controller.getAllRequests);

// Tạo phiếu yêu cầu QC
router.post("/", verifyToken, authorizeRoles(["Xưởng trưởng", "Kế hoạch"]), controller.createRequest);

module.exports = router;
