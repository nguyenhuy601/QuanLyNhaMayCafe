const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, categoryController.getAllCategories);
router.post("/", verifyToken, authorizeRoles(["Admin", "Kho"]), categoryController.createCategory);
router.put("/:id", verifyToken, authorizeRoles(["Admin", "Kho"]), categoryController.updateCategory);
router.delete("/:id", verifyToken, authorizeRoles(["Admin"]), categoryController.deleteCategory);

module.exports = router;
