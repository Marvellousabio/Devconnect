const mongoose = require('mongoose');

const projectBoardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Board name is required'],
    trim: true,
    minlength: [3, 'Board name must be at least 3 characters'],
    maxlength: [100, 'Board name cannot exceed 100 characters']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project is required']
  },
  columns: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true
    },
    name: {
      type: String,
      required: [true, 'Column name is required'],
      trim: true
    },
    position: {
      type: Number,
      required: [true, 'Column position is required'],
      min: 0
    },
    limit: {
      type: Number,
      min: 0
    },
    color: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty
          return /^#[0-9A-F]{6}$/i.test(v);
        },
        message: 'Color must be a valid hex color code'
      }
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
projectBoardSchema.index({ project: 1 });

// Virtual for total cards count
projectBoardSchema.virtual('totalCards').get(async function() {
  const BoardCard = mongoose.model('BoardCard');
  const cards = await BoardCard.find({ board: this._id });
  return cards.length;
});

// Pre-save middleware to ensure unique column positions
projectBoardSchema.pre('save', function(next) {
  if (this.isModified('columns')) {
    const positions = this.columns.map(col => col.position);
    const uniquePositions = [...new Set(positions)];

    if (positions.length !== uniquePositions.length) {
      return next(new Error('Column positions must be unique'));
    }
  }
  next();
});

// Static method to find boards by project
projectBoardSchema.statics.findByProject = function(projectId) {
  return this.find({ project: projectId })
    .sort({ createdAt: -1 });
};

// Instance method to add column
projectBoardSchema.methods.addColumn = function(name, position, options = {}) {
  const newColumn = {
    name: name.trim(),
    position: position,
    limit: options.limit,
    color: options.color
  };

  this.columns.push(newColumn);
  return this.save();
};

// Instance method to update column
projectBoardSchema.methods.updateColumn = function(columnId, updates) {
  const column = this.columns.id(columnId);
  if (!column) {
    throw new Error('Column not found');
  }

  if (updates.name) column.name = updates.name.trim();
  if (updates.position !== undefined) column.position = updates.position;
  if (updates.limit !== undefined) column.limit = updates.limit;
  if (updates.color !== undefined) column.color = updates.color;

  return this.save();
};

// Instance method to remove column
projectBoardSchema.methods.removeColumn = function(columnId) {
  const columnIndex = this.columns.findIndex(col => col._id.toString() === columnId);
  if (columnIndex === -1) {
    throw new Error('Column not found');
  }

  // Check if column has cards
  const BoardCard = mongoose.model('BoardCard');
  const cardCount = await BoardCard.countDocuments({ board: this._id, column: columnId });

  if (cardCount > 0) {
    throw new Error('Cannot remove column with existing cards');
  }

  this.columns.splice(columnIndex, 1);
  return this.save();
};

// Instance method to reorder columns
projectBoardSchema.methods.reorderColumns = function(columnOrder) {
  if (columnOrder.length !== this.columns.length) {
    throw new Error('Column order array must match number of columns');
  }

  const reorderedColumns = columnOrder.map((columnId, index) => {
    const column = this.columns.id(columnId);
    if (!column) {
      throw new Error(`Column ${columnId} not found`);
    }
    column.position = index;
    return column;
  });

  this.columns = reorderedColumns;
  return this.save();
};

module.exports = mongoose.model('ProjectBoard', projectBoardSchema);