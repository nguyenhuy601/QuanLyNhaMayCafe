/**
 * Middleware kiểm tra quyền truy cập
 * @param {Array} allowedRoles - danh sách quyền được phép
 */
exports.authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role)
        return res.status(403).json({ message: "Không xác định được quyền" });

      const hasPermission = allowedRoles.includes(req.user.role);
      if (!hasPermission)
        return res.status(403).json({ message: "Bạn không có quyền truy cập" });

      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
};