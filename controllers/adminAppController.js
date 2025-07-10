const User = require("../models/User");
const Store = require("../models/Store");
const Order = require("../models/Order");
const Product = require("../models/Product");

const adminAppController = {
  getSystemOverview: async (req, res) => {
    try {
      const users = await User.countDocuments(); //
      const stores = await Store.countDocuments();
      const orders = await Order.countDocuments();
      const products = await Product.countDocuments();
      res.status(200).json({ users, stores, orders, products });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getMonthlyStats: async (req, res) => {
    try {
      const { month, year } = req.query;
      if (!month || !year) {
        return res.status(400).json({ error: "Month and year are required" });
      }

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of the month
      const daysInMonth = endDate.getDate();

      // Initialize arrays for daily data
      const dailyRevenue = [];
      const dailyStats = [];

      // Aggregate daily data
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStart = new Date(year, month - 1, day);
        const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

        const [revenueData, userData, productData, storeData] =
          await Promise.all([
            // Revenue from orders
            Order.aggregate([
              {
                $match: {
                  createdAt: { $gte: dayStart, $lte: dayEnd },
                  status: "Completed", // Assuming only completed orders count towards revenue
                },
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$totalPrice" }, // Assuming totalAmount field in Order
                },
              },
            ]),
            // New users
            User.countDocuments({
              createdAt: { $gte: dayStart, $lte: dayEnd },
            }),
            // New products
            Product.countDocuments({
              createdAt: { $gte: dayStart, $lte: dayEnd },
            }),
            // New stores
            Store.countDocuments({
              createdAt: { $gte: dayStart, $lte: dayEnd },
            }),
          ]);

        dailyRevenue.push({
          day,
          revenue: revenueData[0]?.total || 0,
        });

        dailyStats.push({
          day,
          newUsers: userData,
          newProducts: productData,
          newStores: storeData,
        });
      }

      // Get today's data (or last day of selected month if not current month)
      const today = new Date();
      const isCurrentMonth =
        parseInt(month) === today.getMonth() + 1 &&
        parseInt(year) === today.getFullYear();
      const lastDayIndex = isCurrentMonth
        ? Math.min(today.getDate() - 1, dailyStats.length - 1)
        : dailyStats.length - 1;

      res.json({
        dailyRevenue,
        dailyStats,
        todayRevenue: `${dailyRevenue[lastDayIndex].revenue.toLocaleString(
          "vi-VN"
        )} VND`,
        todayNewUsers: dailyStats[lastDayIndex].newUsers,
        todayNewProducts: dailyStats[lastDayIndex].newProducts,
        todayNewStores: dailyStats[lastDayIndex].newStores,
      });
    } catch (error) {
      console.error("Error in getMonthlyStats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = adminAppController;
