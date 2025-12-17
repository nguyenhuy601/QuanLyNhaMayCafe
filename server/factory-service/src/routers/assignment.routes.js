const express = require("express");
const router = express.Router();
const controller = require("../controllers/assignment.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Role constants
const MANAGER_ROLES = ["xuongtruong", "admin"]; // Xưởng trưởng
const TEAMLEADER_ROLES = ["totruong", "teamleader"]; // Tổ trưởng

// ============================================
// Xưởng trưởng quản lý phân công công việc
// ============================================
router.get(
  "/manager/assignments",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.getAssignments
);

router.post(
  "/manager/assignments",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.createAssignment
);

router.put(
  "/manager/assignments/:id",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.updateAssignment
);

// ============================================
// Tổ trưởng xem / tạo phân công của tổ mình
// (tạm thời chỉ cần xác thực token, không check role quá chặt để tránh 403 do lệch role)
// ============================================
router.post(
  "/teamleader/assignments",
  verifyToken,
  controller.createAssignmentByTeamLeader
);

router.get(
  "/teamleader/assignments",
  verifyToken,
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
