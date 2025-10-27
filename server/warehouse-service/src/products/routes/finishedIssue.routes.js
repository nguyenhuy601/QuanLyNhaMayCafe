const express = require("express");
const router = express.Router();
const issueCtrl = require("../controllers/finishedIssue.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");
const { authorizeRoles } = require("../../middlewares/role.middleware");

router.get("/issues", verifyToken, authorizeRoles(["Warehouse", "Admin"]), issueCtrl.getAllFinishedIssues);
router.post("/issues", verifyToken, authorizeRoles(["Warehouse", "Admin"]), issueCtrl.createFinishedIssue);

module.exports = router;