const express = require("express");
const router = express.Router();
const controller = require("../controllers/productionLog.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Role constants
const MANAGER_ROLES = ["xuongtruong", "admin"]; // Xưởng trưởng
const TEAMLEADER_ROLES = ["totruong", "teamleader"]; // Tổ trưởng
const QC_ROLES = ["qc", "admin"]; // QC

// ============================================
// PRODUCTION LOG - Xưởng trưởng xem tất cả
// ============================================
router.get(
  "/production-logs",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...QC_ROLES]),
  controller.getLogs
);

router.put(
  "/production-logs/:id/finish",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.finishProduction
);

// ============================================
// Tổ trưởng chỉ xem logs của tổ mình
// ============================================
router.get(
  "/teamleader/production-logs",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...TEAMLEADER_ROLES]),
  controller.getLogsByTeam
);

// Legacy routes (giữ để tương thích)
router.get(
  "/",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...QC_ROLES]),
  controller.getLogs
);

router.put(
  "/finish/:id",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.finishProduction
);

module.exports = router;
