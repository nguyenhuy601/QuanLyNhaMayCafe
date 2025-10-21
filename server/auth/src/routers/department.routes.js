const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/department.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, departmentController.getAllDepartments);
router.post("/", verifyToken, authorizeRoles(["Admin", "HR"]), departmentController.createDepartment);
router.put("/:id", verifyToken, authorizeRoles(["Admin", "HR"]), departmentController.updateDepartment);
router.delete("/:id", verifyToken, authorizeRoles(["Admin"]), departmentController.deleteDepartment);

module.exports = router;