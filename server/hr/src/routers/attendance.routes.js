const express = require("express");
const router = express.Router();
const controller = require("../controllers/attendance.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, controller.getAllAttendances);
router.post("/", verifyToken, authorizeRoles(["Tổ trưởng", "Nhân sự"]), controller.createAttendance);

module.exports = router;
