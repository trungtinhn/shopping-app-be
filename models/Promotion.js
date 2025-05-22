const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    promotionName: {
        type: String,
        required: true, // Tên khuyến mãi cần thiết
        trim: true, // Loại bỏ khoảng trắng đầu và cuối
    },
    promotionDetails: {
        type: String,
        required: true, // Thông tin chi tiết cần thiết
        trim: true,
    },
    rate: {
        type: Number,
        default: 0, // Giá trị mặc định
        min: 0, // Tối thiểu là 0
        max: 100, // Tối đa là 100 nếu là phần trăm giảm giá
    },
    maxDiscount: { // Thêm trường giảm tối đa
        type: Number,
        default: null,
        min: 0,
    },
    minimumOrder: {
        type: Number,
        default: 0, // Đơn hàng tối thiểu mặc định là 0 nếu không yêu cầu
        min: 0,
    },
    promotionImage: {
        type: String,
        default: null, // Giá trị mặc định nếu không có hình ảnh
    },
    quantity: {
        type: Number,
        default: 0, // Số lượng mặc định là 0
        min: 0,
    },
    usageLimit: {
        type: Number,
        default: null, // Giá trị mặc định nếu không giới hạn
        min: 0,
    },
    remainingUses: {
        type: Number,
        default: null, // Giá trị mặc định nếu không theo dõi số lượt còn lại
        min: 0,
    },
    backgroundImage: {
        type: String,
        default: null, // Đổi tên trường và tránh lỗi cú pháp `fales`
    },
    type: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true, // Ngày bắt đầu là bắt buộc
    },
    endDate: {
        type: Date,
        required: true, // Ngày kết thúc là bắt buộc
    },
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema);
