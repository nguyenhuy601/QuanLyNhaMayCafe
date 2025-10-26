const express = require("express");
const router = express.Router();
const issueCtrl = require("../controllers/materialIssue.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");
const { authorizeRoles } = require("../../middlewares/role.middleware");

router.get("/issues", verifyToken, authorizeRoles(["Warehouse", "Admin"]), issueCtrl.getAllIssues);
router.post("/issues", verifyToken, authorizeRoles(["Warehouse", "Admin"]), issueCtrl.createIssue);

module.exports = router;