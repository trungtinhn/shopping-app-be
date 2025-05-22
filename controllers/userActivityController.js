const UserActivity = require('../models/UserActicity');

const userActivityController = {
    // ➕ Tạo mới user activity
    create: async (req, res) => {
        try {
            const { userId, productId, action } = req.body;

            if (!userId || !productId || !action) {
                return res.status(400).json({ message: 'Missing required fields.' });
            }

            const newActivity = new UserActivity({ userId, productId, action });
            const saved = await newActivity.save();
            return res.status(201).json(saved);
            } catch (error) {
            return res.status(500).json({ message: 'Error creating activity', error });
        }
    },

    // 📥 Lấy tất cả activity (có thể lọc theo userId và action)
    getAll: async (req, res) => {
        try {
            const { userId, action } = req.query;
            const filter = {};
            if (userId) filter.userId = userId;
            if (action) filter.action = action;

            const activities = await UserActivity.find(filter)
                .populate('userId', 'name email')
                .populate('productId', 'name price');

            return res.status(200).json(activities);
            } catch (error) {
            return res.status(500).json({ message: 'Error fetching activities', error });
        }
    },

    // 📄 Lấy activity theo ID
    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const activity = await UserActivity.findById(id)
                .populate('userId', 'name email')
                .populate('productId', 'name price');

            if (!activity) {
                return res.status(404).json({ message: 'Activity not found' });
            }

            return res.status(200).json(activity);
            } catch (error) {
            return res.status(500).json({ message: 'Error fetching activity', error });
        }
    },

    // 🗑️ Xoá activity theo ID
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const deleted = await UserActivity.findByIdAndDelete(id);

            if (!deleted) {
                return res.status(404).json({ message: 'Activity not found' });
            }

            return res.status(200).json({ message: 'Deleted successfully' });
            } catch (error) {
            return res.status(500).json({ message: 'Error deleting activity', error });
        }
    }
};

module.exports = userActivityController;
