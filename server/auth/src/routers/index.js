const express = require("express");
const router = express.Router();

router.use("/auth", require("./auth.routes"));
router.use("/employees", require("./employee.routes"));
router.use("/departments", require("./department.routes"));
router.use("/positions", require("./position.routes"));
router.use("/roles", require("./role.routes"));

module.exports = router;