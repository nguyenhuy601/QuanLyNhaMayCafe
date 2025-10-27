const express = require("express");
const router = express.Router();
const controller = require("../controllers/report.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/daily/:date", verifyToken, authorizeRoles(["Director", "Admin"]), controller.getReportByDate);
router.get("/latest", verifyToken, authorizeRoles(["Director", "Admin"]), controller.getLatestReport);
router.get("/monthly/:month", verifyToken, authorizeRoles(["Director", "Admin"]), controller.getMonthlySummary);

module.exports = router;
