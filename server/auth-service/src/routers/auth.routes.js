const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Public routes
router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/verify", controller.verifyToken);

// Protected routes - Admin only
router.get("/accounts", verifyToken, authorizeRoles(["admin"]), controller.getAccounts);
router.get("/accounts/:accountId", verifyToken, authorizeRoles(["admin"]), controller.getAccountById);
router.post("/accounts", verifyToken, authorizeRoles(["admin"]), controller.createAccount);
router.put("/accounts/:accountId", verifyToken, authorizeRoles(["admin"]), controller.updateAccount);
router.delete("/accounts/:accountId", verifyToken, authorizeRoles(["admin"]), controller.deleteAccount);
router.put("/accounts/:accountId/role", verifyToken, authorizeRoles(["admin"]), controller.updateAccountRole);
router.put("/accounts/:accountId/san-pham-phu-trach", verifyToken, authorizeRoles(["admin"]), controller.assignProductsToManager);

module.exports = router;
