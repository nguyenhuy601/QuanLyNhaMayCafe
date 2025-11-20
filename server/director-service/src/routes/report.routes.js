const express = require("express");
const router = express.Router();

const controller = require("../controllers/report.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/pending/orders", verifyToken, authorizeRoles(["director"]), controller.getPendingOrders);
router.get("/pending/plans", verifyToken, authorizeRoles(["director"]), controller.getPendingPlans);
router.get("/pending", verifyToken, authorizeRoles(["director"]), controller.getPendingSummary);

router.put("/orders/:id/approve", verifyToken, authorizeRoles(["director"]), controller.approveOrder);
router.put("/orders/:id/reject", verifyToken, authorizeRoles(["director"]), controller.rejectOrder);

router.put("/plans/:id/approve", verifyToken, authorizeRoles(["director"]), controller.approvePlan);
router.put("/plans/:id/reject", verifyToken, authorizeRoles(["director"]), controller.rejectPlan);

module.exports = router;

