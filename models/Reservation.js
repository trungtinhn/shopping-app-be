const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  storeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, required: true },
      sku: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  promotionId: { type: mongoose.Schema.Types.ObjectId },
  storePromotionId: { type: mongoose.Schema.Types.ObjectId },
  paymentMethod: { type: String, enum: ['VNPay', 'Stripe'], required: true },
  status: { type: String, enum: ['Pending', 'Completed', 'Cancelled'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now, expires: 900 }, // Hết hạn sau 15 phút
});

const Reservation = mongoose.model('Reservation', ReservationSchema);
module.exports = Reservation;