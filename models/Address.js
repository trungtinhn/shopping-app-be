const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true
    },
    userID: {
        type: String,
        required: true
    },
    ward: {
        type: String,
        required: true
    },
    district: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    buyerName: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    provinceId: {
      type: Number,
      required: true,
    },
    districtId: {
      type: Number,
      required: true,
    },
    wardCode: {
      type: String,
      required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
