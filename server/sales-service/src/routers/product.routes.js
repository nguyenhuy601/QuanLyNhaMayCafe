const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// CRUD routes
router.get("/", verifyToken, authorizeRoles(["orders","plan"]), productController.getAllProducts);
router.get("/materials", verifyToken, authorizeRoles(["orders","plan"]), productController.getMaterials);
router.get("/finished", verifyToken, authorizeRoles(["orders","plan"]), productController.getFinishedProducts);
router.get("/:id", verifyToken, authorizeRoles(["orders","plan"]), productController.getProductById);
router.post("/", verifyToken, authorizeRoles(["orders","plan"]), productController.createProduct);
router.put("/:id", verifyToken, authorizeRoles(["orders","plan"]), productController.updateProduct);
router.delete("/:id", verifyToken, authorizeRoles(["orders","plan"]), productController.deleteProduct);

module.exports = router;
