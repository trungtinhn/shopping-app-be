const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversation_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Conversation', 
        required: true,
        index: true // Tối ưu query theo conversation
    },
    sender_id: { 
        type: String, 
        required: true,
        index: true // Tối ưu query theo sender
    },
    sender_type: { 
        type: String, 
        enum: ['customer', 'shop'], 
        required: true 
    },
    content: { 
        type: String, 
        required: true,
        trim: true
    },
    message_type: { 
        type: String, 
        enum: ['text', 'image'],
        default: 'text' 
    },
    // Trạng thái đọc cho từng người
    read_status: {
        customer_read: { type: Boolean, default: false },
        shop_read: { type: Boolean, default: false }
    },
    
    // Reply message
    reply_to: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Message' 
    },
    
    // Soft delete
    is_deleted: { 
        type: Boolean, 
        default: false 
    },
    deleted_at: Date,
    
    created_at: { 
        type: Date, 
        default: Date.now,
        index: true // Tối ưu sort theo thời gian
    },
    updated_at: { 
        type: Date, 
        default: Date.now 
    }
});

// Index compound cho performance
MessageSchema.index({ conversation_id: 1, created_at: -1 });
MessageSchema.index({ sender_id: 1, created_at: -1 });

// Middleware để update updated_at
MessageSchema.pre('save', function(next) {
    this.updated_at = new Date();
    next();
});

module.exports = mongoose.model('Message', MessageSchema);
