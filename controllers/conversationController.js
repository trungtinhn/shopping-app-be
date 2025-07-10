const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const { checkAvailability } = require("./productController");

const ConverstationController = {
  getConversations: async (req, res) => {
    try {
      const { shop_id } = req.query;

      if (!shop_id) {
        return res.status(400).json({ error: "shop_id is required" });
      }

      const conversations = await Conversation.find({
        shop_id,
        status: { $ne: "archived" }, // Không lấy conversations đã archive
      })
        .sort({ updated_at: -1 }) // Sắp xếp theo thời gian mới nhất
        .limit(50); // Giới hạn 50 conversations gần nhất

      res.json({
        success: true,
        data: conversations,
        total: conversations.length,
      });
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  // Method mới để lấy conversations theo storeId
  getConversationsByStoreId: async (req, res) => {
    try {
      const { storeId } = req.params;
      console.log("Store ID:", storeId);
      if (!storeId) {
        return res.status(400).json({ 
          success: false,
          error: "storeId is required" 
        });
      }

      const conversations = await Conversation.find({
        shop_id: storeId,
        status: { $ne: "archived" }, // Không lấy conversations đã archive
      })
        .sort({ updated_at: -1 }) // Sắp xếp theo thời gian mới nhất
        .limit(50); // Giới hạn 50 conversations gần nhất

      res.json({
        success: true,
        data: conversations,
        total: conversations.length,
      });
    } catch (error) {
      console.error("Error fetching conversations by store ID:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  getConversationById: async (req, res) => {
    try {
      const conversation = await Conversation.findById(req.params.id);
      console.log(conversation);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: "Conversation not found",
        });
      }

      res.json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  getMessageConversation: async (req, res) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const skip = (page - 1) * limit;

      const messages = await Message.find({
        conversation_id: id,
        is_deleted: false,
      })
        .sort({ created_at: -1 }) // Sắp xếp mới nhất trước
        .skip(skip)
        .limit(parseInt(limit))
        .populate("reply_to", "content sender_type created_at"); // Populate reply message

      // Reverse để hiển thị từ cũ đến mới
      const reversedMessages = messages.reverse();

      // Đếm tổng số messages
      const total = await Message.countDocuments({
        conversation_id: id,
        is_deleted: false,
      });

      res.json({
        success: true,
        data: reversedMessages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  sendMessage: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        sender_id,
        sender_type,
        content,
        message_type = "text",
        reply_to,
      } = req.body;

      // Validate input
      if (!sender_id || !sender_type || !content) {
        return res.status(400).json({
          success: false,
          error: "sender_id, sender_type, and content are required",
        });
      }

      if (!["customer", "shop"].includes(sender_type)) {
        return res.status(400).json({
          success: false,
          error: "sender_type must be customer or shop",
        });
      }

      // Kiểm tra conversation có tồn tại không
      const conversation = await Conversation.findById(id);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: "Conversation not found",
        });
      }

      // Tạo message mới
      const newMessage = new Message({
        conversation_id: id,
        sender_id,
        sender_type,
        content: content.trim(),
        message_type,
        reply_to: reply_to || undefined,
        read_status: {
          customer_read: sender_type === "customer",
          shop_read: sender_type === "shop",
        },
      });

      await newMessage.save();

      // Cập nhật conversation
      const updateData = {
        last_message: {
          content: content.trim(),
          sender_type,
          message_type,
          sent_at: new Date(),
        },
        updated_at: new Date(),
      };

      // Tăng unread count cho người nhận
      if (sender_type === "customer") {
        updateData["$inc"] = { "unread_count.shop": 1 };
      } else {
        updateData["$inc"] = { "unread_count.customer": 1 };
      }

      await Conversation.findByIdAndUpdate(id, updateData);

      // Populate reply_to nếu có
      const populatedMessage = await Message.findById(newMessage._id).populate(
        "reply_to",
        "content sender_type created_at"
      );

      res.status(201).json({
        success: true,
        data: populatedMessage,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  markasRead: async (req, res) => {
    try {
      const { id } = req.params;
      const { reader_type } = req.body; // 'customer' or 'shop'

      if (!["customer", "shop"].includes(reader_type)) {
        return res.status(400).json({
          success: false,
          error: "reader_type must be customer or shop",
        });
      }

      // Cập nhật read_status cho tất cả messages chưa đọc
      const updateField =
        reader_type === "customer"
          ? "read_status.customer_read"
          : "read_status.shop_read";

      await Message.updateMany(
        {
          conversation_id: id,
          [updateField]: false,
          is_deleted: false,
        },
        {
          $set: { [updateField]: true },
        }
      );

      // Reset unread count trong conversation
      const unreadUpdate =
        reader_type === "customer"
          ? { "unread_count.customer": 0 }
          : { "unread_count.shop": 0 };

      await Conversation.findByIdAndUpdate(id, unreadUpdate);

      res.json({
        success: true,
        message: "Messages marked as read",
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },

  createConversation: async (req, res) => {
    try {
      const {
        customer_id,
        shop_id,
        customer_name,
        customer_avatar,
        shop_name,
        shop_avatar,
      } = req.body;

      if (!customer_id || !shop_id) {
        return res.status(400).json({
          success: false,
          error: "customer_id and shop_id are required",
        });
      }

      // Kiểm tra conversation đã tồn tại chưa
      let conversation = await Conversation.findOne({ customer_id, shop_id });

      if (conversation) {
        return res.json({
          success: true,
          data: conversation,
          message: "Conversation already exists",
        });
      }

      // Tạo conversation mới
      conversation = new Conversation({
        customer_id,
        shop_id,
        metadata: {
          customer_name,
          customer_avatar,
          shop_name,
          shop_avatar,
        },
      });

      await conversation.save();

      res.status(201).json({
        success: true,
        data: conversation,
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
  getConversationsByCustomerId: async (req, res) => {
    try {
      const { customerId } = req.params;
      console.log("Customer ID:", customerId);
      if (!customerId) {
        return res.status(400).json({ 
          success: false,
          error: "customerId is required" 
        });
      }

      const conversations = await Conversation.find({
        customer_id: customerId,
        status: { $ne: "archived" }, // Không lấy conversations đã archive
      })
        .sort({ updated_at: -1 }) // Sắp xếp theo thời gian mới nhất
        .limit(50); // Giới hạn 50 conversations gần nhất

      res.json({
        success: true,
        data: conversations,
        total: conversations.length,
      });
    } catch (error) {
      console.error("Error fetching conversations by customer ID:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
  checkConversation: async (req, res) => {
    try {
      const { customerId, shopId } = req.params;

      if (!customerId || !shopId) {
        return res.status(400).json({
          success: false,
          error: "customerId and shopId are required",
        });
      }

      // Kiểm tra xem conversation đã tồn tại chưa
      const conversation = await Conversation.findOne({
        customer_id: customerId,
        shop_id: shopId,
      });

      if (conversation) {
        return res.json({
          success: true,
          data: conversation,
          message: "Conversation already exists",
        });
      } else {
        return res.json({
          success: false,
          message: "No conversation found between customer and shop",
        });
      }
    } catch (error) {
      console.error("Error checking conversation:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
};

module.exports = ConverstationController;