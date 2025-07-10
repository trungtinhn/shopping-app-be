const Role = require("../models/Role");

const roleController = {
  // ➕ Tạo mới role
  create: async (req, res) => {
    try {
      const { name, displayName, permissions } = req.body;

      if (!name || !displayName) {
        return res
          .status(400)
          .json({ message: "Name and displayName are required." });
      }

      const existing = await Role.findOne({ name });
      if (existing) {
        return res.status(409).json({ message: "Role already exists." });
      }

      const role = new Role({ name, displayName, permissions });
      const saved = await role.save();
      return res.status(201).json(saved);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Error creating role", error: err });
    }
  },

  // 📋 Lấy tất cả roles
  getAll: async (req, res) => {
    try {
      const roles = await Role.find();
      return res.status(200).json(roles);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Error fetching roles", error: err });
    }
  },

  // 🔍 Lấy 1 role theo ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const role = await Role.findById(id);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      return res.status(200).json(role);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Error fetching role", error: err });
    }
  },

  // ✏️ Cập nhật role
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, displayName, permissions } = req.body;
      const updated = await Role.findByIdAndUpdate(
        id,
        { name, displayName, permissions },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Role not found" });
      }

      return res.status(200).json(updated);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Error updating role", error: err });
    }
  },

  // 🗑️ Xoá role
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await Role.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: "Role not found" });
      }
      return res.status(200).json({ message: "Role deleted successfully" });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Error deleting role", error: err });
    }
  },
  getStaffRole: async (req, res) => {
    try {
      const { storeId } = req.params;

      if (!storeId) {
        return res.status(400).json({
          status: 400,
          message: "StoreId is required",
        });
      }

      // Tìm role admin_staff của store
      const staffRole = await Role.findOne({
        storeId: storeId,
        name: "admin_staff",
      }).select("_id name displayName permissions updatedAt");

      if (!staffRole) {
        return res.status(404).json({
          status: 404,
          message: "Staff role not found for this store",
          data: null,
        });
      }

      return res.status(200).json({
        status: 200,
        data: staffRole,
        message: "Staff role found successfully",
      });
    } catch (error) {
      console.error("Error getting staff role:", error);
      return res.status(500).json({
        status: 500,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
  checkStaffRole: async (req, res) => {
    try {
      const { storeId } = req.params;

      if (!storeId) {
        return res.status(400).json({
          status: 400,
          message: "StoreId is required",
        });
      }

      // Kiểm tra xem có role admin_staff không
      const staffRoleExists = await Role.exists({
        storeId: storeId,
        name: "admin_staff",
      });

      return res.status(200).json({
        status: 200,
        data: {
          hasStaffRole: !!staffRoleExists,
          storeId: storeId,
        },
        message: staffRoleExists ? "Staff role exists" : "Staff role not found",
      });
    } catch (error) {
      console.error("Error checking staff role:", error);
      return res.status(500).json({
        status: 500,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = roleController;
