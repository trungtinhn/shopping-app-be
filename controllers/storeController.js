const Store = require("../models/Store");
const addressService = require("../services/addressService");
const ghnService = require("../services/ghnServices");
const Order = require("../models/Order");
const Conversation = require("../models/Conversation");
const Product = require("../models/Product");
const User = require("../models/User");
const mongoose = require("mongoose");
const { sendStoreApprovalEmail } = require("../services/emailService");
const storeController = {
  addStore: async (req, res) => {
    try {
      const {
        name,
        address,
        phoneNumber,
        email,
        description,
        image,
        status,
        ownerId,
        latitude,
        longitude,
        provinceName,
        districtName,
        wardName,
      } = req.body;
      const addressIds = await addressService.resolveFullAddress({
        provinceName,
        districtName,
        wardName,
      });

      const newStore = new Store({
        name,
        address,
        phoneNumber,
        email,
        description,
        image,
        status,
        ownerId,
        latitude,
        longitude,
        ...addressIds, // spread dữ liệu từ service
      });

      await newStore.save();
      res
        .status(201)
        .json({ message: "Store created successfully", store: newStore });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getAllStores: async (req, res) => {
    try {
      const stores = await Store.find();
      res.status(200).json(stores);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getStoreById: async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
      res.status(200).json(store);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateStore: async (req, res) => {
    try {
      const updatedStore = await Store.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!updatedStore) {
        return res.status(404).json({ error: "Store not found" });
      }
      res
        .status(200)
        .json({ message: "Store updated successfully", store: updatedStore });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  approveStore: async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);
      if (!store) return res.status(404).json({ message: "Store not found" });

      if (store.status === "active") {
        return res.status(400).json({ message: "Store is already approved" });
      }

      const ghnResponse = await ghnService.registerGHNShop(store);
      if (ghnResponse.code !== 200 || !ghnResponse.data?.shop_id) {
        return res
          .status(400)
          .json({ message: "GHN registration failed", ghnResponse });
      }

      store.ghnShopId = ghnResponse.data.shop_id;
      store.status = "active";
      await store.save();

      // GỬI EMAIL THÔNG BÁO DUYỆT CỬA HÀNG
      const emailData = {
        email: store.email,
        storeName: store.name || store.storeName,
        storeId: store._id,
      };

      const emailResult = await sendStoreApprovalEmail(emailData);

      if (emailResult.success) {
        console.log("Store approval email sent successfully");
      } else {
        console.error(
          "Failed to send store approval email:",
          emailResult.error
        );
        // Không return error để không ảnh hưởng đến việc duyệt store
      }

      res.status(200).json({
        message: "Store approved and registered with GHN",
        store,
        emailSent: emailResult.success,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteStore: async (req, res) => {
    try {
      const deletedStore = await Store.findByIdAndDelete(req.params.id);
      if (!deletedStore) {
        return res.status(404).json({ error: "Store not found" });
      }
      res.status(200).json({ message: "Store deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getStoreOverview: async (req, res) => {
    try {
      const storeId = req.params.storeId;

      // Tổng số đơn hàng của cửa hàng
      const totalOrders = await Order.countDocuments({ storeId });

      // Tổng số tin nhắn của cửa hàng
      const totalMessages = await Conversation.countDocuments({
        shop_id: storeId,
      });

      // Tổng số sản phẩm của cửa hàng
      const totalProducts = await Product.countDocuments({ storeId });

      // Tổng thu nhập (giả sử Order có trường totalPrice)
      const orders = await Order.find({ storeId });
      const totalIncome = orders.reduce(
        (sum, order) => sum + (order.totalPrice || 0),
        0
      );

      res.status(200).json({
        totalOrders,
        totalMessages,
        totalProducts,
        totalIncome,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getStoreMonthlyStats: async (req, res) => {
    try {
      const { month, year } = req.query;
      const { storeId } = req.params;
      if (!month || !year) {
        return res.status(400).json({ error: "Month and year are required" });
      }

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // Last day of the month
      const daysInMonth = endDate.getDate();

      // Initialize arrays for daily data
      const dailyRevenue = [];
      const dailyStats = [];

      // Aggregate daily data for the specific store
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStart = new Date(year, month - 1, day);
        const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999);

        const [revenueData, newProducts, newEmployees] = await Promise.all([
          // Revenue from orders of this store
          Order.aggregate([
            {
              $match: {
                storeId: new mongoose.Types.ObjectId(storeId),
                createdAt: { $gte: dayStart, $lte: dayEnd },
                status: "Completed", // Only completed orders count
              },
            },
            {
              $group: {
                _id: null,
                total: { $sum: "$totalPrice" },
              },
            },
          ]),
        ]);

        dailyRevenue.push({
          day,
          revenue: revenueData[0]?.total || 0,
        });
      }

      // Get today's data (or last day of selected month if not current month)
      const today = new Date();
      const isCurrentMonth =
        parseInt(month) === today.getMonth() + 1 &&
        parseInt(year) === today.getFullYear();

      const lastDayIndex = isCurrentMonth
        ? Math.min(today.getDate() - 1, dailyRevenue.length - 1)
        : dailyRevenue.length - 1;

      res.json({
        dailyRevenue,
        todayRevenue: `${dailyRevenue[lastDayIndex].revenue.toLocaleString(
          "vi-VN"
        )} VND`,
      });
    } catch (error) {
      console.error("Error in getStoreMonthlyStats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};

module.exports = storeController;
