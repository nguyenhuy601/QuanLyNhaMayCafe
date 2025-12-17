const express = require("express");
const router = express.Router();
const controller = require("../controllers/materialRequest.controller");
const { verifyToken } = require("../../middlewares/auth.middleware");
const { authorizeRoles } = require("../../middlewares/role.middleware");

// Tạo phiếu yêu cầu NVL mới
router.post(
  "/",
  verifyToken,
  authorizeRoles(["admin", "plan", "khonvl"]),
  controller.createMaterialRequest
);

// Lấy danh sách phiếu yêu cầu NVL
router.get(
  "/",
  verifyToken,
  authorizeRoles(["admin", "plan", "director", "khonvl", "xuongtruong"]),
  controller.getMaterialRequests
);

// Lấy chi tiết phiếu yêu cầu NVL
router.get(
  "/:id",
  verifyToken,
  authorizeRoles(["admin", "plan", "director", "khonvl", "xuongtruong"]),
  controller.getMaterialRequestById
);

// Director duyệt phiếu yêu cầu NVL
router.put(
  "/:id/approve",
  verifyToken,
  authorizeRoles(["director", "admin"]),
  controller.approveMaterialRequest
);

// Director từ chối phiếu yêu cầu NVL
router.put(
  "/:id/reject",
  verifyToken,
  authorizeRoles(["director", "admin"]),
  controller.rejectMaterialRequest
);

module.exports = router;

