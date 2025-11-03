const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Issue title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Issue description is required']
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
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'review', 'closed'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  labels: [{
    type: String,
    trim: true
  }],
  comments: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: [true, 'Comment content is required']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  dueDate: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
issueSchema.index({ project: 1 });
issueSchema.index({ creator: 1 });
issueSchema.index({ assignee: 1 });
issueSchema.index({ status: 1 });
issueSchema.index({ priority: 1 });

// Virtual for comment count
issueSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Pre-save middleware to update comment timestamps
issueSchema.pre('save', function(next) {
  if (this.isModified('comments')) {
    this.comments.forEach(comment => {
      if (comment.isNew) {
        comment.createdAt = new Date();
        comment.updatedAt = new Date();
      } else if (comment.isModified()) {
        comment.updatedAt = new Date();
      }
    });
  }
  next();
});

// Static method to find issues by project
issueSchema.statics.findByProject = function(projectId, filters = {}) {
  const query = { project: projectId };

  if (filters.status) query.status = filters.status;
  if (filters.assignee) query.assignee = filters.assignee;
  if (filters.creator) query.creator = filters.creator;
  if (filters.labels && filters.labels.length > 0) {
    query.labels = { $in: filters.labels };
  }

  return this.find(query)
    .populate('creator', 'username firstName lastName avatar')
    .populate('assignee', 'username firstName lastName avatar')
    .sort({ createdAt: -1 });
};

// Instance method to add comment
issueSchema.methods.addComment = function(authorId, content) {
  this.comments.push({
    author: authorId,
    content: content.trim()
  });
  return this.save();
};

module.exports = mongoose.model('Issue', issueSchema);