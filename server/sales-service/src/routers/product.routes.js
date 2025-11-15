const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");

// CRUD routes
// Note: filter by loai via query string: GET /?loai=sanpham or /?loai=nguyenvatlieu
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.post("/", productController.createProduct);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
