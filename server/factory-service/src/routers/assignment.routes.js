const express = require("express");
const router = express.Router();
const controller = require("../controllers/assignment.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, authorizeRoles(["Factory", "Admin"]), controller.getAssignments);
router.post("/", verifyToken, authorizeRoles(["Factory", "Admin"]), controller.createAssignment);
router.put("/:id", verifyToken, authorizeRoles(["Factory", "Admin"]), controller.updateAssignment);
router.post("/submit-log", verifyToken, authorizeRoles(["Factory", "TeamLeader"]), controller.submitProductionLog);

module.exports = router;
