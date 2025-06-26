const User = require('../models/User');

const userController = {
    // Đăng ký người dùng qua Email/Password
    registerEmailPassword: async (req, res) => {
        try {
            const { fullName, email, phone, dateOfBirth, userId, userType, avatar, address, gender } = req.body;

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
                gender
            });

            await newUser.save();
            res.status(201).json({ message: 'User registered successfully', user: newUser });
        } catch (error) {
            res.status(400).json({ message: 'Failed to register user', error: error.message });
        }
    },

    registerSocial: async (req, res) => {
        try{
            const {userId, email, fullName, userType} = req.body;
            let  user = await User.findOne({userId});
            if(user){
                user.fullName = fullNam;
                user.email = email;
                await user.save();
                res.status(201).json({ message: 'User registered successfully', user: user });
            }
            user = new User({
                userId,
                email,
                fullName: fullName,
                userType
            });

            await user.save();
            res.status(201).json({ message: 'User registered successfully', user: user });
        }catch(error){
            res.status(400).json({ message: 'Failed to register user', error: error.message });
        }
    },


    // Lấy thông tin loại người dùng (userType) qua userId
    getUserTypeByUserId: async (req, res) => {
        try {
            const { userId } = req.params;

            const user = await User.findOne({ userId }).populate('userType', 'name');
            if (user) {
                return res.status(200).json({ userType: user.userType.name });
            } else {
                return res.status(404).json({ message: 'User not found' });
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
                return res.status(200).json({ message: 'User updated successfully', user: updatedUser });
            } else {
                return res.status(404).json({ message: 'User not found' });
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
                return res.status(200).json({ message: 'User deleted successfully' });
            } else {
                return res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    // Lấy danh sách tất cả người dùng
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find().select('-__v'); // Loại bỏ trường không cần thiết
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
                return res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    updateFCMToken: async (req, res) => {
        try {
            const { userId, fcmToken } = req.body;
            
            await User.findOneAndUpdate({ userId }, { fcmToken });
            
            res.status(200).json({ message: 'FCM token updated successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error updating FCM token' });
        }
    }
};

module.exports = userController;
