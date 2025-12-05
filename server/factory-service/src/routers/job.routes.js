const express = require("express");
const router = express.Router();
const controller = require("../controllers/job.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Role constants
const MANAGER_ROLES = ["xuongtruong", "admin"]; // Chỉ Xưởng trưởng (và Admin) mới CRUD
const TEAMLEADER_ROLES = ["totruong", "teamleader"]; // Tổ trưởng chỉ xem

// ============================================
// CRUD công việc - Chỉ Xưởng trưởng
// ============================================
router.get(
  "/jobs",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.getJobs
);

router.get(
  "/jobs/:id",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.getJobById
);

router.post(
  "/jobs",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.createJob
);

router.put(
  "/jobs/:id",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.updateJob
);

router.delete(
  "/jobs/:id",
  verifyToken,
  authorizeRoles(MANAGER_ROLES),
  controller.deleteJob
);

// ============================================
// Tổ trưởng chỉ xem công việc (không CRUD)
// ============================================
router.get(
  "/teamleader/jobs",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...TEAMLEADER_ROLES]),
  controller.getJobs
);

router.get(
  "/teamleader/jobs/:id",
  verifyToken,
  authorizeRoles([...MANAGER_ROLES, ...TEAMLEADER_ROLES]),
  controller.getJobById
);

module.exports = router;


