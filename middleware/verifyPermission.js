const User = require("../models/User");
const Role = require("../models/Role");

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userRecord = await User.findOne({ userId: req.user.uid }).populate('role');
      if (!userRecord) return res.status(404).json({ message: "User not found" });

      const permissions = userRecord.role?.permissions || [];

      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      req.userDetail = userRecord; // Lưu lại để dùng ở route handler nếu cần
      next();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  };
};

module.exports = checkPermission;
