const User = require("../models/User");
const admin = require("../config/firebase-admin");
const Role = require("../models/Role"); // Assuming you have a Role model for user types
const userController = {
  // Đăng ký người dùng qua Email/Password
  registerEmailPassword: async (req, res) => {
    try {
      const {
        fullName,
        email,
        phone,
        dateOfBirth,
        userId,
        userType,
        avatar,
        address,
        gender,
      } = req.body;

      // Tạo người dùng mới
      const newUser = new User({
        fullName,
        email,
        phone,
        dateOfBirth,
        userId,
        userType,
        avatar,
        address,
        gender,
      });

      await newUser.save();
      res
        .status(201)
        .json({ message: "User registered successfully", user: newUser });
    } catch (error) {
      res
        .status(400)
        .json({ message: "Failed to register user", error: error.message });
    }
  },

  registerSocial: async (req, res) => {
    try {
      const { userId, email, fullName, userType } = req.body;
      let user = await User.findOne({ userId });
      if (user) {
        user.fullName = fullNam;
        user.email = email;
        await user.save();
        res
          .status(201)
          .json({ message: "User registered successfully", user: user });
      }
      user = new User({
        userId,
        email,
        fullName: fullName,
        userType,
      });

      await user.save();
      res
        .status(201)
        .json({ message: "User registered successfully", user: user });
    } catch (error) {
      res
        .status(400)
        .json({ message: "Failed to register user", error: error.message });
    }
  },

  // Lấy thông tin loại người dùng (userType) qua userId
  getUserTypeByUserId: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findOne({ userId }).populate("userType", "name");
      if (user) {
        return res.status(200).json({ userType: user.userType.name });
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // Cập nhật thông tin người dùng
  updateUser: async (req, res) => {
    try {
      const { userId } = req.params;

      const updatedUser = await User.findOneAndUpdate(
        { userId },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (updatedUser) {
        return res
          .status(200)
          .json({ message: "User updated successfully", user: updatedUser });
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // Xóa người dùng
  deleteUser: async (req, res) => {
    try {
      const { userId } = req.params;

      const deletedUser = await User.findOneAndDelete({ userId });
      if (deletedUser) {
        return res.status(200).json({ message: "User deleted successfully" });
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // Lấy danh sách tất cả người dùng
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select("-__v"); // Loại bỏ trường không cần thiết
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  // Lấy thông tin người dùng hiện tại qua userId
  getCurrentUserData: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findOne({ userId });
      if (user) {
        return res.status(200).json(user);
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  createEmployee: async (req, res) => {
    try {
      const {
        fullName,
        email,
        phone,
        dateOfBirth,
        avatar,
        address,
        gender,
        storeId,
        password,
      } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!fullName || !email || !password) {
        return res.status(400).json({
          message:
            "Vui lòng cung cấp đầy đủ thông tin: fullName, email, password",
        });
      }

      // Kiểm tra email đã tồn tại trong database chưa
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: "Email đã được sử dụng trong hệ thống",
        });
      }

      // Kiểm tra userType admin_staff cho cửa hàng
      const userType = await Role.findOne({ storeId, name: "admin_staff" });
      if (!userType) {
        return res.status(404).json({
          message: "Không tìm thấy userType admin_staff cho cửa hàng này.",
        });
      }

      // Tạo user trên Firebase Authentication bằng Admin SDK
      const firebaseUser = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: fullName,
        emailVerified: false,
      });

      // Tạo user record trong MongoDB
      const newEmployee = new User({
        fullName,
        email,
        phone,
        dateOfBirth,
        userId: firebaseUser.uid,
        userType: userType._id,
        storeId,
        avatar,
        address,
        gender,
        isActive: true,
      });

      await newEmployee.save();

      // Trả về thông tin (không trả về password)
      const responseData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        user: {
          ...newEmployee.toObject(),
          password: undefined,
        },
      };

      res.status(201).json({
        message: "Tạo tài khoản nhân viên thành công",
        employee: responseData,
      });
    } catch (error) {
      console.error("Error creating employee:", error);

      // Xử lý các lỗi cụ thể từ Firebase
      if (error.code === "auth/email-already-exists") {
        return res.status(400).json({
          message: "Email đã được sử dụng trên Firebase",
        });
      }

      if (error.code === "auth/invalid-email") {
        return res.status(400).json({
          message: "Email không hợp lệ",
        });
      }

      if (error.code === "auth/weak-password") {
        return res.status(400).json({
          message: "Mật khẩu quá yếu (ít nhất 6 ký tự)",
        });
      }

      res.status(500).json({
        message: "Lỗi khi tạo tài khoản nhân viên",
        error: error.message,
      });
    }
  },
  getStaffsByStoreId: async (req, res) => {
    try {
      const { storeId } = req.params;

      // Tìm tất cả nhân viên thuộc cửa hàng này và populate userType
      const staffs = await User.find({ storeId }).populate(
        "userType",
        "name displayName"
      );
      // Lọc ra các nhân viên có userType.name là admin_staff
      const adminStaffs = staffs.filter(
        (staff) => staff.userType?.name === "admin_staff"
      );

      if (adminStaffs.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy nhân viên nào có vai trò admin_staff",
        });
      }

      return res.status(200).json(adminStaffs);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
  updateStoreId: async (req, res) => {
    try {
      const { userId } = req.params;
      const { storeId } = req.body;

      if (!storeId) {
        return res
          .status(400)
          .json({ message: "Thiếu storeId trong yêu cầu." });
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { $set: { storeId } },
        { new: true, runValidators: true }
      );

      if (updatedUser) {
        return res.status(200).json({
          message: "Cập nhật storeId thành công.",
          user: updatedUser,
        });
      } else {
        return res.status(404).json({ message: "Không tìm thấy người dùng." });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  updateFCMToken: async (req, res) => {
    try {
      const { userId, fcmToken } = req.body;

      await User.findOneAndUpdate({ userId }, { fcmToken });

      res.status(200).json({ message: "FCM token updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating FCM token" });
    }
  },
};

module.exports = userController;
