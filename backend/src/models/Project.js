const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    minlength: [3, 'Project name must be at least 3 characters'],
    maxlength: [100, 'Project name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Project owner is required']
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'completed'],
    default: 'active'
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  },
  tags: [{
    type: String,
    trim: true
  }],
  githubRepo: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(v);
      },
      message: 'Please provide a valid GitHub repository URL'
    }
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please provide a valid website URL'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
projectSchema.index({ owner: 1 });
projectSchema.index({ 'members.user': 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ visibility: 1 });

// Virtual for member count
projectSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Pre-save middleware to ensure owner is in members list
projectSchema.pre('save', function(next) {
  if (this.isNew) {
    // Add owner to members if not already present
    const ownerInMembers = this.members.some(member =>
      member.user.toString() === this.owner.toString()
    );

    if (!ownerInMembers) {
      this.members.push({
        user: this.owner,
        role: 'owner',
        joinedAt: new Date()
      });
    }
  }
  next();
});

// Static method to find projects by user
projectSchema.statics.findByUser = function(userId) {
  return this.find({
    $or: [
      { owner: userId },
      { 'members.user': userId }
    ]
  }).populate('owner', 'username firstName lastName avatar')
    .populate('members.user', 'username firstName lastName avatar');
};

module.exports = mongoose.model('Project', projectSchema);