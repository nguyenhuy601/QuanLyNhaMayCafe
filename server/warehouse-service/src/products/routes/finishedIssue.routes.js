const express = require("express");
const router = express.Router();
const issueCtrl = require("../controllers/finishedIssue.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");
const { authorizeRoles } = require("../../middlewares/role.middleware");

router.get("/", verifyToken, authorizeRoles(["khotp", "admin"]), issueCtrl.getAllFinishedIssues);
router.get("/pending", verifyToken, authorizeRoles(["director", "admin"]), issueCtrl.getPendingFinishedIssues);
router.post("/", verifyToken, authorizeRoles(["khotp", "admin"]), issueCtrl.createFinishedIssue);
router.put("/:id/approve", verifyToken, authorizeRoles(["director", "admin"]), issueCtrl.approveFinishedIssue);

module.exports = router;