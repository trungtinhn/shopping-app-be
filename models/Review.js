const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    images: {
        type: [String], // Mảng các URL hình ảnh
        default: [], // Mặc định là mảng rỗng nếu không có hình ảnh
    },
    userId: {
        type: String,
        required: true,
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // Tham chiếu đến bảng Product
        required: true,
    },
    content: {
        type: String,
        required: true,
        trim: true, // Loại bỏ khoảng trắng đầu và cuối
        maxlength: 1000, // Giới hạn độ dài nội dung
    },
    reviewDate: {
        type: Date,
        default: Date.now, // Mặc định là thời điểm hiện tại
    },
    rating: {
        type: Number,
        required: true,
        min: 1, // Giá trị tối thiểu là 1
        max: 5, // Giá trị tối đa là 5
    },
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store', // Tham chiếu đến bảng Store
        default: null, // Giá trị mặc định là null nếu không liên quan tới cửa hàng
    },
    variant: {
        _id: { type: mongoose.Schema.Types.ObjectId, required: true },
        attributes: [
          {
            name: { type: String, required: true },
            value: { type: String, required: true }
          }
        ]
      },
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

module.exports = mongoose.model('Review', reviewSchema);
