const mongoose = require('mongoose');

const rankSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true, // Bắt buộc phải có ID của khách hàng
        unique: true, // Mỗi khách hàng chỉ có một bản ghi xếp hạng
    },
    totalOrderValue: {
        type: Number,
        default: 0, // Giá trị tổng đơn hàng mặc định là 0
        min: 0,
    },
    rank: {
        type: String,
        enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'], // Các cấp bậc xếp hạng
        default: 'Bronze', // Mặc định là Bronze
    },
    lastUpdated: {
        type: Date,
        default: Date.now, // Cập nhật thời gian cuối khi thay đổi hạng
    },
}, { timestamps: true }); // Tự động thêm createdAt và updatedAt

module.exports = mongoose.model('Rank', rankSchema);
