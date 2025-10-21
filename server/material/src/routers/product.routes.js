const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, productController.getAllProducts);
router.post("/", verifyToken, authorizeRoles(["Admin", "Kho"]), productController.createProduct);
router.put("/:id", verifyToken, authorizeRoles(["Admin", "Kho"]), productController.updateProduct);
router.delete("/:id", verifyToken, authorizeRoles(["Admin"]), productController.deleteProduct);

module.exports = router;
