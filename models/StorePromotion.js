const mongoose = require('mongoose');

const storePromotionSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store', // Tham chiếu tới bảng store
        required: true, // Mỗi khuyến mãi phải gắn với một store
    },
    promotionName: {
        type: String,
        required: true,
        trim: true,
    },
    promotionDetails: {
        type: String,
        required: true,
        trim: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    minimumOrderValue: {
        type: Number,
        default: 0,
        min: 0,
    },
    promotionImage: {
        type: String,
        default: null,
    },
    quantityAvailable: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalRemainingUses: {
        type: Number,
        default: null,
        min: 0,
    },
    backgroundImage: {
        type: String,
        default: null,
    },
    startDate: {
        type: Date,
        required: true, // Ngày bắt đầu là bắt buộc
    },
    endDate: {
        type: Date,
        required: true, // Ngày kết thúc là bắt buộc
    },
    isActive: {
        type: Boolean,
        default: true, // Trạng thái mặc định là hoạt động
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Tham chiếu tới bảng User
        required: true, // Ai tạo khuyến mãi này
    },
}, { timestamps: true });

module.exports = mongoose.models.StorePromotion || mongoose.model('StorePromotion', storePromotionSchema);
