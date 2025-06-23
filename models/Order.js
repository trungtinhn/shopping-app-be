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
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
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
  ghnOrderCode: { type: String },
  userId: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  ward: { type: String, required: true },
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  estimatedDate: { type: String},

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
    enum: [
      'Pending',       // Chờ xác nhận
      'WaitingPickup', // Chờ lấy hàng
      'Shipping',      // Chờ giao hàng / đang giao
      'Completed',     // Đã giao
      'Returned',      // Trả hàng
      'Cancelled'      // Đã hủy
    ],
    default: 'Pending'
  },

  // Trạng thái từ GHN
  shippingStatus: {
    type: String // Ví dụ: 'ready_to_pick', 'delivering', 'returned', v.v.
  },

  journeyLog: [
    {
      status: { type: String, required: true }, // Trạng thái từ GHN
      updated_date: { type: Date, required: true }, // Thời gian cập nhật
    }
  ],
  isRating: {
    type: Boolean,
    default: false
  },

}, { timestamps: true });

const Order = mongoose.model('Order', OrderSchema);
module.exports = Order;
