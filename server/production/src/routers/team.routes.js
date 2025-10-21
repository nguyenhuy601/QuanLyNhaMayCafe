const express = require("express");
const router = express.Router();
const teamController = require("../controllers/team.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// Lấy danh sách tổ
router.get("/", verifyToken, teamController.getAllTeams);

// Tạo tổ mới
router.post("/", verifyToken, authorizeRoles(["Admin", "Xưởng trưởng"]), teamController.createTeam);

module.exports = router;
