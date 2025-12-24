const express = require("express");
const router = express.Router();
const controller = require("../controllers/xuong.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Role constants
const MANAGER_ROLES = ["xuongtruong", "admin","plan"]; // Xưởng trưởng
const TEAMLEADER_ROLES = ["totruong", "teamleader"]; // Tổ trưởng

// ============================================
// CRUD XƯỞNG SẢN XUẤT
// ============================================
router.get(
  "/",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...TEAMLEADER_ROLES]),
  controller.getXuongs
);

router.get(
  "/:id",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...TEAMLEADER_ROLES]),
  controller.getXuongById
);

router.post(
  "/",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.createXuong
);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.updateXuong
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.deleteXuong
);

// Hard delete (chỉ admin)
router.delete(
  "/:id/hard",
  verifyToken,
  authorizeRoles(["admin"]),
  controller.hardDeleteXuong
);

// ============================================
// QUẢN LÝ TỔ TRONG XƯỞNG
// ============================================
router.post(
  "/:id/to",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.addTo
);

router.delete(
  "/:id/to",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.removeTo
);

module.exports = router;

