const Rank = require('../models/Rank');
const RankRule = require('../models/RankRule');

const rankController = {
  // Tạo hoặc cập nhật thông tin xếp hạng của khách hàng
  upsertRank: async (req, res) => {
    try {
      const { userId, orderValue } = req.body;

      if (!userId || typeof orderValue !== 'number') {
        return res.status(400).json({ message: 'userId and orderValue are required!' });
      }

      // Lấy toàn bộ quy tắc xếp hạng, sắp xếp theo `minOrderValue` tăng dần
      const rankRules = await RankRule.find().sort({ minOrderValue: 1 });

      if (!rankRules.length) {
        return res.status(500).json({ message: 'No rank rules found!' });
      }

      // Tìm hoặc tạo mới xếp hạng
      const rank = await Rank.findOneAndUpdate(
        { userId },
        { $inc: { totalOrderValue: orderValue } }, // Cộng dồn giá trị đơn hàng
        { new: true, upsert: true } // Tạo mới nếu chưa tồn tại
      );

      // Xác định rank mới dựa trên totalOrderValue
      const newRank = determineRank(rank.totalOrderValue, rankRules);

      // Cập nhật rank
      rank.rank = newRank;
      rank.lastUpdated = Date.now();
      await rank.save();

      res.status(200).json({ message: 'Rank updated successfully', data: rank });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update rank!', error: error.message });
    }
  },

  // Lấy thông tin xếp hạng của một khách hàng
  getRankByUserId: async (req, res) => {
    console.log("Hello");
    try {
      const { userId } = req.params;

      const rank = await Rank.findOne({ userId });

      if (!rank) {
        return res.status(404).json({ message: 'Rank not found!' });
      }

      res.status(200).json({ data: rank });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get rank!', error: error.message });
    }
  },

  // Lấy danh sách tất cả xếp hạng
  getAllRanks: async (req, res) => {
    try {
      const ranks = await Rank.find().sort({ totalOrderValue: -1 }); // Sắp xếp theo giá trị đơn hàng giảm dần
      res.status(200).json({ data: ranks });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get all ranks!', error: error.message });
    }
  },
};

// Hàm xác định rank dựa trên `totalOrderValue` và danh sách quy tắc
const determineRank = (totalOrderValue, rankRules) => {
  for (const rule of rankRules) {
    if (
      totalOrderValue >= rule.minOrderValue &&
      (rule.maxOrderValue === undefined || totalOrderValue <= rule.maxOrderValue)
    ) {
      return rule.rank;
    }
  }
  return 'Bronze'; // Mặc định nếu không khớp với quy tắc nào
};

module.exports = rankController;
