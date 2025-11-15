const express = require("express");
const router = express.Router();
const controller = require("../controllers/plan.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const { authorizeRoles } = require("../middlewares/role.middleware");

router.post("/", verifyToken, authorizeRoles(["admin","plan"]), controller.createProductionPlan);  
router.get("/", verifyToken, authorizeRoles(["admin","plan"]), controller.getPlans);              
router.get("/:id", verifyToken, authorizeRoles(["admin","plan"]), controller.getPlanById);       
router.put("/:id", verifyToken, authorizeRoles(["admin","plan"]), controller.updateProductionPlan); 
router.delete("/:id", verifyToken, authorizeRoles(["admin","plan"]), controller.deleteProductionPlan);


module.exports = router;
