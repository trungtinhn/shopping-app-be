// services/NotificationService.js
const Notification = require('../models/Notification');
const admin = require('../config/firebase-admin');
const User = require('../models/User');

class NotificationService {
  // Tạo notification trong database
  static async createNotification(data) {
    try {
      const notification = new Notification(data);
      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Gửi push notification
  static async sendPushNotification(userId, title, message, data = {}) {
    try {
      const user = await User.findById(userId);
      if (!user || !user.fcmToken) {
        console.log('User not found or no FCM token');
        return;
      }

      const payload = {
        notification: { title, body: message },
        data: { ...data, timestamp: new Date().toISOString() },
        token: user.fcmToken
      };

      const response = await admin.messaging().send(payload);
      console.log('Push notification sent:', response);
      return response;
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  // Tạo và gửi notification (all-in-one)
  static async createAndSendNotification(notificationData) {
    try {
      // 1. Lưu vào database
      const notification = await this.createNotification(notificationData);

      // 2. Gửi push notification
      await this.sendPushNotification(
        notificationData.userId,
        notificationData.title,
        notificationData.message,
        {
          type: notificationData.type,
          orderId: notificationData.orderId.toString(),
          notificationId: notification._id.toString()
        }
      );

      return notification;
    } catch (error) {
      console.error('Error in createAndSendNotification:', error);
      throw error;
    }
  }

  // Lấy notifications của user
  static async getUserNotifications(userId, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const notifications = await Notification.find({ userId })
        .populate('orderId', 'orderCode status totalPrice products')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Notification.countDocuments({ userId });
      const unreadCount = await Notification.countDocuments({ 
        userId, 
        isRead: false 
      });

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Đánh dấu đã đọc
  static async markAsRead(notificationId, userId) {
    try {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true, readAt: new Date() }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Đánh dấu tất cả đã đọc
  static async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;