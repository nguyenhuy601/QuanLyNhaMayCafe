/**
 * Middleware kiểm tra quyền người dùng
 * @param {string[]} allowedRoles - danh sách quyền hợp lệ
 */
const normalize = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

exports.authorizeRoles = (allowedRoles = []) => {
  const normalizedAllowed = allowedRoles.map(normalize);

  return (req, res, next) => {
    if (!req.user || (!req.user.role && !req.user.roles)) {
      return res.status(403).json({ message: "Không xác định được quyền người dùng" });
    }

    const roleField = req.user.roles || req.user.role;
    const userRoles = Array.isArray(roleField) ? roleField : [roleField];
    const userRoleNormalized = userRoles.map(normalize);

    const hasPermission = userRoleNormalized.some((r) => normalizedAllowed.includes(r));
    if (!hasPermission) {
      return res.status(403).json({ 
        message: "Bạn không có quyền truy cập tài nguyên này",
        path: req.path,
        userRole: userRoleNormalized,
        allowedRoles: normalizedAllowed
      });
    }

    next();
  };
};
