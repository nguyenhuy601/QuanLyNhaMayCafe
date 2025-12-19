const express = require("express");
const router = express.Router();
const controller = require("../controllers/to.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Role constants
const MANAGER_ROLES = ["xuongtruong", "admin"]; // Xưởng trưởng
const TEAMLEADER_ROLES = ["totruong", "teamleader"]; // Tổ trưởng

// ============================================
// CRUD TỔ SẢN XUẤT - Xưởng trưởng quản lý
// ============================================
router.get(
  "/",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...TEAMLEADER_ROLES]),
  controller.getTos
);

router.get(
  "/:id",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...TEAMLEADER_ROLES]),
  controller.getToById
);

router.post(
  "/",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.createTo
);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.updateTo
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.deleteTo
);

// Hard delete (chỉ admin)
router.delete(
  "/:id/hard",
  verifyToken,
  authorizeRoles(["admin"]),
  controller.hardDeleteTo
);

// ============================================
// QUẢN LÝ TỔ TRƯỞNG
// ============================================
router.post(
  "/:id/to-truong",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.addToTruong
);

router.delete(
  "/:id/to-truong",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.removeToTruong
);

// ============================================
// QUẢN LÝ THÀNH VIÊN
// ============================================
router.post(
  "/:id/thanh-vien",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...TEAMLEADER_ROLES]),
  controller.addThanhVien
);

router.delete(
  "/:id/thanh-vien",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...TEAMLEADER_ROLES]),
  controller.removeThanhVien
);

// Xác nhận hoàn thành cho công nhân (chỉ tổ trưởng)
router.post(
  "/:id/xac-nhan-hoan-thanh",
  verifyToken,
  authorizeRoles(TEAMLEADER_ROLES),
  controller.confirmMemberCompletion
);

// Reset trạng thái công nhân trong một tổ cụ thể
router.post(
  "/:id/reset-members",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...TEAMLEADER_ROLES]),
  controller.resetTeamMemberStatus
);

// Reset trạng thái tất cả tổ về "Active" (mặc định)
router.post(
  "/reset-status",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.resetAllTeamsStatus
);

module.exports = router;

