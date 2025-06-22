// models/Role.js
const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // e.g., 'admin_app', 'admin_shop'
  },
  displayName: {
    type: String,
    required: true, // e.g., 'Admin Add', 'Admin Shop'
  },
  permissions: {
    type: [String], // e.g., ['create_user', 'delete_user', 'view_report']
    default: [],
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    default: "",
  }
}, { timestamps: true });

module.exports = mongoose.model("Role", RoleSchema);
