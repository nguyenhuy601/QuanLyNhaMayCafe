const express = require("express");
const router = express.Router();
const controller = require("../controllers/employee.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, controller.getAllEmployees);
router.post("/", verifyToken, authorizeRoles(["Admin", "Nhân sự"]), controller.createEmployee);
router.put("/:id", verifyToken, authorizeRoles(["Admin", "Nhân sự"]), controller.updateEmployee);

module.exports = router;
