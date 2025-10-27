const express = require("express");
const router = express.Router();
const controller = require("../controllers/approval.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/pending", verifyToken, authorizeRoles(["Director"]), controller.getPendingOrders);
router.put("/approve/:id", verifyToken, authorizeRoles(["Director"]), controller.approveOrder);
router.put("/reject/:id", verifyToken, authorizeRoles(["Director"]), controller.rejectOrder);

module.exports = router;
