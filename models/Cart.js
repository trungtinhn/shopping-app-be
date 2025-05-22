const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variantId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true // ID của biến thể cụ thể
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String, // 1 ảnh đại diện của biến thể hoặc sản phẩm
    required: true
  },
  attributes: [
    {
      name: { type: String, required: true }, // Ví dụ: Color
      value: { type: String, required: true } // Ví dụ: Red
    }
  ],
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  }
});

const CartSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  products: [CartItemSchema]
});

module.exports = mongoose.model('Cart', CartSchema);
