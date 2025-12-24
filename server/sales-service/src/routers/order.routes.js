const express = require("express");
const router = express.Router();
const controller = require("../controllers/order.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, authorizeRoles(["orders","plan","director","khotp","admin"]), controller.getAllOrders);
router.get("/pending", verifyToken, authorizeRoles(["orders","plan","director","khotp","admin"]), controller.getPendingOrders);
router.get("/:id", verifyToken, authorizeRoles(["orders", "sales", "director", "plan","admin"]), controller.getOrderById);
// Create order: accept POST /orders
router.post("/", verifyToken, authorizeRoles(["orders", "sales","admin"]), controller.createOrder);
// Update order
router.put("/:id", verifyToken, authorizeRoles(["orders","director","khotp","admin"]), controller.updateOrder);
router.delete("/:id", verifyToken, authorizeRoles(["orders","admin"]), controller.deleteOrder);

module.exports = router;
