/**
 * Middleware kiểm tra quyền truy cập
 * @param {Array} allowedRoles - danh sách quyền được phép
 */
exports.authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role)
        return res.status(403).json({ message: "Không xác định được quyền" });

      // Chuẩn hóa role: nhận string, mảng, object { tenRole/maRole/name }
      const slugify = (str = "") =>
        str
          .toString()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "")
          .trim();

      const normalize = (r) => {
        if (!r) return "";
        if (typeof r === "string") return slugify(r);
        if (typeof r === "object") {
          return (
            slugify(r.tenRole) ||
            slugify(r.maRole) ||
            slugify(r.name) ||
            slugify(r.code)
          );
        }
        return slugify(String(r));
      };

      const roleField = req.user.roles || req.user.role;
      const userRoles = Array.isArray(roleField)
        ? roleField.map(normalize)
        : [normalize(roleField)];

      const allowed = allowedRoles.map((r) => slugify(String(r)));

      const hasPermission = userRoles.some((r) => allowed.includes(r));
      if (!hasPermission)
        return res.status(403).json({ message: "Bạn không có quyền truy cập" });

      next();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
};