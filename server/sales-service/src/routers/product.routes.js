const express = require("express");
const router = express.Router();
const productController = require("../controllers/product.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");
const { verifyServiceSecret } = require("../middlewares/serviceAuth.middleware");

// CRUD routes
router.get("/", verifyToken, authorizeRoles(["orders","plan","admin","khonvl","khotp","xuongtruong"]), productController.getAllProducts);
router.get("/materials", verifyToken, authorizeRoles(["orders","plan","admin","khonvl","khotp","xuongtruong"]), productController.getMaterials);
router.get("/finished", verifyToken, authorizeRoles(["orders","plan","admin","khonvl","khotp","xuongtruong"]), productController.getFinishedProducts);

// Internal routes: Cho phép warehouse-service truy cập mà không cần user token (phải đặt TRƯỚC /:id)
router.get("/:id/internal", verifyServiceSecret, productController.getProductById);
router.put("/:id/quantity", verifyServiceSecret, productController.updateProductQuantityInternal);

// Public routes (cần token)
router.get("/:id", verifyToken, authorizeRoles(["orders","plan","admin","khonvl","khotp","xuongtruong"]), productController.getProductById);
router.post("/", verifyToken, authorizeRoles(["orders","plan","admin"]), productController.createProduct);
router.put("/:id", verifyToken, authorizeRoles(["orders","plan","admin","khonvl","khotp","xuongtruong"]), productController.updateProduct);
router.delete("/:id", verifyToken, authorizeRoles(["orders","plan","admin"]), productController.deleteProduct);

module.exports = router;
