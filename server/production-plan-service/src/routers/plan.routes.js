const express = require("express");
const router = express.Router();
const controller = require("../controllers/plan.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, authorizeRoles(["plan", "Admin"]), controller.getPlans);
router.post("/", verifyToken, authorizeRoles(["plan", "Admin"]), controller.createProductionPlan);


module.exports = router;
