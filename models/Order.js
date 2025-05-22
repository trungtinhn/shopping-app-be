const mongoose = require('mongoose');

const OrderProductSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true },
  image: { type: [String], required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  variant: {
    sku: { type: String }, // Mã định danh biến thể
    attributes: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true }
      }
    ]
  },
  weight: { type: Number, required: true }, // gram
  height: { type: Number, required: true }, // cm
  length: { type: Number, required: true }, // cm
  width: { type: Number, required: true }   // cm
});

const OrderSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  ward: { type: String, required: true },

  promotionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion'
  },
  storePromotionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StorePromotion'
  },

  products: [OrderProductSchema],
  discount: { type: Number, required: true },
  deliveryFees: { type: Number, required: true },
  paymentMethod: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  totalProduct: { type: Number, required: true },

  // Trạng thái nội bộ
  status: {
    type: String,
    enum: ['Confirm', 'On Wait', 'Delivering', 'Delivered', 'Cancel'],
    default: 'Confirm'
  },

  // Trạng thái từ GHN
  shippingStatus: {
    type: String // Ví dụ: 'ready_to_pick', 'delivering', 'returned', v.v.
  }

}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
