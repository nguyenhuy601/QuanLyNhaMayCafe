/**
 * Middleware kiểm tra quyền người dùng
 */
exports.authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role)
      return res.status(403).json({ message: "Không xác định được quyền người dùng" });

    if (!allowedRoles.includes(req.user.role))
      return res.status(403).json({ message: "Không có quyền truy cập chức năng này" });

    next();
  };
};
    