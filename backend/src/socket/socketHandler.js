const Message = require('../models/Message');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// In-memory store for when DB is unavailable
const inMemoryMessages = [];
const connectedUsers = new Map();

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 New connection: ${socket.id}`);

    // Handle user joining
    socket.on('user_join', async (data) => {
      try {
        const { username, room = 'general' } = data;

        if (!username) {
          socket.emit('error', { message: 'Username is required' });
          return;
        }

        const trimmedUsername = username.trim().toLowerCase();

        // Store user info on socket
        socket.username = trimmedUsername;
        socket.room = room;

        // Join the room
        socket.join(room);

        // Track connected user
        connectedUsers.set(socket.id, {
          username: trimmedUsername,
          socketId: socket.id,
          room,
          joinedAt: new Date(),
        });

        // Update user in database
        try {
          await User.findOneAndUpdate(
            { username: trimmedUsername },
            {
              username: trimmedUsername,
              socketId: socket.id,
              isOnline: true,
              lastSeen: new Date(),
            },
            { upsert: true, new: true }
          );
        } catch (dbError) {
          console.log('DB update skipped:', dbError.message);
        }

        // Get online users list
        const onlineUsers = Array.from(connectedUsers.values()).map(u => ({
          username: u.username,
          isOnline: true,
        }));

        // Notify all users in room
        io.to(room).emit('user_online', {
          username: trimmedUsername,
          onlineUsers,
        });

        // Send system message
        const systemMessage = {
          messageId: uuidv4(),
          sender: 'system',
          content: `${trimmedUsername} joined the chat`,
          room,
          type: 'system',
          timestamp: new Date(),
        };

        io.to(room).emit('new_message', systemMessage);

        // Save system message
        try {
          const msg = new Message(systemMessage);
          await msg.save();
        } catch (dbError) {
          inMemoryMessages.push(systemMessage);
        }

        console.log(`👤 ${trimmedUsername} joined room: ${room}`);
        socket.emit('join_success', { username: trimmedUsername, room, onlineUsers });

      } catch (error) {
        console.error('Error in user_join:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { content, room = 'general' } = data;
        const sender = socket.username;

        if (!sender) {
          socket.emit('error', { message: 'Please join the chat first' });
          return;
        }

        if (!content || content.trim().length === 0) {
          socket.emit('error', { message: 'Message content cannot be empty' });
          return;
        }

        const messageData = {
          messageId: uuidv4(),
          sender,
          content: content.trim(),
          room,
          type: 'text',
          status: 'sent',
          timestamp: new Date(),
        };

        // Save to database
        let savedMessage;
        try {
          const message = new Message(messageData);
          savedMessage = await message.save();
        } catch (dbError) {
          console.log('DB save skipped, using in-memory:', dbError.message);
          savedMessage = messageData;
          inMemoryMessages.push(messageData);
        }

        // Broadcast to all users in the room
        io.to(room).emit('new_message', savedMessage);

        // Update status to delivered for other users
        setTimeout(() => {
          socket.to(room).emit('message_status_update', {
            messageId: savedMessage.messageId,
            status: 'delivered',
          });
        }, 100);

        console.log(`💬 ${sender}: ${content.substring(0, 50)}...`);

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing_start', (data) => {
      const { room = 'general' } = data;
      if (socket.username) {
        socket.to(room).emit('user_typing', {
          username: socket.username,
          isTyping: true,
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const { room = 'general' } = data;
      if (socket.username) {
        socket.to(room).emit('user_typing', {
          username: socket.username,
          isTyping: false,
        });
      }
    });

    // Handle message read status
    socket.on('message_read', async (data) => {
      try {
        const { messageId, room = 'general' } = data;

        if (!socket.username) return;

        try {
          await Message.findOneAndUpdate(
            { messageId },
            {
              status: 'read',
              $addToSet: {
                readBy: {
                  username: socket.username,
                  readAt: new Date(),
                },
              },
            }
          );
        } catch (dbError) {
          console.log('DB update skipped for read status');
        }

        socket.to(room).emit('message_status_update', {
          messageId,
          status: 'read',
          readBy: socket.username,
        });

      } catch (error) {
        console.error('Error updating read status:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        const userInfo = connectedUsers.get(socket.id);

        if (userInfo) {
          const { username, room } = userInfo;

          // Remove from connected users
          connectedUsers.delete(socket.id);

          // Update database
          try {
            await User.findOneAndUpdate(
              { username },
              {
                isOnline: false,
                socketId: null,
                lastSeen: new Date(),
              }
            );
          } catch (dbError) {
            console.log('DB update skipped on disconnect');
          }

          // Get updated online users
          const onlineUsers = Array.from(connectedUsers.values()).map(u => ({
            username: u.username,
            isOnline: true,
          }));

          // Notify room
          io.to(room).emit('user_offline', {
            username,
            onlineUsers,
          });

          // Send system message
          const systemMessage = {
            messageId: uuidv4(),
            sender: 'system',
            content: `${username} left the chat`,
            room,
            type: 'system',
            timestamp: new Date(),
          };

          io.to(room).emit('new_message', systemMessage);

          try {
            const msg = new Message(systemMessage);
            await msg.save();
          } catch (dbError) {
            inMemoryMessages.push(systemMessage);
          }

          console.log(`👋 ${username} disconnected`);
        }

      } catch (error) {
        console.error('Error handling disconnect:', error);
      }

      console.log(`🔌 Disconnected: ${socket.id}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Log connection count periodically
  setInterval(() => {
    const count = connectedUsers.size;
    if (count > 0) {
      console.log(`📊 Active connections: ${count}`);
    }
  }, 30000);
};

module.exports = { setupSocketHandlers };