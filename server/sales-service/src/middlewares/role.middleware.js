/**
 * Middleware kiểm tra quyền người dùng
 * @param {string[]} allowedRoles - danh sách quyền hợp lệ
 */
exports.authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    console.log('Checking roles:', { 
      allowedRoles, 
      userRole: req.user?.role,
      userRoles: req.user?.roles 
    });

    if (!req.user) {
      return res.status(403).json({ message: "Không xác định được thông tin người dùng" });
    }

    const normalize = (value) =>
      typeof value === "string" ? value.toLowerCase() : "";

    const allowed = allowedRoles.map(normalize);
    const userRole = normalize(req.user.role);
    const userRoles = (req.user.roles || []).map(normalize);
    
    const hasRole = allowed.some(role => 
      role === userRole || userRoles.includes(role)
    );

    if (!hasRole) {
      console.log('Access denied. User roles do not match required roles');
      return res.status(403).json({ 
        message: "Bạn không có quyền thực hiện thao tác này",
        required: allowedRoles,
        userRole: req.user.role,
        userRoles: req.user.roles
      });
    }

    console.log('Role check passed');
    next();
  };
};
