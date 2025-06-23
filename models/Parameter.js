const mongoose = require('mongoose');

// Định nghĩa Schema cho bảng tham số
const parameterSchema = new mongoose.Schema({
  commissonFee: {
    type: Number,
    required: true
  }
});

// Tạo model từ Schema
const Parameter = mongoose.model('Parameter', parameterSchema);

// Export model để sử dụng ở nơi khác trong ứng dụng
module.exports = Parameter;
