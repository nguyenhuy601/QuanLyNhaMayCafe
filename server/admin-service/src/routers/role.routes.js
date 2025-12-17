const router = require("express").Router();
const controller = require("../controllers/role.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.get("/", verifyToken, authorizeRoles(["admin","totruong","xuongtruong"]), controller.getAll);
router.get("/:id", verifyToken, authorizeRoles(["admin","totruong","xuongtruong"]), controller.getById);
router.post("/", verifyToken, authorizeRoles(["admin","totruong","xuongtruong"]), controller.create);
router.put("/:id", verifyToken, authorizeRoles(["admin","totruong","xuongtruong"]), controller.update);
router.delete("/:id", verifyToken, authorizeRoles(["admin","totruong","xuongtruong"]), controller.remove);

module.exports = router;

