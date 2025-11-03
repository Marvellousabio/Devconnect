const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Repository name is required'],
    trim: true,
    minlength: [3, 'Repository name must be at least 3 characters'],
    maxlength: [100, 'Repository name cannot exceed 100 characters']
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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'private'
  },
  defaultBranch: {
    type: String,
    default: 'main',
    trim: true
  },
  language: {
    type: String,
    trim: true
  },
  stars: {
    type: Number,
    default: 0,
    min: 0
  },
  forks: {
    type: Number,
    default: 0,
    min: 0
  },
  watchers: {
    type: Number,
    default: 0,
    min: 0
  },
  license: {
    type: String,
    trim: true
  },
  topics: [{
    type: String,
    trim: true
  }],
  githubUrl: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(v);
      },
      message: 'Please provide a valid GitHub repository URL'
    }
  },
  lastSync: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
repositorySchema.index({ project: 1 });
repositorySchema.index({ owner: 1 });
repositorySchema.index({ visibility: 1 });
repositorySchema.index({ language: 1 });

// Compound index to ensure unique repository names within a project
repositorySchema.index({ project: 1, name: 1 }, { unique: true });

// Virtual for full repository path
repositorySchema.virtual('fullName').get(function() {
  return `${this.owner.username}/${this.name}`;
});

// Pre-save middleware to validate uniqueness within project
repositorySchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingRepo = await this.constructor.findOne({
      project: this.project,
      name: this.name
    });

    if (existingRepo) {
      const error = new Error('Repository name already exists in this project');
      return next(error);
    }
  }
  next();
});

// Static method to find repositories by project
repositorySchema.statics.findByProject = function(projectId, filters = {}) {
  const query = { project: projectId };

  if (filters.visibility) query.visibility = filters.visibility;
  if (filters.language) query.language = filters.language;
  if (filters.owner) query.owner = filters.owner;

  return this.find(query)
    .populate('owner', 'username firstName lastName avatar')
    .sort({ updatedAt: -1 });
};

// Static method to find public repositories
repositorySchema.statics.findPublic = function(limit = 20, sortBy = 'stars') {
  const sortOptions = {
    stars: { stars: -1 },
    updated: { updatedAt: -1 },
    created: { createdAt: -1 }
  };

  return this.find({ visibility: 'public' })
    .populate('owner', 'username firstName lastName avatar')
    .populate('project', 'name description')
    .sort(sortOptions[sortBy] || sortOptions.stars)
    .limit(limit);
};

// Instance method to increment stats
repositorySchema.methods.incrementStat = function(stat, amount = 1) {
  if (['stars', 'forks', 'watchers'].includes(stat)) {
    this[stat] = Math.max(0, this[stat] + amount);
    return this.save();
  }
  throw new Error('Invalid stat type');
};

module.exports = mongoose.model('Repository', repositorySchema);