const mongoose = require('mongoose');

const codeSessionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Session name is required'],
    trim: true,
    minlength: [3, 'Session name must be at least 3 characters'],
    maxlength: [100, 'Session name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  language: {
    type: String,
    required: [true, 'Programming language is required'],
    enum: ['javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'php', 'ruby', 'html', 'css', 'sql', 'json', 'xml', 'yaml', 'markdown', 'bash', 'powershell']
  },
  content: {
    type: String,
    default: ''
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    cursor: {
      line: {
        type: Number,
        default: 0
      },
      column: {
        type: Number,
        default: 0
      }
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
codeSessionSchema.index({ project: 1 });
codeSessionSchema.index({ creator: 1 });
codeSessionSchema.index({ isActive: 1 });
codeSessionSchema.index({ lastActivity: -1 });

// Virtual for participant count
codeSessionSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Pre-save middleware to update last activity
codeSessionSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

// Static method to find active sessions by project
codeSessionSchema.statics.findActiveByProject = function(projectId) {
  return this.find({
    project: projectId,
    isActive: true
  })
    .populate('creator', 'username firstName lastName avatar')
    .populate('participants.user', 'username firstName lastName avatar')
    .sort({ lastActivity: -1 });
};

// Static method to find sessions by user
codeSessionSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { creator: userId },
      { 'participants.user': userId }
    ],
    isActive: true
  })
    .populate('project', 'name')
    .populate('creator', 'username firstName lastName avatar')
    .sort({ lastActivity: -1 });
};

// Instance method to add participant
codeSessionSchema.methods.addParticipant = function(userId) {
  const existingParticipant = this.participants.find(p =>
    p.user.toString() === userId.toString()
  );

  if (!existingParticipant) {
    this.participants.push({
      user: userId,
      joinedAt: new Date(),
      lastActivity: new Date()
    });
  } else {
    existingParticipant.lastActivity = new Date();
  }

  return this.save();
};

// Instance method to remove participant
codeSessionSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p =>
    p.user.toString() !== userId.toString()
  );
  return this.save();
};

// Instance method to update participant cursor
codeSessionSchema.methods.updateCursor = function(userId, line, column) {
  const participant = this.participants.find(p =>
    p.user.toString() === userId.toString()
  );

  if (participant) {
    participant.cursor.line = line;
    participant.cursor.column = column;
    participant.lastActivity = new Date();
    return this.save();
  }

  return this;
};

// Instance method to apply text changes
codeSessionSchema.methods.applyChanges = function(userId, changes) {
  let newContent = this.content;

  // Sort changes by position (descending to avoid index shifting)
  changes.sort((a, b) => b.position - a.position);

  for (const change of changes) {
    const { type, position, text = '', length = 0 } = change;

    switch (type) {
      case 'INSERT':
        newContent = newContent.slice(0, position) + text + newContent.slice(position);
        break;
      case 'DELETE':
        newContent = newContent.slice(0, position) + newContent.slice(position + length);
        break;
      case 'REPLACE':
        newContent = newContent.slice(0, position) + text + newContent.slice(position + length);
        break;
    }
  }

  this.content = newContent;

  // Update participant activity
  const participant = this.participants.find(p =>
    p.user.toString() === userId.toString()
  );
  if (participant) {
    participant.lastActivity = new Date();
  }

  return this.save();
};

module.exports = mongoose.model('CodeSession', codeSessionSchema);