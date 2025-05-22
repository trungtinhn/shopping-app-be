const Message = require('../models/Message');
const User = require('../models/User');
const MessageController = {
  getChatSummary: async (req, res) => {
    try {
      const userId = req.body._id;

      // Find all users except the current user
      const users = await User.find({_id: {$ne: userId}});
      const summaries = await Promise.all(
        users.map(async user => {
            console.log(user._id + userId)
          const latestMessage = await Message.findOne({
            $or: [
              {senderId: user._id, recipientId: userId},
              {senderId: userId, recipientId: user._id},
            ],
          }).sort({timeStamp: -1});

          const unreadCount = await Message.countDocuments({
            senderId: user._id,
            recipientId: userId,
            isSeen: false,
          });

          return {
            _id: user._id,
            Avatar: user.Avatar,
            TenND: user.TenND,
            latestMessage: latestMessage ? latestMessage.message : null,
            latestTime: latestMessage ? latestMessage.timeStamp : null,
            unreadCount: unreadCount,
          };
        }),
      );

      res.status(200).json(summaries);
    } catch (error) {
      res.status(500).json({error: error.message});
    }
  }
};
module.exports = MessageController;
