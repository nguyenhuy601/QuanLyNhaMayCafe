/**
 * Middleware to check if the user has allowed roles
 * @param {string[]} allowedRoles - array of valid roles
 */
exports.authorizeRoles = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role)
      return res.status(403).json({ message: "User role not found" });

    const role = req.user.role.toLowerCase();
    const allowed = allowedRoles.includes(role);

    if (!allowed)
      return res.status(403).json({ message: "You are not authorized to perform this action" });

    next();
  };
};
