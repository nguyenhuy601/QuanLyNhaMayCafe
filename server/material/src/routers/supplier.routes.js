const express = require("express");
const router = express.Router();
const supplierController = require("../controllers/supplier.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.get("/", verifyToken, supplierController.getAllSuppliers);
router.post("/", verifyToken, authorizeRoles(["Admin", "Kho"]), supplierController.createSupplier);
router.put("/:id", verifyToken, authorizeRoles(["Admin", "Kho"]), supplierController.updateSupplier);
router.delete("/:id", verifyToken, authorizeRoles(["Admin"]), supplierController.deleteSupplier);

module.exports = router;
