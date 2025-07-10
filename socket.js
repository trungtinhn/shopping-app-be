const socketIo = require("socket.io");
// In-memory storage
const connectedUsers = new Map();
const conversationRooms = new Map();
const userTypingStatus = new Map();

// Rate limiting maps
const joinAttempts = new Map();
const readMarkAttempts = new Map();

// Rate limiting constants
const JOIN_COOLDOWN = 1000; // 1 second
const READ_MARK_COOLDOWN = 2000; // 2 seconds

// Utility functions
const addUserToRoom = (conversationId, socketId) => {
  if (!conversationRooms.has(conversationId)) {
    conversationRooms.set(conversationId, new Set());
  }
  conversationRooms.get(conversationId).add(socketId);
};

const removeUserFromRoom = (conversationId, socketId) => {
  if (conversationRooms.has(conversationId)) {
    conversationRooms.get(conversationId).delete(socketId);
    if (conversationRooms.get(conversationId).size === 0) {
      conversationRooms.delete(conversationId);
    }
  }
};

const removeUserFromAllRooms = (socketId) => {
  conversationRooms.forEach((sockets, conversationId) => {
    sockets.delete(socketId);
    if (sockets.size === 0) {
      conversationRooms.delete(conversationId);
    }
  });
};

const getOnlineUsers = () => {
  return Array.from(connectedUsers.keys());
};

const broadcastOnlineUsers = (io) => {
  const onlineUsers = getOnlineUsers();
  io.emit("online_users_update", onlineUsers);
};

// Rate limiting functions
const canJoinConversation = (socketId, conversationId) => {
  const key = socketId;
  const now = Date.now();

  if (joinAttempts.has(key)) {
    const { conversationId: lastConversationId, lastJoinTime } =
      joinAttempts.get(key);

    if (
      lastConversationId === conversationId &&
      now - lastJoinTime < JOIN_COOLDOWN
    ) {
      return false;
    }
  }

  joinAttempts.set(key, { conversationId, lastJoinTime: now });
  return true;
};

const canMarkAsRead = (userId, conversationId) => {
  const key = `${userId}-${conversationId}`;
  const now = Date.now();

  if (readMarkAttempts.has(key)) {
    const lastMarkTime = readMarkAttempts.get(key);

    if (now - lastMarkTime < READ_MARK_COOLDOWN) {
      return false;
    }
  }

  readMarkAttempts.set(key, now);
  return true;
};

// Generate message ID
function generateMessageId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Main socket setup function
const socketSetup = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: (process.env.CLIENT_URL || "")
        .split(",")
        .map((url) => url.trim()),
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: parseInt(process.env.SOCKET_PING_TIMEOUT) || 60000,
    pingInterval: parseInt(process.env.SOCKET_PING_INTERVAL) || 25000,
    upgradeTimeout: 30000,
    allowUpgrades: true,
  });

  console.log("🔌 Socket.IO server initialized");

  io.on("connection", (socket) => {
    console.log("🔗 New socket connection:", socket.id);

    // Authentication từ handshake
    const { userId, userType, storeId } = socket.handshake.auth || {};

    if (userId) {
      // Check for existing connection
      const existingUser = connectedUsers.get(userId);
      if (existingUser && existingUser.socketId !== socket.id) {
        const oldSocket = io.sockets.sockets.get(existingUser.socketId);
        if (oldSocket) {
          console.log(
            `🔄 Disconnecting old socket ${existingUser.socketId} for user ${userId}`
          );
          oldSocket.disconnect(true);
        }
      }

      // Save user info
      connectedUsers.set(userId, {
        socketId: socket.id,
        userType: userType,
        storeId: storeId,
        connectedAt: new Date(),
      });

      socket.userId = userId;
      socket.userType = userType;
      socket.storeId = storeId;

      console.log(`👤 User ${userId} (${userType}) connected`);

      broadcastOnlineUsers(io);
      socket.emit("auth_success", { userId, userType });

      // Auto join user-specific rooms
      if (userType === "shop" && storeId) {
        socket.join(`shop_${storeId}`);
        console.log(`🏪 Shop ${userId} joined shop room`);
      } else if (userType === "customer") {
        socket.join(`customer_${userId}`);
        console.log(`👨‍💼 Customer ${userId} joined customer room`);
      }
    }

    // Manual authentication
    socket.on("authenticate", (authData) => {
      try {
        const { userId, userType, storeId } = authData;

        if (!userId) {
          socket.emit("auth_error", { message: "User ID is required" });
          return;
        }

        // Check for existing connection
        const existingUser = connectedUsers.get(userId);
        if (existingUser && existingUser.socketId !== socket.id) {
          const oldSocket = io.sockets.sockets.get(existingUser.socketId);
          if (oldSocket) {
            console.log(`🔄 Disconnecting old socket for user ${userId}`);
            oldSocket.disconnect(true);
          }
        }

        connectedUsers.set(userId, {
          socketId: socket.id,
          userType: userType,
          storeId: storeId,
          connectedAt: new Date(),
        });

        socket.userId = userId;
        socket.userType = userType;
        socket.storeId = storeId;

        console.log(`✅ User ${userId} (${userType}) authenticated`);

        broadcastOnlineUsers(io);
        socket.emit("auth_success", { userId, userType });
      } catch (error) {
        console.error("❌ Authentication error:", error);
        socket.emit("auth_error", { message: "Authentication failed" });
      }
    });

    // Join conversation room
    socket.on("join_conversation", (conversationId) => {
      try {
        if (!conversationId) {
          socket.emit("error", { message: "Conversation ID is required" });
          return;
        }

        if (!canJoinConversation(socket.id, conversationId)) {
          return; // Rate limited
        }

        if (socket.rooms.has(conversationId)) {
          return; // Already in room
        }

        socket.join(conversationId);
        addUserToRoom(conversationId, socket.id);

        console.log(
          `📝 Socket ${socket.id} joined conversation: ${conversationId}`
        );

        socket.to(conversationId).emit("user_joined_conversation", {
          userId: socket.userId,
          userType: socket.userType,
          conversationId,
        });
      } catch (error) {
        console.error("❌ Error joining conversation:", error);
        socket.emit("error", { message: "Failed to join conversation" });
      }
    });

    // Leave conversation room
    socket.on("leave_conversation", (conversationId) => {
      try {
        if (!conversationId || !socket.rooms.has(conversationId)) {
          return;
        }

        socket.leave(conversationId);
        removeUserFromRoom(conversationId, socket.id);

        console.log(
          `📝 Socket ${socket.id} left conversation: ${conversationId}`
        );

        // Clear typing status
        if (userTypingStatus.has(conversationId)) {
          userTypingStatus.get(conversationId).delete(socket.userId);
          if (userTypingStatus.get(conversationId).size === 0) {
            userTypingStatus.delete(conversationId);
          }
        }

        socket.to(conversationId).emit("user_left_conversation", {
          userId: socket.userId,
          userType: socket.userType,
          conversationId,
        });
      } catch (error) {
        console.error("❌ Error leaving conversation:", error);
      }
    });

    // Handle sending messages
    socket.on("send_message", async (data) => {
      try {
        const {
          conversationId,
          sender_id,
          sender_type,
          content,
          message_type,
        } = data;
        if (!conversationId || !sender_id || !sender_type || !content) {
          socket.emit("error", { message: "Missing required message data" });
          return;
        }

        if (!socket.rooms.has(conversationId)) {
          socket.emit("error", { message: "You are not in this conversation" });
          return;
        }

        // Create message object
        const messageData = {
          sender_id,
          sender_type,
          content,
          message_type: message_type || "text",
          created_at: new Date(),
          updated_at: new Date(),
        };

        // Broadcast to conversation
        io.to(conversationId).emit("new_message", {
          message: messageData,
          conversationId,
        });

        // Clear typing status
        if (userTypingStatus.has(conversationId)) {
          userTypingStatus.get(conversationId).delete(sender_id);

          socket.to(conversationId).emit("user_typing", {
            conversationId,
            userId: sender_id,
            userType: sender_type,
            isTyping: false,
          });
        }

        console.log(`💬 Message sent in conversation ${conversationId}`);
      } catch (error) {
        console.error("❌ Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicators
    socket.on("typing", (data) => {
      try {
        const { conversationId, isTyping, userId, userType } = data;

        if (
          !conversationId ||
          userId === undefined ||
          !socket.rooms.has(conversationId)
        ) {
          return;
        }

        if (!userTypingStatus.has(conversationId)) {
          userTypingStatus.set(conversationId, new Set());
        }

        if (isTyping) {
          userTypingStatus.get(conversationId).add(userId);
        } else {
          userTypingStatus.get(conversationId).delete(userId);
        }

        socket.to(conversationId).emit("user_typing", {
          conversationId,
          userId,
          userType,
          isTyping,
        });

        if (isTyping) {
          console.log(`⌨️ User ${userId} typing in ${conversationId}`);
        }
      } catch (error) {
        console.error("❌ Error handling typing:", error);
      }
    });

    // Handle mark as read
    socket.on("mark_as_read", async (data) => {
      try {
        const { conversationId, messageIds, userId, userType } = data;

        if (!conversationId || !messageIds || !userId) {
          socket.emit("error", {
            message: "Missing required data for mark as read",
          });
          return;
        }

        if (!canMarkAsRead(userId, conversationId)) {
          return; // Rate limited
        }

        if (!socket.rooms.has(conversationId)) {
          socket.emit("error", { message: "You are not in this conversation" });
          return;
        }

        // TODO: Update database
        // await markMessagesAsRead(conversationId, messageIds, userId, userType);

        socket.to(conversationId).emit("message_read", {
          conversationId,
          messageIds,
          readBy: userId,
          readByType: userType,
          readAt: new Date().toISOString(),
        });

        console.log(`✓ Messages marked as read by ${userType} ${userId}`);
      } catch (error) {
        console.error("❌ Error marking messages as read:", error);
        socket.emit("error", { message: "Failed to mark messages as read" });
      }
    });

    // Handle disconnect
    socket.on("disconnect", (reason) => {
      try {
        console.log(`🔌 Socket ${socket.id} disconnected: ${reason}`);

        if (socket.userId) {
          const currentUser = connectedUsers.get(socket.userId);
          if (currentUser && currentUser.socketId === socket.id) {
            connectedUsers.delete(socket.userId);
            broadcastOnlineUsers(io);
          }

          removeUserFromAllRooms(socket.id);

          // Clear typing status
          userTypingStatus.forEach((typingUsers, conversationId) => {
            if (typingUsers.has(socket.userId)) {
              typingUsers.delete(socket.userId);

              io.to(conversationId).emit("user_typing", {
                conversationId,
                userId: socket.userId,
                userType: socket.userType,
                isTyping: false,
              });
            }
          });

          console.log(
            `👋 User ${socket.userId} (${socket.userType}) disconnected`
          );
        }

        joinAttempts.delete(socket.id);
      } catch (error) {
        console.error("❌ Error handling disconnect:", error);
      }
    });

    socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });
  });

  // Cleanup old rate limiting data
  setInterval(() => {
    const now = Date.now();

    for (const [socketId, data] of joinAttempts.entries()) {
      if (now - data.lastJoinTime > JOIN_COOLDOWN * 10) {
        joinAttempts.delete(socketId);
      }
    }

    for (const [key, lastMarkTime] of readMarkAttempts.entries()) {
      if (now - lastMarkTime > READ_MARK_COOLDOWN * 10) {
        readMarkAttempts.delete(key);
      }
    }
  }, 60000);

  return io;
};

module.exports = socketSetup;
