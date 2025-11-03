const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true,
    minlength: [3, 'Room name must be at least 3 characters'],
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['project', 'direct', 'group'],
    required: [true, 'Room type is required']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: function() {
      return this.type === 'project';
    }
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Room owner is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessage: {
    content: {
      type: String,
      maxlength: 200
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
chatRoomSchema.index({ project: 1 });
chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ type: 1 });
chatRoomSchema.index({ owner: 1 });

// Virtual for participant count
chatRoomSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Pre-save middleware to ensure owner is in participants
chatRoomSchema.pre('save', function(next) {
  if (this.isNew) {
    const ownerInParticipants = this.participants.some(participant =>
      participant.toString() === this.owner.toString()
    );

    if (!ownerInParticipants) {
      this.participants.push(this.owner);
    }
  }
  next();
});

// Pre-save middleware for direct messages (ensure only 2 participants)
chatRoomSchema.pre('save', function(next) {
  if (this.type === 'direct' && this.participants.length !== 2) {
    return next(new Error('Direct message rooms must have exactly 2 participants'));
  }
  next();
});

// Static method to find rooms by user
chatRoomSchema.statics.findByUser = function(userId) {
  return this.find({
    participants: userId,
    isActive: true
  })
  .populate('participants', 'username firstName lastName avatar')
  .populate('owner', 'username firstName lastName avatar')
  .populate('project', 'name description')
  .sort({ updatedAt: -1 });
};

// Static method to find project rooms
chatRoomSchema.statics.findByProject = function(projectId) {
  return this.find({
    project: projectId,
    type: 'project',
    isActive: true
  })
  .populate('participants', 'username firstName lastName avatar')
  .populate('owner', 'username firstName lastName avatar')
  .sort({ createdAt: 1 });
};

// Static method to find or create direct message room
chatRoomSchema.statics.findOrCreateDirectMessage = async function(userId1, userId2) {
  // Sort user IDs to ensure consistent room lookup
  const sortedUsers = [userId1, userId2].sort();

  let room = await this.findOne({
    type: 'direct',
    participants: { $all: sortedUsers, $size: 2 }
  });

  if (!room) {
    room = new this({
      name: 'Direct Message',
      type: 'direct',
      participants: sortedUsers,
      owner: sortedUsers[0] // First user as owner
    });
    await room.save();
  }

  return room.populate('participants', 'username firstName lastName avatar');
};

// Instance method to add participant
chatRoomSchema.methods.addParticipant = function(userId) {
  if (!this.participants.includes(userId)) {
    this.participants.push(userId);
    return this.save();
  }
  return this;
};

// Instance method to remove participant
chatRoomSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(id => id.toString() !== userId.toString());
  return this.save();
};

// Instance method to update last message
chatRoomSchema.methods.updateLastMessage = function(message) {
  this.lastMessage = {
    content: message.content.substring(0, 200), // Truncate for preview
    sender: message.sender,
    timestamp: new Date()
  };
  this.updatedAt = new Date();
  return this.save();
};

module.exports = mongoose.model('ChatRoom', chatRoomSchema);