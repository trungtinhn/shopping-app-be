const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    phone: {
      type: String,
      match: /^[0-9]{10,15}$/,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null, // Giá trị mặc định nếu không được cung cấp
    },
    userId: {
      type: String,
      required: true,
      unique: true, // Đảm bảo userId là duy nhất
    },
    userType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    avatar: {
      type: String,
      default: "default_avatar_url", // URL ảnh đại diện mặc định
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    gender: {
      type: String,
      default: "",
    },
    fcmToken: {
        type: String,
        default: null
    },
}, { timestamps: true });
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
