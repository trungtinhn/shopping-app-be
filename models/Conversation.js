const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    customer_id: { 
        type: String, 
        required: true,
        index: true
    },
    shop_id: { 
        type: String, 
        required: true,
        index: true
    },
    
    // Thông tin tin nhắn cuối
    last_message: {
        content: String,
        sender_type: { type: String, enum: ['customer', 'shop'] },
        message_type: String,
        sent_at: Date
    },
    
    // Số tin nhắn chưa đọc
    unread_count: {
        customer: { type: Number, default: 0 },
        shop: { type: Number, default: 0 }
    },
    
    // Trạng thái conversation
    status: {
        type: String,
        enum: ['active', 'archived', 'blocked'],
        default: 'active'
    },
    
    // Ai block ai (nếu cần)
    blocked_by: {
        type: String,
        enum: ['customer', 'shop']
    },
    
    // Metadata
    metadata: {
        customer_name: String,
        customer_avatar: String,
        shop_name: String,
        shop_avatar: String
    },
    
    created_at: { 
        type: Date, 
        default: Date.now 
    },
    updated_at: { 
        type: Date, 
        default: Date.now,
        index: true // Để sort conversations theo thời gian update
    }
});

// Index compound
ConversationSchema.index({ customer_id: 1, updated_at: -1 });
ConversationSchema.index({ shop_id: 1, updated_at: -1 });
ConversationSchema.index({ customer_id: 1, shop_id: 1 }, { unique: true });

// Middleware
ConversationSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

// Virtual để get total messages
ConversationSchema.virtual('totalMessages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'conversation_id',
    count: true
});

module.exports = mongoose.model('Conversation', ConversationSchema);