const express = require("express");
const socketSetup = require("./socket");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const app = express();
const http = require("http");
const server = http.createServer(app);

// Import all route files
const categoryRoutes = require("./routes/routeCategory");
const productRoutes = require('./routes/routeProduct');
const reviewRoutes = require("./routes/routeReview");
const promotionRoutes = require("./routes/routePromotion");
const addressRoutes = require("./routes/routeAddress");
const userRoutes = require("./routes/routeUser");
const userActivityRoutes = require("./routes/routeUserActivity");
const cartRoutes = require("./routes/routeCart");
const parameterRoutes = require("./routes/routesParameter");
const likeRoutes = require("./routes/routesLike");
const orderRoutes = require("./routes/routesOrder");
const paymentRoutes = require("./routes/routePayment");
const knnRoutes = require('./routes/routeKnn');
const conversationRoutes = require('./routes/routeConversation');
const storeRoutes = require("./routes/routeStore");
const globalCategoryRoutes = require("./routes/routeGlobalCategory");
const subCategoryRoutes = require("./routes/routeSubCategory");
const storePromotionRoutes = require("./routes/routesStorePromotion");
const rankRoutes = require("./routes/routeRank");
const rankRuleRoutes = require("./routes/routeRankRule");
const visionRoutes = require("./routes/routeVision");
const roleRoutes = require("./routes/routeRole");
const deliveryRoutes = require("./routes/routeDelivery");
const shippingStatusRoutes = require("./routes/routeShippingStatus");
const adminAppRoutes = require("./routes/routeAdminApp");

// Load environment variables
dotenv.config();

// Database connection
mongoose.connect(process.env.MONGODB_URL.replace("<password>", process.env.MONGODB_PASSWORD))
  .then(() => {
    console.log("✅ Database connected successfully");
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  });

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin: (process.env.CLIENT_URL || "").split(",").map(url => url.trim()),
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    message: "🚀 Server is running successfully",
    status: "OK",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Socket health check endpoint
app.get("/socket-stats", (req, res) => {
  const io = req.app.get('io');
  
  res.status(200).json({
    message: "Socket server statistics",
    connectedSockets: io ? io.engine.clientsCount : 0,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/category', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/promotion', promotionRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/user', userRoutes);
app.use('/api/userActivity', userActivityRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/parameter', parameterRoutes);
app.use('/api/like', likeRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/knn', knnRoutes);
app.use('/api/conversation', conversationRoutes);
app.use('/api/globalCategory', globalCategoryRoutes);
app.use('/api/subCategory', subCategoryRoutes);
app.use('/api/storePromotion', storePromotionRoutes);
app.use('/api/rank', rankRoutes);
app.use('/api/rankRule', rankRuleRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/vision', visionRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/shippingStatus', shippingStatusRoutes);
app.use('/api/adminApp', adminAppRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: "🔍 Route not found",
    path: req.originalUrl,
    method: req.method
  });
});

// Initialize Socket.IO
const io = socketSetup(server);

// Make io instance available globally
app.set('io', io);

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server initialized on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/`);
  console.log(`📊 Socket stats: http://localhost:${PORT}/socket-stats`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received, shutting down gracefully...`);
  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = { app, server, io };