const express = require("express");
const router = express.Router();
const controller = require("../controllers/workShift.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, controller.getAllShifts);
router.post("/", verifyToken, authorizeRoles(["Admin", "Nhân sự"]), controller.createShift);

module.exports = router;
