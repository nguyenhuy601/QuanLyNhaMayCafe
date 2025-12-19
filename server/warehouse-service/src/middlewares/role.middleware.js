/**
 * Middleware kiểm tra quyền người dùng
 * @param {string[]} allowedRoles - danh sách quyền hợp lệ
 */
exports.authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: "Không xác định được thông tin người dùng" });
    }

    // Hỗ trợ nhiều format role: string, object, array
    const normalize = (value) => {
      if (!value) return "";
      if (typeof value === "string") return value.toLowerCase().trim();
      if (typeof value === "object") {
        // Hỗ trợ object có tenQuyen, name, maQuyen, etc.
        return (value.tenQuyen || value.name || value.maQuyen || value.code || "").toString().toLowerCase().trim();
      }
      return String(value).toLowerCase().trim();
    };

    // Lấy role từ nhiều nguồn có thể
    const roleField = req.user.roles || req.user.role || req.user.userRole;
    const userRoles = Array.isArray(roleField)
      ? roleField.map(normalize)
      : [normalize(roleField)];

    const allowed = allowedRoles.map(normalize);

    const hasPermission = userRoles.some(role => allowed.includes(role));

    if (!hasPermission) {
      return res.status(403).json({ 
        message: "Bạn không có quyền thực hiện thao tác này",
        required: allowedRoles,
        userRole: req.user.role,
        userRoles: req.user.roles
      });
    }

    next();
  };
};
