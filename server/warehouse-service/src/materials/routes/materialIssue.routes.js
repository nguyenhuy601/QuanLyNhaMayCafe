const express = require("express");
const router = express.Router();
const issueCtrl = require("../controllers/materialIssue.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");
const { authorizeRoles } = require("../../middlewares/role.middleware");

router.get("/", verifyToken, authorizeRoles(["khonvl", "khotp", "admin"]), issueCtrl.getAllIssues);
router.post("/", verifyToken, authorizeRoles(["khonvl", "khotp", "admin"]), issueCtrl.createIssue);

module.exports = router;