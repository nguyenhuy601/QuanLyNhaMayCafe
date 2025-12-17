const router = require("express").Router();
const controller = require("../controllers/position.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.get("/", verifyToken, authorizeRoles(["admin","totruong"]), controller.getAll);
router.get("/:id", verifyToken, authorizeRoles(["admin","totruong"]), controller.getById);
router.post("/", verifyToken, authorizeRoles(["admin","totruong"]), controller.create);
router.put("/:id", verifyToken, authorizeRoles(["admin","totruong"]), controller.update);
router.delete("/:id", verifyToken, authorizeRoles(["admin","totruong"]), controller.remove);

module.exports = router;

