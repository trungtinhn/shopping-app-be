const mongoose = require('mongoose');

const ShippingStatusSchema = new mongoose.Schema({
    status: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ShippingStatus', ShippingStatusSchema);
