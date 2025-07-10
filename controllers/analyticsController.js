const mongoose = require('mongoose');
const UserActivity = require('../models/UserActivity');
const Product = require('../models/Product');

// Hàm tạo khoảng thời gian
const getDateRange = (period, startDate, endDate) => {
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : new Date();

  switch (period) {
    case 'day': start.setDate(start.getDate() - 30); break;
    case 'week': start.setDate(start.getDate() - 84); break;
    case 'month': start.setMonth(start.getMonth() - 12); break;
  }

  return { start, end };
};

const calculateGrowth = (stats) => {
  return stats.map((current, index) => {
    let growthRate = 0;
    if (index > 0) {
      const previous = stats[index - 1];
      growthRate = ((current.totalActivities - previous.totalActivities) / previous.totalActivities) * 100;
    }

    return {
      ...current,
      growthRate: Math.round(growthRate * 100) / 100,
      previousActivities: index > 0 ? stats[index - 1].totalActivities : 0
    };
  });
};

// ================= CONTROLLERS ===================

// 1. DAILY GROWTH
const getDailyGrowth = async (req, res) => {
  try {
    const { productId, startDate, endDate, action } = req.query;
    const { start, end } = getDateRange('day', startDate, endDate);

    const match = { timeStamp: { $gte: start, $lte: end } };
    if (productId) match.productId = new mongoose.Types.ObjectId(productId);
    if (action) match.action = action;

    const stats = await UserActivity.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$timeStamp' },
            month: { $month: '$timeStamp' },
            day: { $dayOfMonth: '$timeStamp' },
            productId: '$productId',
            action: '$action'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: '$_id.day'
              }
            },
            productId: '$_id.productId'
          },
          actions: { $push: { action: '$_id.action', count: '$count' } },
          totalActivities: { $sum: '$count' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    const result = calculateGrowth(stats);
    res.json({
      success: true,
      period: 'daily',
      data: result,
      summary: {
        totalDays: result.length,
        averageGrowthRate: result.reduce((sum, item) => sum + item.growthRate, 0) / result.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 2. WEEKLY GROWTH
const getWeeklyGrowth = async (req, res) => {
  try {
    const { productId, startDate, endDate, action } = req.query;
    const { start, end } = getDateRange('week', startDate, endDate);

    const match = { timeStamp: { $gte: start, $lte: end } };
    if (productId) match.productId = new mongoose.Types.ObjectId(productId);
    if (action) match.action = action;

    const stats = await UserActivity.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$timeStamp' },
            week: { $week: '$timeStamp' },
            productId: '$productId',
            action: '$action'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            week: '$_id.week',
            productId: '$_id.productId'
          },
          actions: { $push: { action: '$_id.action', count: '$count' } },
          totalActivities: { $sum: '$count' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);

    const result = calculateGrowth(stats);
    res.json({
      success: true,
      period: 'weekly',
      data: result,
      summary: {
        totalWeeks: result.length,
        averageGrowthRate: result.reduce((sum, item) => sum + item.growthRate, 0) / result.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3. MONTHLY GROWTH
const getMonthlyGrowth = async (req, res) => {
  try {
    const { productId, startDate, endDate, action } = req.query;
    const { start, end } = getDateRange('month', startDate, endDate);

    const match = { timeStamp: { $gte: start, $lte: end } };
    if (productId) match.productId = new mongoose.Types.ObjectId(productId);
    if (action) match.action = action;

    const stats = await UserActivity.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: '$timeStamp' },
            month: { $month: '$timeStamp' },
            productId: '$productId',
            action: '$action'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            year: '$_id.year',
            month: '$_id.month',
            productId: '$_id.productId'
          },
          actions: { $push: { action: '$_id.action', count: '$count' } },
          totalActivities: { $sum: '$count' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const result = calculateGrowth(stats);
    res.json({
      success: true,
      period: 'monthly',
      data: result,
      summary: {
        totalMonths: result.length,
        averageGrowthRate: result.reduce((sum, item) => sum + item.growthRate, 0) / result.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 4. PRODUCT OVERVIEW
const getProductOverview = async (req, res) => {
  try {
    const { productId, period = '30' } = req.query;
    const daysBack = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const match = { timeStamp: { $gte: startDate } };
    if (productId) match.productId = new mongoose.Types.ObjectId(productId);

    const stats = await UserActivity.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            productId: '$productId',
            action: '$action'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.productId',
          actions: { $push: { action: '$_id.action', count: '$count' } },
          totalActivities: { $sum: '$count' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $sort: { totalActivities: -1 } }
    ]);

    res.json({
      success: true,
      period: `${daysBack} days`,
      data: stats,
      summary: {
        totalProducts: stats.length,
        totalActivities: stats.reduce((sum, item) => sum + item.totalActivities, 0)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. TOP GROWING PRODUCTS
const getTopGrowingProducts = async (req, res) => {
  try {
    const { period = 'weekly', limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    let currentStart;
    if (period === 'daily') currentStart = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    else if (period === 'weekly') currentStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    else currentStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const previousStart = new Date(currentStart);
    if (period === 'daily') previousStart.setDate(previousStart.getDate() - 1);
    else if (period === 'weekly') previousStart.setDate(previousStart.getDate() - 7);
    else previousStart.setMonth(previousStart.getMonth() - 1);

    const currentData = await UserActivity.aggregate([
      { $match: { timeStamp: { $gte: currentStart } } },
      { $group: { _id: '$productId', currentCount: { $sum: 1 } } }
    ]);

    const previousData = await UserActivity.aggregate([
      { $match: { timeStamp: { $gte: previousStart, $lt: currentStart } } },
      { $group: { _id: '$productId', previousCount: { $sum: 1 } } }
    ]);

    const growthMap = new Map();
    currentData.forEach(current => {
      const previous = previousData.find(p => p._id.toString() === current._id.toString());
      const prevCount = previous ? previous.previousCount : 0;
      const growthRate = prevCount > 0 ? ((current.currentCount - prevCount) / prevCount) * 100 : 100;

      growthMap.set(current._id.toString(), {
        productId: current._id,
        currentCount: current.currentCount,
        previousCount: prevCount,
        growthRate: Math.round(growthRate * 100) / 100
      });
    });

    const sortedGrowth = Array.from(growthMap.values())
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, limitNum);

    const populated = await Promise.all(
      sortedGrowth.map(async (item) => {
        const product = await Product.findById(item.productId);
        return { ...item, product };
      })
    );

    res.json({
      success: true,
      period,
      data: populated,
      summary: {
        totalProducts: populated.length,
        averageGrowthRate: populated.reduce((sum, item) => sum + item.growthRate, 0) / populated.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getDailyGrowth,
  getWeeklyGrowth,
  getMonthlyGrowth,
  getProductOverview,
  getTopGrowingProducts
};
