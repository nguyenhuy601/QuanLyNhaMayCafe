const express = require("express");
const router = express.Router();
const controller = require("../controllers/finishedIssue.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, controller.getAllFinishedIssues);
router.post("/", verifyToken, authorizeRoles(["Kho", "Admin"]), controller.createFinishedIssue);

module.exports = router;
