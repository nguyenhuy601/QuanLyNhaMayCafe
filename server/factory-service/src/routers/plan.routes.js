const express = require("express");
const router = express.Router();
const controller = require("../controllers/plan.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Role constants
const MANAGER_ROLES = ["xuongtruong", "admin"]; // Xưởng trưởng

// ============================================
// QUẢN LÝ KẾ HOẠCH SẢN XUẤT - Xưởng trưởng
// ============================================

// Xem danh sách kế hoạch chờ duyệt
router.get(
  "/plans/pending",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.getPendingPlans
);

// Duyệt kế hoạch
router.put(
  "/plans/:id/approve",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.approvePlan
);

// Từ chối kế hoạch
router.put(
  "/plans/:id/reject",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.rejectPlan
);

module.exports = router;


