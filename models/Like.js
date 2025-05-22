const mongoose = require('mongoose');

// Định nghĩa schema cho model YeuThich
const LikeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  productList: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product' // Tham chiếu tới model SanPham
  }]
});



const Like = mongoose.model('Like', LikeSchema);


module.exports = Like;
