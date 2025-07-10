const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    ghnShopId: {
        type: Number,
        default: null, // được lưu sau khi đăng ký với GHN
    },      
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      match: /^[0-9]{10,15}$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    image: {
      type: String,
      default: 'default_image_url',
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended, rejected'],
      default: 'pending',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // ⭐ Tọa độ hiển thị bản đồ
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },

    // ⭐ Thông tin địa chỉ chuẩn hoá để tích hợp API GHN
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

    // ⭐ Lưu tên hiển thị để show cho người dùng
    provinceName: {
      type: String,
    },
    districtName: {
      type: String,
    },
    wardName: {
      type: String,
    },

    // ⭐ Đánh giá cửa hàng
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {timestamps: true},
);

module.exports = mongoose.model('Store', storeSchema);
