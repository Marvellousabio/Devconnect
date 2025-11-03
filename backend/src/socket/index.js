const { Message, ChatRoom, User } = require('../models');

const socketHandlers = (io) => {
  // Store connected users
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // User joins with their user ID
    socket.on('join', async (userId) => {
      try {
        socket.userId = userId;
        connectedUsers.set(userId, socket.id);

        // Join user to their personal room for notifications
        socket.join(`user_${userId}`);

        // Update user's online status if needed
        // await User.findByIdAndUpdate(userId, { isOnline: true });

        console.log(`User ${userId} joined with socket ${socket.id}`);
      } catch (error) {
        console.error('Error joining user:', error);
        socket.emit('error', { message: 'Failed to join' });
      }
    });

    // Join a chat room
    socket.on('join_room', async (roomId) => {
      try {
        const room = await ChatRoom.findById(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        // Check if user is participant
        const isParticipant = room.participants.some(p => p.toString() === socket.userId);
        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized to join this room' });
          return;
        }

        socket.join(roomId);
        console.log(`User ${socket.userId} joined room ${roomId}`);

        // Send recent messages
        const recentMessages = await Message.getRecentMessages(roomId);
        socket.emit('room_history', recentMessages);

      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Leave a chat room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.userId} left room ${roomId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { roomId, content, type = 'text', metadata = {} } = data;

        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Verify user is in the room
        const room = await ChatRoom.findById(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        const isParticipant = room.participants.some(p => p.toString() === socket.userId);
        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        // Create message
        const message = new Message({
          content,
          sender: socket.userId,
          room: roomId,
          type,
          metadata
        });

        await message.save();

        // Populate sender info
        await message.populate('sender', 'username firstName lastName avatar');

        // Update room's last message
        await room.updateLastMessage(message);

        // Send to all users in the room
        io.to(roomId).emit('new_message', message);

        // Send notification to other participants
        room.participants.forEach(participantId => {
          if (participantId.toString() !== socket.userId) {
            const participantSocketId = connectedUsers.get(participantId.toString());
            if (participantSocketId) {
              io.to(participantSocketId).emit('notification', {
                type: 'new_message',
                roomId,
                message: message.content.substring(0, 100),
                sender: message.sender.username
              });
            }
          }
        });

      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Edit message
    socket.on('edit_message', async (data) => {
      try {
        const { messageId, content } = data;

        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        if (message.sender.toString() !== socket.userId) {
          socket.emit('error', { message: 'Not authorized' });
          return;
        }

        if (!message.canEdit(socket.userId)) {
          socket.emit('error', { message: 'Message can no longer be edited' });
          return;
        }

        message.content = content;
        await message.save();

        await message.populate('sender', 'username firstName lastName avatar');

        io.to(message.room.toString()).emit('message_updated', message);

      } catch (error) {
        console.error('Error editing message:', error);
        socket.emit('error', { message: 'Failed to edit message' });
      }
    });

    // Typing indicators
    socket.on('typing_start', (roomId) => {
      socket.to(roomId).emit('user_typing', {
        userId: socket.userId,
        roomId
      });
    });

    socket.on('typing_stop', (roomId) => {
      socket.to(roomId).emit('user_stopped_typing', {
        userId: socket.userId,
        roomId
      });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.id}`);

      if (socket.userId) {
        connectedUsers.delete(socket.userId);

        // Update user's online status if needed
        // await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen: new Date() });
      }
    });
  });

  return io;
};

module.exports = socketHandlers;