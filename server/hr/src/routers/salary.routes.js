const express = require("express");
const router = express.Router();
const controller = require("../controllers/salary.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, controller.getAllSalaries);
router.post("/", verifyToken, authorizeRoles(["Admin", "Nhân sự", "Kế toán"]), controller.createSalary);

module.exports = router;
