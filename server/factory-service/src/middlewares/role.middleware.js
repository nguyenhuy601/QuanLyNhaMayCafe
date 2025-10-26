/**
 * Middleware kiểm tra quyền người dùng
 * @param {string[]} allowedRoles - danh sách quyền hợp lệ
 */
exports.authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role)
      return res.status(403).json({ message: "Không xác định được quyền người dùng" });

    const allowed = allowedRoles.includes(req.user.role);
    if (!allowed)
      return res.status(403).json({ message: "Bạn không có quyền truy cập tài nguyên này" });

    next();
  };
};
