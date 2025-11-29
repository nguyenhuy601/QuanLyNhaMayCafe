/**
 * Middleware kiểm tra quyền người dùng
 * @param {string[]} allowedRoles - danh sách quyền hợp lệ
 */
const normalize = (value = "") => value.toString().toLowerCase();

exports.authorizeRoles = (allowedRoles = []) => {
  const normalizedAllowed = allowedRoles.map(normalize);

  return (req, res, next) => {
    if (!req.user || !req.user.role)
      return res.status(403).json({ message: "Không xác định được quyền người dùng" });

    const userRole = normalize(req.user.role);
    if (!normalizedAllowed.includes(userRole))
      return res.status(403).json({ message: "Bạn không có quyền truy cập tài nguyên này" });

    next();
  };
};
