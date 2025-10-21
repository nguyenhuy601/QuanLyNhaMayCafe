const express = require("express");
const router = express.Router();
const controller = require("../controllers/materialIssue.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, controller.getAllIssues);
router.post("/", verifyToken, authorizeRoles(["Kho", "Admin"]), controller.createIssue);

module.exports = router;
