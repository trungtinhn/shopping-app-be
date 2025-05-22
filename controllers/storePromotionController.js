const StorePromotion = require('../models/StorePromotion');

const storePromotionController = {
  createstorePromotion: async (req, res) => {
    try {
      const newPromotion = new StorePromotion(req.body);
      const savedPromotion = await newPromotion.save();
      res.status(201).json({
        message: 'Promotion created successfully',
        data: savedPromotion,
      });
    } catch (error) {
      res
        .status(400)
        .json({message: 'Error creating promotion', error: error.message});
    }
  },
  getBystoreId: async (req, res) => {
    const {storeId} = req.params;

    try {
      const promotions = await StorePromotion.find({storeId, isActive: true});
      res.status(200).json({success: true, promotions});
    } catch (error) {
      res
        .status(500)
        .json({success: false, message: 'Error fetching promotions', error});
    }
  },
  getAllPromotions: async (req, res) => {
    try {
      const promotions = await StorePromotion.find();
      res.status(200).json({data: promotions});
    } catch (error) {
      res.status(500).json({message: 'Failed to get promotions!', error});
    }
  },
  getPromotionCurrent: async (req, res) => {
    try {
      const currentDate = new Date();
      const promotions = await StorePromotion.find({
        startDate: {$lte: currentDate},
        endDate: {$gte: currentDate},
        remainingUses: {$gt: 0},
      });

      if (!promotions.length) {
        return res.status(404).json({message: 'No current promotions found!'});
      }

      res.status(200).json({data: promotions});
    } catch (error) {
      res
        .status(500)
        .json({message: 'Failed to get current promotions!', error});
    }
  },

  checkPromotion: async (req, res) => {
    try {
      const {id} = req.params;
      const promotion = await StorePromotion.findOne({
        _id: id,
        startDate: {$lte: new Date()},
        endDate: {$gte: new Date()},
        remainingUses: {$gt: 0},
      });

      if (!promotion) {
        return res
          .status(404)
          .json({message: 'Promotion not found or not valid!'});
      }

      res.status(200).json({data: promotion});
    } catch (error) {
      res.status(500).json({message: 'Failed to check promotion!', error});
    }
  },
};

module.exports = storePromotionController;
