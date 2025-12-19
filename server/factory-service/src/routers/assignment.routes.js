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
// Cho phép tổ trưởng cũng truy cập để lấy đầy đủ keHoach (backend sẽ lọc theo tổ)
// ============================================
router.get(
  "/manager/assignments",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...TEAMLEADER_ROLES]),
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

router.delete(
  "/manager/assignments/plan/:planId",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.deleteAssignmentsByPlanId
);

router.delete(
  "/manager/assignments/:id",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.deleteAssignment
);

// ============================================
// Tổ trưởng tạo phân công của tổ mình
// (GET /teamleader/assignments đã bỏ, dùng GET /manager/assignments thay thế)
// ============================================
router.post(
  "/teamleader/assignments",
  verifyToken,
  controller.createAssignmentByTeamLeader
);

// GET /teamleader/assignments đã bỏ - dùng GET /manager/assignments thay thế
// (endpoint này trả về rỗng, trong khi /manager/assignments có đầy đủ keHoach)

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
