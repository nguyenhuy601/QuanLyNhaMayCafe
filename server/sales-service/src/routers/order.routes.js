const express = require("express");
const router = express.Router();
const controller = require("../controllers/order.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, controller.getAllOrders);
router.post("/", verifyToken, authorizeRoles(["Sales", "Admin"]), controller.createOrder);
router.put("/:id", verifyToken, authorizeRoles(["Sales", "Admin"]), controller.updateOrder);

module.exports = router;
