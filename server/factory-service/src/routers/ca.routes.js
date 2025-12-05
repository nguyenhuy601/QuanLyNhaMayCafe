const express = require("express");
const router = express.Router();
const controller = require("../controllers/ca.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Role constants
const MANAGER_ROLES = ["xuongtruong", "admin"]; // Xưởng trưởng
const TEAMLEADER_ROLES = ["totruong", "teamleader"]; // Tổ trưởng

// ============================================
// CRUD CA LÀM VIỆC
// ============================================
router.get(
  "/",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...TEAMLEADER_ROLES]),
  controller.getCas
);

router.get(
  "/:id",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...TEAMLEADER_ROLES]),
  controller.getCaById
);

router.post(
  "/",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.createCa
);

router.put(
  "/:id",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.updateCa
);

router.delete(
  "/:id",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.deleteCa
);

module.exports = router;

