const { Expo } = require('expo-server-sdk');
const User = require('../models/User');
class NotificationService {
  constructor() {
    this.expo = new Expo();
  }

  // Kiểm tra token Expo hợp lệ
  static isValidExpoPushToken(token) {
    return Expo.isExpoPushToken(token);
  }

  // Gửi thông báo đến một hoặc nhiều Expo Push Token
  static async sendPushNotification(tokens, title, body, data = {}) {
    try {
      const expo = new Expo();
      const tokensArray = Array.isArray(tokens) ? tokens : [tokens];
      
      // Lọc các token hợp lệ
      const validTokens = tokensArray.filter(token => 
        Expo.isExpoPushToken(token)
      );

      if (validTokens.length === 0) {
        throw new Error('No valid Expo push tokens provided');
      }

      // Tạo messages
      const messages = validTokens.map(token => ({
        to: token,
        sound: 'default',
        title: title,
        body: body,
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        // Thêm các options khác nếu cần
        badge: 1,
        priority: 'high',
        channelId: 'default'
      }));

      // Chia messages thành chunks (Expo API có giới hạn 100 messages/request)
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending chunk:', error);
        }
      }

      console.log('Successfully sent messages, tickets:', tickets);
      return { tickets, messageCount: messages.length };
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  // Kiểm tra receipts để xem message đã được gửi thành công chưa
  static async checkReceipts(tickets) {
    try {
      const expo = new Expo();
      const receiptIds = tickets
        .filter(ticket => ticket.status === 'ok')
        .map(ticket => ticket.id);

      if (receiptIds.length === 0) {
        return { receipts: [], errors: [] };
      }

      const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
      const receipts = [];
      const errors = [];

      for (const chunk of receiptIdChunks) {
        try {
          const receiptChunk = await expo.getPushNotificationReceiptsAsync(chunk);
          receipts.push(receiptChunk);

          // Kiểm tra lỗi
          for (const receiptId in receiptChunk) {
            const receipt = receiptChunk[receiptId];
            if (receipt.status === 'error') {
              errors.push({
                receiptId,
                error: receipt.message,
                details: receipt.details
              });
            }
          }
        } catch (error) {
          console.error('Error getting receipts:', error);
        }
      }

      return { receipts, errors };
    } catch (error) {
      console.error('Error checking receipts:', error);
      throw error;
    }
  }

  // Gửi thông báo đến một user
  static async sendToUser(userId, title, body, data = {}) {
    try {
      const user = await User.findOne({ userId: userId });
      
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      if (!user.fcmToken) {
        throw new Error(`User ${userId} has no Expo push token`);
      }

      return await this.sendPushNotification(user.fcmToken, title, body, data);
    } catch (error) {
      console.error('Error sending notification to user:', error);
      throw error;
    }
  }

  // Gửi thông báo đến nhiều user
  static async sendToMultipleUsers(userIds, title, body, data = {}) {
    try {
      const User = require('../models/User'); // Adjust path as needed
      const users = await User.find({ 
        _id: { $in: userIds },
        expoPushToken: { $exists: true, $ne: null }
      });

      if (users.length === 0) {
        throw new Error('No users found with valid Expo push tokens');
      }

      const tokens = users.map(user => user.expoPushToken);
      return await this.sendPushNotification(tokens, title, body, data);
    } catch (error) {
      console.error('Error sending notifications to multiple users:', error);
      throw error;
    }
  }

  // Gửi thông báo scheduled
  static async sendScheduledNotification(tokens, title, body, data = {}, delaySeconds = 0) {
    try {
      const expo = new Expo();
      const tokensArray = Array.isArray(tokens) ? tokens : [tokens];
      
      const validTokens = tokensArray.filter(token => 
        Expo.isExpoPushToken(token)
      );

      if (validTokens.length === 0) {
        throw new Error('No valid Expo push tokens provided');
      }

      const messages = validTokens.map(token => ({
        to: token,
        sound: 'default',
        title: title,
        body: body,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
          scheduled: true
        },
        // Thêm delay nếu cần
        ...(delaySeconds > 0 && { 
          expiration: Math.floor(Date.now() / 1000) + delaySeconds 
        })
      }));

      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending scheduled chunk:', error);
        }
      }

      return { tickets, messageCount: messages.length };
    } catch (error) {
      console.error('Error sending scheduled notification:', error);
      throw error;
    }
  }

  // Clean up invalid tokens
  static async cleanupInvalidTokens() {
    try {
      const User = require('../models/User'); // Adjust path as needed
      const users = await User.find({ 
        expoPushToken: { $exists: true, $ne: null }
      });

      const invalidTokens = [];
      
      for (const user of users) {
        if (!Expo.isExpoPushToken(user.expoPushToken)) {
          invalidTokens.push(user._id);
          user.expoPushToken = null;
          await user.save();
        }
      }

      console.log(`Cleaned up ${invalidTokens.length} invalid tokens`);
      return invalidTokens;
    } catch (error) {
      console.error('Error cleaning up invalid tokens:', error);
      throw error;
    }
  }

  // Get push notification statistics
  static async getNotificationStats(tickets) {
    try {
      const stats = {
        total: tickets.length,
        successful: 0,
        failed: 0,
        pending: 0
      };

      tickets.forEach(ticket => {
        if (ticket.status === 'ok') {
          stats.successful++;
        } else if (ticket.status === 'error') {
          stats.failed++;
        } else {
          stats.pending++;
        }
      });

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;