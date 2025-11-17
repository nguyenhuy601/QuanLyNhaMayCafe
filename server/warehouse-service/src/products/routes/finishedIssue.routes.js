const express = require("express");
const router = express.Router();
const issueCtrl = require("../controllers/finishedIssue.controller");

const { verifyToken } = require("../../middlewares/auth.middleware");
const { authorizeRoles } = require("../../middlewares/role.middleware");

// GET /products/issues
router.get('/', verifyToken, authorizeRoles(["Warehouse", "Admin", "warehouseproduct"]), issueCtrl.getAllFinishedIssues);

// POST /products/issues
router.post('/', verifyToken, authorizeRoles(["Warehouse", "Admin", "warehouseproduct"]), issueCtrl.createFinishedIssue);

module.exports = router;
