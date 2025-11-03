const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatRoom',
    required: [true, 'Room is required']
  },
  type: {
    type: String,
    enum: ['text', 'code', 'file', 'system'],
    default: 'text'
  },
  metadata: {
    language: {
      type: String,
      enum: ['javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'php', 'ruby', 'html', 'css', 'sql', 'json', 'xml', 'yaml', 'markdown', 'bash', 'powershell']
    },
    filename: String,
    fileUrl: String
  },
  edited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

// Pre-save middleware for edited messages
messageSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.edited = true;
    this.editedAt = new Date();
  }
  next();
});

// Static method to find messages by room with pagination
messageSchema.statics.findByRoom = function(roomId, limit = 50, before = null) {
  const query = { room: roomId };
  if (before) {
    query.createdAt = { $lt: before };
  }

  return this.find(query)
    .populate('sender', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get recent messages for a room
messageSchema.statics.getRecentMessages = function(roomId, limit = 20) {
  return this.find({ room: roomId })
    .populate('sender', 'username firstName lastName avatar')
    .sort({ createdAt: -1 })
    .limit(limit)
    .sort({ createdAt: 1 }); // Re-sort to ascending for display
};

// Instance method to check if message can be edited
messageSchema.methods.canEdit = function(userId) {
  return this.sender.toString() === userId.toString() &&
         (Date.now() - this.createdAt.getTime()) < (15 * 60 * 1000); // 15 minutes
};

module.exports = mongoose.model('Message', messageSchema);