const mongoose = require('mongoose');

const rankRuleSchema = new mongoose.Schema({
    rank: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'], // Các cấp bậc xếp hạng
        required: true, // Bắt buộc phải có tên hạng
        unique: true, // Mỗi hạng chỉ có một quy tắc
    },
    minOrderValue: {
        type: Number,
        required: true, // Giá trị tối thiểu để đạt hạng
        min: 0, // Không được âm
    },
    maxOrderValue: {
        type: Number,
        required: false, // Giá trị tối đa để ở trong hạng
        min: 0,
    },
    benefits: {
        type: [String], // Danh sách các lợi ích của hạng
        default: [], // Mặc định không có lợi ích
    },
    description: {
        type: String,
        default: '', // Mô tả về quy tắc
        trim: true,
    },
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

module.exports = mongoose.model('RankRule', rankRuleSchema);
