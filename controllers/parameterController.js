const Parameter = require('../models/Parameter');


const parameterController = {
  getParameter : async (req, res) => {
    try {
      const parameter = await Parameter.findOne({});
      res.json(parameter);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  updateParameter : async (req, res) => {
    try {
      const parameter = await Parameter.findOne({});
      if (!parameter) {
        return res.status(404).json({ message: 'Parameter not found' });
      }
      parameter.shippingFee = req.body.shippingFee;
      parameter.minimumQuantity = req.body.minimumQuantity;
      await parameter.save();
      res.json(parameter);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = parameterController
