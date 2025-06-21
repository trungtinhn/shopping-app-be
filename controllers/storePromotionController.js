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
  deletePromotion: async (req, res) => {
    const {id} = req.params;
    try {
      const deletedPromotion = await StorePromotion.findByIdAndDelete(id);
      if (!deletedPromotion) {
        return res
          .status(404)
          .json({message: 'Promotion not found or already deleted!'});
      }
      res.status(200).json({
        message: 'Promotion deleted successfully',
        data: deletedPromotion,
      });
    } catch (error) {
      res.status(500).json({message: 'Failed to delete promotion!', error});
    }
  },
  updatePromotion: async (req, res) => {
    const {id} = req.params;
    try {
      const updatedPromotion = await StorePromotion.findByIdAndUpdate(
        id,
        req.body,
        {new: true}
      );
      if (!updatedPromotion) {
        return res
          .status(404)
          .json({message: 'Promotion not found or already deleted!'});
      }
      res.status(200).json({
        message: 'Promotion updated successfully',
        data: updatedPromotion,
      });
    } catch (error) {
      res.status(500).json({message: 'Failed to update promotion!', error});
    }
  },
  getBystoreId: async (req, res) => {
    const {storeId} = req.params;
    try {
      const promotions = await StorePromotion.find({ storeId });
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
      const { storeId } = req.query;
      const currentDate = new Date();

      const promotions = await StorePromotion.find({
        storeId,
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
        quantityAvailable: { $gt: 0 },
        isActive: true,
      });

      if (!promotions.length) {
        return res.status(404).json({ message: 'No current promotions found!' });
      }

      res.status(200).json({ data: promotions });
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Failed to get current promotions!', error });
    }
  },
  updatePromotionStatus: async (req, res) => {
    const {id} = req.params;
    const {isActive} = req.body;
    try {
      const updatedPromotion = await StorePromotion.findByIdAndUpdate(
        id,
        {isActive},
        {new: true}
      );
      if (!updatedPromotion) {
        return res
          .status(404)
          .json({message: 'Promotion not found or already deleted!'});
      }
      res.status(200).json({
        message: 'Promotion status updated successfully',
        data: updatedPromotion,
      });
    } catch (error) {
      res.status(500).json({message: 'Failed to update promotion status!', error});
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
