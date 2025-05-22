const RankRule = require('../models/RankRule');

const rankRuleController = {
  // Tạo mới một quy tắc xếp hạng
  createRankRule: async (req, res) => {
    try {
      const newRankRule = new RankRule(req.body);
      const savedRankRule = await newRankRule.save();
      res.status(201).json({
        message: 'Rank rule created successfully',
        data: savedRankRule,
      });
    } catch (error) {
      res.status(400).json({
        message: 'Error creating rank rule',
        error: error.message,
      });
    }
  },

  // Lấy danh sách tất cả quy tắc xếp hạng
  getAllRankRules: async (req, res) => {
    try {
      const rankRules = await RankRule.find().sort({ minOrderValue: 1 }); // Sắp xếp theo minOrderValue tăng dần
      res.status(200).json({ data: rankRules });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to get rank rules!',
        error: error.message,
      });
    }
  },

  // Lấy thông tin một quy tắc xếp hạng theo hạng
  getRankRuleByRank: async (req, res) => {
    try {
      const { rank } = req.params;
      const rankRule = await RankRule.findOne({ rank });

      if (!rankRule) {
        return res.status(404).json({ message: 'Rank rule not found!' });
      }

      res.status(200).json({ data: rankRule });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to get rank rule!',
        error: error.message,
      });
    }
  },

  // Cập nhật một quy tắc xếp hạng
  updateRankRule: async (req, res) => {
    try {
      const { rank } = req.params;
      const updatedRankRule = await RankRule.findOneAndUpdate(
        { rank },
        req.body,
        { new: true } // Trả về bản ghi đã cập nhật
      );

      if (!updatedRankRule) {
        return res.status(404).json({ message: 'Rank rule not found!' });
      }

      res.status(200).json({
        message: 'Rank rule updated successfully',
        data: updatedRankRule,
      });
    } catch (error) {
      res.status(400).json({
        message: 'Error updating rank rule',
        error: error.message,
      });
    }
  },

  // Xóa một quy tắc xếp hạng
  deleteRankRule: async (req, res) => {
    try {
      const { rank } = req.params;
      const deletedRankRule = await RankRule.findOneAndDelete({ rank });

      if (!deletedRankRule) {
        return res.status(404).json({ message: 'Rank rule not found!' });
      }

      res.status(200).json({
        message: 'Rank rule deleted successfully',
        data: deletedRankRule,
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error deleting rank rule',
        error: error.message,
      });
    }
  },
};

module.exports = rankRuleController;
