const express = require("express");
const router = express.Router();
const controller = require("../controllers/order.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", controller.getAllOrders);
router.post("/create", controller.createOrder);
router.put("/:id", controller.updateOrder);

module.exports = router;
