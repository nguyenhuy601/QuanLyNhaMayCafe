const express = require("express");
const router = express.Router();
const issueCtrl = require("../controllers/materialIssue.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");
const { authorizeRoles } = require("../../middlewares/role.middleware");

router.get("/", verifyToken, authorizeRoles(["khonvl", "khotp", "admin", "xuongtruong"]), issueCtrl.getAllIssues);
router.get("/pending", verifyToken, authorizeRoles(["khonvl", "khotp", "admin", "director"]), issueCtrl.getPendingIssues);
router.get("/waiting-warehouse-head", verifyToken, authorizeRoles(["xuongtruong", "admin"]), issueCtrl.getIssuesWaitingWarehouseHead);
router.post("/", verifyToken, authorizeRoles(["khonvl", "khotp", "admin"]), issueCtrl.createIssue);
router.put("/:id/approve", verifyToken, authorizeRoles(["khonvl", "khotp", "admin", "director"]), issueCtrl.approveIssue);
router.put("/:id/confirm", verifyToken, authorizeRoles(["xuongtruong", "admin"]), issueCtrl.confirmIssueReceived);

module.exports = router;