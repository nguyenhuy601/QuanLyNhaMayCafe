const express = require("express");
const router = express.Router();
const controller = require("../controllers/position.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, controller.getAllPositions);
router.post("/", verifyToken, authorizeRoles(["Admin", "Nhân sự"]), controller.createPosition);

module.exports = router;
