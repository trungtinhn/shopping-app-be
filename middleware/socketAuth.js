const jwt = require('jsonwebtoken');
// const User = require('../models/User'); // Uncomment và adjust theo model của bạn

// Middleware để verify JWT token cho socket connections
const verifySocketToken = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || 
                  socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // TODO: Uncomment khi có User model
    // const user = await User.findById(decoded.id).select('-password');
    // 
    // if (!user) {
    //   return next(new Error('User not found'));
    // }

    // Mock user data - thay thế bằng code thực
    const user = {
      _id: decoded.id,
      role: decoded.role || 'customer',
      storeId: decoded.storeId
    };

    // Attach user info to socket
    socket.user = user;
    socket.userId = user._id.toString();
    socket.userType = user.role;
    socket.storeId = user.storeId;

    next();
  } catch (error) {
    console.error('Socket authentication error:', error);
    next(new Error('Authentication failed'));
  }
};

// Middleware để check quyền truy cập conversation
const checkConversationAccess = async (socket, conversationId, next) => {
  try {
    // TODO: Implement logic để check user có quyền truy cập conversation không
    // 
    // Example implementation:
    // const Conversation = require('../models/Conversation');
    // const conversation = await Conversation.findById(conversationId);
    // 
    // const hasAccess = conversation.participants.some(
    //   p => p.user_id.toString() === socket.userId && p.user_type === socket.userType
    // );
    // 
    // if (!hasAccess) {
    //   return next(new Error('Access denied to this conversation'));
    // }

    // Mock access check - luôn cho phép (thay thế bằng logic thực)
    next();
  } catch (error) {
    console.error('Conversation access check error:', error);
    next(new Error('Access check failed'));
  }
};

// Middleware để rate limit socket events
const rateLimitSocket = (eventType, limit = 10, windowMs = 60000) => {
  const attempts = new Map(); // socketId -> { count, resetTime }

  return (socket, next) => {
    const socketId = socket.id;
    const now = Date.now();
    
    if (!attempts.has(socketId)) {
      attempts.set(socketId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const socketAttempts = attempts.get(socketId);
    
    if (now > socketAttempts.resetTime) {
      // Reset window
      socketAttempts.count = 1;
      socketAttempts.resetTime = now + windowMs;
      return next();
    }

    if (socketAttempts.count >= limit) {
      return next(new Error(`Rate limit exceeded for ${eventType}`));
    }

    socketAttempts.count++;
    next();
  };
};

module.exports = {
  verifySocketToken,
  checkConversationAccess,
  rateLimitSocket
};