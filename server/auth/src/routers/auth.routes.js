const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/auth.middleware");

// Đăng ký tài khoản (Admin/HR)
router.post("/register", authController.register);

// Đăng nhập
router.post("/login", authController.login);

// Kiểm tra token hợp lệ
router.get("/verify", verifyToken, authController.verifyToken);

module.exports = router;