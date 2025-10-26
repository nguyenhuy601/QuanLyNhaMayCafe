const express = require("express");
const router = express.Router();
const controller = require("../controllers/plan.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, authorizeRoles(["Planning", "Admin", "Director"]), controller.getPlans);

module.exports = router;
