const express = require("express");
const router = express.Router();
const controller = require("../controllers/order.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, authorizeRoles(["orders"]), controller.getAllOrders);
router.get("/:id", verifyToken, authorizeRoles(["orders", "sales"]), controller.getOrderById);
// Create order: accept POST /orders
router.post("/", verifyToken, authorizeRoles(["orders", "sales"]), controller.createOrder);
// Update order
router.put("/:id", verifyToken, authorizeRoles(["orders"]), controller.updateOrder);
router.delete("/:id", verifyToken, authorizeRoles(["orders"]), controller.deleteOrder);

module.exports = router;
