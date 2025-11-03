const mongoose = require('mongoose');

const boardCardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Card title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProjectBoard',
    required: [true, 'Board is required']
  },
  column: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Column is required']
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  labels: [{
    type: String,
    trim: true
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  position: {
    type: Number,
    required: [true, 'Position is required'],
    min: 0
  },
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
boardCardSchema.index({ board: 1, column: 1, position: 1 });
boardCardSchema.index({ assignee: 1 });

// Pre-save middleware to validate column exists in board
boardCardSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('board') || this.isModified('column')) {
    const ProjectBoard = mongoose.model('ProjectBoard');
    const board = await ProjectBoard.findById(this.board);

    if (!board) {
      return next(new Error('Board not found'));
    }

    const columnExists = board.columns.some(col => col._id.toString() === this.column.toString());
    if (!columnExists) {
      return next(new Error('Column does not exist in this board'));
    }
  }
  next();
});

// Static method to find cards by board
boardCardSchema.statics.findByBoard = function(boardId) {
  return this.find({ board: boardId })
    .populate('assignee', 'username firstName lastName avatar')
    .populate('issue', 'title status priority')
    .sort({ position: 1 });
};

// Static method to find cards by column
boardCardSchema.statics.findByColumn = function(boardId, columnId) {
  return this.find({ board: boardId, column: columnId })
    .populate('assignee', 'username firstName lastName avatar')
    .populate('issue', 'title status priority')
    .sort({ position: 1 });
};

// Static method to find cards by assignee
boardCardSchema.statics.findByAssignee = function(assigneeId, boardId = null) {
  const query = { assignee: assigneeId };
  if (boardId) query.board = boardId;

  return this.find(query)
    .populate('board', 'name project')
    .populate('issue', 'title status priority')
    .sort({ updatedAt: -1 });
};

// Instance method to move card to different column/position
boardCardSchema.methods.moveTo = async function(targetColumnId, targetPosition) {
  const BoardCard = mongoose.model('BoardCard');

  // Start a session for atomic operations
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Remove card from current position
    await BoardCard.updateMany(
      {
        board: this.board,
        column: this.column,
        position: { $gt: this.position }
      },
      { $inc: { position: -1 } },
      { session }
    );

    // Add card to new position
    await BoardCard.updateMany(
      {
        board: this.board,
        column: targetColumnId,
        position: { $gte: targetPosition }
      },
      { $inc: { position: 1 } },
      { session }
    );

    // Update card
    this.column = targetColumnId;
    this.position = targetPosition;
    await this.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return this;
};

// Instance method to update position within same column
boardCardSchema.methods.updatePosition = async function(newPosition) {
  if (this.position === newPosition) return this;

  const BoardCard = mongoose.model('BoardCard');

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (newPosition > this.position) {
      // Moving down: shift cards up
      await BoardCard.updateMany(
        {
          board: this.board,
          column: this.column,
          position: { $gt: this.position, $lte: newPosition }
        },
        { $inc: { position: -1 } },
        { session }
      );
    } else {
      // Moving up: shift cards down
      await BoardCard.updateMany(
        {
          board: this.board,
          column: this.column,
          position: { $gte: newPosition, $lt: this.position }
        },
        { $inc: { position: 1 } },
        { session }
      );
    }

    this.position = newPosition;
    await this.save({ session });

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }

  return this;
};

module.exports = mongoose.model('BoardCard', boardCardSchema);