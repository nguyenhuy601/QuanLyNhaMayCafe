const express = require("express");
const router = express.Router();
const controller = require("../controllers/assignment.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Role constants
const MANAGER_ROLES = ["xuongtruong", "admin"]; // Xưởng trưởng
const TEAMLEADER_ROLES = ["totruong", "teamleader"]; // Tổ trưởng

// ============================================
// WORK ASSIGNMENT - Xưởng trưởng CRUD
// ============================================
router.get(
  "/assignments",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.getAssignments
);

router.post(
  "/assignments",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.createAssignment
);

router.put(
  "/assignments/:id",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.updateAssignment
);

// ============================================
// Tổ trưởng xem phân công của tổ mình
// ============================================
router.get(
  "/teamleader/assignments",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...TEAMLEADER_ROLES]),
  controller.getAssignmentsByTeam
);

// ============================================
// Tổ trưởng ghi nhận sản lượng
// ============================================
router.post(
  "/teamleader/submit-log",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...TEAMLEADER_ROLES]),
  controller.submitProductionLog
);

// Legacy route (giữ để tương thích)
router.post(
  "/submit-log",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...TEAMLEADER_ROLES]),
  controller.submitProductionLog
);

module.exports = router;
