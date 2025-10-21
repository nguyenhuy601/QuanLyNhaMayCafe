const express = require("express");
const router = express.Router();
const roleController = require("../controllers/role.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, authorizeRoles(["Admin"]), roleController.getAllRoles);
router.post("/", verifyToken, authorizeRoles(["Admin"]), roleController.createRole);
router.put("/:id", verifyToken, authorizeRoles(["Admin"]), roleController.updateRole);
router.delete("/:id", verifyToken, authorizeRoles(["Admin"]), roleController.deleteRole);

module.exports = router;
