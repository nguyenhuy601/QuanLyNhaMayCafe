const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

// CRUD routes
router.get("/", verifyToken, authorizeRoles(["orders","plan","admin","khonvl","khotp"]), productController.getAllProducts);
router.get("/materials", verifyToken, authorizeRoles(["orders","plan","admin","khonvl","khotp"]), productController.getMaterials);
router.get("/finished", verifyToken, authorizeRoles(["orders","plan","admin","khonvl","khotp"]), productController.getFinishedProducts);
router.get("/:id", verifyToken, authorizeRoles(["orders","plan","admin","khonvl","khotp"]), productController.getProductById);
router.post("/", verifyToken, authorizeRoles(["orders","plan","admin"]), productController.createProduct);
router.put("/:id", verifyToken, authorizeRoles(["orders","plan","admin","khonvl","khotp"]), productController.updateProduct);
router.delete("/:id", verifyToken, authorizeRoles(["orders","plan","admin"]), productController.deleteProduct);

module.exports = router;
