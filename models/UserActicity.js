const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  action: {
    type: String,
    enum: ['view', 'add to cart', 'like', 'purchase'],
    required: true,
    trim: true
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  },
});

const UserActivity = mongoose.model('UserActivity', userActivitySchema);

module.exports = UserActivity;
