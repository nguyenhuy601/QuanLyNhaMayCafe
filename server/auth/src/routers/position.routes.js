const express = require("express");
const router = express.Router();
const positionController = require("../controllers/position.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, positionController.getAllPositions);
router.post("/", verifyToken, authorizeRoles(["Admin", "HR"]), positionController.createPosition);
router.put("/:id", verifyToken, authorizeRoles(["Admin", "HR"]), positionController.updatePosition);
router.delete("/:id", verifyToken, authorizeRoles(["Admin"]), positionController.deletePosition);

module.exports = router;