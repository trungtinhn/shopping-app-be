const socketIo = require("socket.io");
const Message = require('./models/Message')

// Store clients per room
const chatHistory = {};

const socketSetup = (server) => {

  const io = socketIo(server, {
    path: "/api/Chat/",
  });

  io.on("connection", (socket) => {
    console.log("A user connected");
    const getMessages = async ({ userId, friendId }) => {
      try {
        const messages = await Message.find({
          $or: [
            { senderId: userId, recipientId: friendId },
            { senderId: friendId, recipientId: userId },
          ],
        }).sort({ timestamp: 1 });
        socket.emit("messages", messages);
      } catch (err) {
        console.error(err);
        socket.emit("messages", []);
      }
    }
    socket.on("getMessages", getMessages);

    socket.on("sendMessage", async (message) => {
      const newMessage = new Message(message);
      const savedMessage = await newMessage.save();
      console.log(newMessage);
      io.emit("receiveMessage", savedMessage);
    });

    socket.on('messageSeen', async ({ messageId }) => {
    try {
      await Message.findByIdAndUpdate(messageId, { isSeen: true });
      io.emit('messageSeen', { messageId }); // Broadcast to all clients that the message has been seen
    } catch (error) {
      console.error("Error updating message status:", error);
    }
  });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });

    socket.on("getChatHistory", (room) => {
      if (chatHistory[room]) {
        chatHistory[room].forEach((message) => {
          socket.emit("message", message);
        });
      }
    });
  });
};

module.exports = socketSetup;
