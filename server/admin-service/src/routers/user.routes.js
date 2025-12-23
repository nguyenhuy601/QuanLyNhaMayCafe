const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Cho phép admin, tổ trưởng và xưởng trưởng xem/quản lý user
router.get("/", verifyToken, authorizeRoles(["admin", "totruong", "xuongtruong","plan","orders","khonvl","khotp","director","qc "]), controller.getAllUsers);
router.post("/", verifyToken, authorizeRoles(["admin", "totruong", "xuongtruong"]), controller.createUser);
router.post("/bulk", verifyToken, authorizeRoles(["admin"]), controller.createUsersBulk);
router.put("/:id", verifyToken, authorizeRoles(["admin", "totruong", "xuongtruong"]), controller.updateUser);
router.delete("/:id", verifyToken, authorizeRoles(["admin", "totruong", "xuongtruong"]), controller.deleteUser);

module.exports = router;
