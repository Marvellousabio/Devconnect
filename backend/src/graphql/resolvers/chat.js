const { ChatRoom, Message, Project, User } = require('../../models');

const chatResolvers = {
  Query: {
    chatRooms: async (parent, { projectId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        let filter = { participants: context.user._id, isActive: true };

        if (projectId) {
          // Check project access
          const project = await Project.findById(projectId);
          if (!project) {
            throw new Error('Project not found');
          }

          const isMember = project.members.some(member =>
            member.user.toString() === context.user._id.toString()
          );
          const isOwner = project.owner.toString() === context.user._id.toString();

          if (!isMember && !isOwner && project.visibility !== 'public') {
            throw new Error('Access denied');
          }

          filter.project = projectId;
        }

        const rooms = await ChatRoom.find(filter)
          .populate('participants', 'username firstName lastName avatar')
          .populate('owner', 'username firstName lastName avatar')
          .populate('project', 'name')
          .populate('lastMessage.sender', 'username firstName lastName avatar')
          .sort({ updatedAt: -1 });

        return rooms;
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch chat rooms');
      }
    },

    chatRoom: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const room = await ChatRoom.findById(id)
          .populate('participants', 'username firstName lastName avatar')
          .populate('owner', 'username firstName lastName avatar')
          .populate('project', 'name description')
          .populate('lastMessage.sender', 'username firstName lastName avatar');

        if (!room) {
          throw new Error('Chat room not found');
        }

        // Check if user is participant
        const isParticipant = room.participants.some(p => p._id.toString() === context.user._id.toString());
        if (!isParticipant) {
          throw new Error('Access denied');
        }

        return room;
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch chat room');
      }
    },

    messages: async (parent, { roomId, limit = 50, offset = 0 }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        // Check room access
        const room = await ChatRoom.findById(roomId);
        if (!room) {
          throw new Error('Chat room not found');
        }

        const isParticipant = room.participants.some(p => p.toString() === context.user._id.toString());
        if (!isParticipant) {
          throw new Error('Access denied');
        }

        const messages = await Message.find({ room: roomId })
          .populate('sender', 'username firstName lastName avatar')
          .sort({ createdAt: -1 })
          .limit(limit)
          .skip(offset)
          .sort({ createdAt: 1 }); // Re-sort for display

        return messages;
      } catch (error) {
        throw new Error('Failed to fetch messages');
      }
    },

    directMessageRoom: async (parent, { userId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        return await ChatRoom.findOrCreateDirectMessage(context.user._id, userId);
      } catch (error) {
        throw new Error(error.message || 'Failed to get direct message room');
      }
    }
  },

  Mutation: {
    createChatRoom: async (parent, { projectId, input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        // Check project access if project room
        if (projectId && input.type === 'project') {
          const project = await Project.findById(projectId);
          if (!project) {
            throw new Error('Project not found');
          }

          const isMember = project.members.some(member =>
            member.user.toString() === context.user._id.toString()
          );
          const isOwner = project.owner.toString() === context.user._id.toString();

          if (!isMember && !isOwner) {
            throw new Error('Access denied');
          }
        }

        const room = new ChatRoom({
          name: input.name,
          description: input.description,
          type: input.type,
          project: projectId,
          participants: input.participantIds || [context.user._id],
          owner: context.user._id
        });

        await room.save();

        return await ChatRoom.findById(room._id)
          .populate('participants', 'username firstName lastName avatar')
          .populate('owner', 'username firstName lastName avatar')
          .populate('project', 'name');
      } catch (error) {
        throw new Error(error.message || 'Failed to create chat room');
      }
    },

    createDirectMessage: async (parent, { input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        return await ChatRoom.findOrCreateDirectMessage(context.user._id, input.participantId);
      } catch (error) {
        throw new Error(error.message || 'Failed to create direct message');
      }
    },

    sendMessage: async (parent, { roomId, input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        // Check room access
        const room = await ChatRoom.findById(roomId);
        if (!room) {
          throw new Error('Chat room not found');
        }

        const isParticipant = room.participants.some(p => p.toString() === context.user._id.toString());
        if (!isParticipant) {
          throw new Error('Access denied');
        }

        const message = new Message({
          content: input.content,
          sender: context.user._id,
          room: roomId,
          type: input.type || 'text',
          metadata: input.metadata
        });

        await message.save();

        // Update room's last message
        await room.updateLastMessage(message);

        return await Message.findById(message._id)
          .populate('sender', 'username firstName lastName avatar');
      } catch (error) {
        throw new Error(error.message || 'Failed to send message');
      }
    },

    editMessage: async (parent, { messageId, content }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const message = await Message.findById(messageId);
        if (!message) {
          throw new Error('Message not found');
        }

        // Only sender can edit
        if (message.sender.toString() !== context.user._id.toString()) {
          throw new Error('Access denied');
        }

        if (!message.canEdit(context.user._id)) {
          throw new Error('Message can no longer be edited');
        }

        message.content = content;
        await message.save();

        return await Message.findById(messageId)
          .populate('sender', 'username firstName lastName avatar');
      } catch (error) {
        throw new Error(error.message || 'Failed to edit message');
      }
    },

    deleteMessage: async (parent, { messageId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const message = await Message.findById(messageId);
        if (!message) {
          throw new Error('Message not found');
        }

        // Check permissions (sender or room owner/admin)
        const room = await ChatRoom.findById(message.room);
        const isSender = message.sender.toString() === context.user._id.toString();
        const isOwner = room.owner.toString() === context.user._id.toString();

        if (!isSender && !isOwner) {
          throw new Error('Access denied');
        }

        await Message.findByIdAndDelete(messageId);
        return true;
      } catch (error) {
        throw new Error(error.message || 'Failed to delete message');
      }
    },

    joinChatRoom: async (parent, { roomId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const room = await ChatRoom.findById(roomId);
        if (!room) {
          throw new Error('Chat room not found');
        }

        await room.addParticipant(context.user._id);
        return true;
      } catch (error) {
        throw new Error(error.message || 'Failed to join chat room');
      }
    },

    leaveChatRoom: async (parent, { roomId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const room = await ChatRoom.findById(roomId);
        if (!room) {
          throw new Error('Chat room not found');
        }

        // Cannot leave if owner
        if (room.owner.toString() === context.user._id.toString()) {
          throw new Error('Room owner cannot leave the room');
        }

        await room.removeParticipant(context.user._id);
        return true;
      } catch (error) {
        throw new Error(error.message || 'Failed to leave chat room');
      }
    }
  },

  Subscription: {
    messageReceived: {
      subscribe: (parent, { roomId }, { pubsub }) => {
        // This would be implemented with a pubsub system like graphql-subscriptions
        // For now, we'll use Socket.io for real-time messaging
        return null;
      }
    },
    userTyping: {
      subscribe: (parent, { roomId, userId }, { pubsub }) => {
        return null;
      }
    },
    userStoppedTyping: {
      subscribe: (parent, { roomId, userId }, { pubsub }) => {
        return null;
      }
    }
  }
};

module.exports = chatResolvers;