const { ProjectBoard, BoardCard, Project, User } = require('../../models');

const boardResolvers = {
  Query: {
    projectBoards: async (parent, { projectId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

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

        return await ProjectBoard.findByProject(projectId);
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch project boards');
      }
    },

    projectBoard: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const board = await ProjectBoard.findById(id).populate('project');
        if (!board) {
          throw new Error('Board not found');
        }

        // Check project access
        const project = board.project;
        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner && project.visibility !== 'public') {
          throw new Error('Access denied');
        }

        return board;
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch board');
      }
    },

    boardCards: async (parent, { boardId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        return await BoardCard.findByBoard(boardId);
      } catch (error) {
        throw new Error('Failed to fetch board cards');
      }
    },

    boardCardsByColumn: async (parent, { boardId, columnId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        return await BoardCard.findByColumn(boardId, columnId);
      } catch (error) {
        throw new Error('Failed to fetch board cards by column');
      }
    }
  },

  Mutation: {
    createProjectBoard: async (parent, { projectId, input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        // Check project access and permissions
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

        const board = new ProjectBoard({
          name: input.name,
          project: projectId,
          columns: [
            { name: 'To Do', position: 0, color: '#e3f2fd' },
            { name: 'In Progress', position: 1, color: '#fff3e0' },
            { name: 'Review', position: 2, color: '#f3e5f5' },
            { name: 'Done', position: 3, color: '#e8f5e8' }
          ]
        });

        await board.save();
        return await ProjectBoard.findById(board._id).populate('project');
      } catch (error) {
        throw new Error(error.message || 'Failed to create board');
      }
    },

    updateProjectBoard: async (parent, { id, name }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const board = await ProjectBoard.findById(id).populate('project');
        if (!board) {
          throw new Error('Board not found');
        }

        // Check project permissions
        const project = board.project;
        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner) {
          throw new Error('Access denied');
        }

        board.name = name;
        await board.save();

        return board;
      } catch (error) {
        throw new Error(error.message || 'Failed to update board');
      }
    },

    deleteProjectBoard: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const board = await ProjectBoard.findById(id).populate('project');
        if (!board) {
          throw new Error('Board not found');
        }

        // Check project permissions
        const project = board.project;
        const membership = project.members.find(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();
        const isAdmin = membership && membership.role === 'admin';

        if (!isOwner && !isAdmin) {
          throw new Error('Access denied');
        }

        // Delete all cards in the board first
        await BoardCard.deleteMany({ board: id });

        await ProjectBoard.findByIdAndDelete(id);
        return true;
      } catch (error) {
        throw new Error(error.message || 'Failed to delete board');
      }
    },

    addBoardColumn: async (parent, { boardId, input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const board = await ProjectBoard.findById(boardId).populate('project');
        if (!board) {
          throw new Error('Board not found');
        }

        // Check project permissions
        const project = board.project;
        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner) {
          throw new Error('Access denied');
        }

        await board.addColumn(input.name, input.position, {
          limit: input.limit,
          color: input.color
        });

        return await ProjectBoard.findById(boardId).populate('project');
      } catch (error) {
        throw new Error(error.message || 'Failed to add column');
      }
    },

    updateBoardColumn: async (parent, { boardId, columnId, input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const board = await ProjectBoard.findById(boardId).populate('project');
        if (!board) {
          throw new Error('Board not found');
        }

        // Check project permissions
        const project = board.project;
        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner) {
          throw new Error('Access denied');
        }

        await board.updateColumn(columnId, input);

        return await ProjectBoard.findById(boardId).populate('project');
      } catch (error) {
        throw new Error(error.message || 'Failed to update column');
      }
    },

    removeBoardColumn: async (parent, { boardId, columnId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const board = await ProjectBoard.findById(boardId).populate('project');
        if (!board) {
          throw new Error('Board not found');
        }

        // Check project permissions
        const project = board.project;
        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner) {
          throw new Error('Access denied');
        }

        await board.removeColumn(columnId);

        return await ProjectBoard.findById(boardId).populate('project');
      } catch (error) {
        throw new Error(error.message || 'Failed to remove column');
      }
    },

    reorderBoardColumns: async (parent, { boardId, columnOrder }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const board = await ProjectBoard.findById(boardId).populate('project');
        if (!board) {
          throw new Error('Board not found');
        }

        // Check project permissions
        const project = board.project;
        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner) {
          throw new Error('Access denied');
        }

        await board.reorderColumns(columnOrder);

        return await ProjectBoard.findById(boardId).populate('project');
      } catch (error) {
        throw new Error(error.message || 'Failed to reorder columns');
      }
    },

    createBoardCard: async (parent, { boardId, columnId, input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const board = await ProjectBoard.findById(boardId).populate('project');
        if (!board) {
          throw new Error('Board not found');
        }

        // Check project permissions
        const project = board.project;
        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner) {
          throw new Error('Access denied');
        }

        // Get the highest position in the column
        const lastCard = await BoardCard.findOne({ board: boardId, column: columnId })
          .sort({ position: -1 });

        const position = lastCard ? lastCard.position + 1 : 0;

        const card = new BoardCard({
          ...input,
          board: boardId,
          column: columnId,
          position
        });

        await card.save();

        return await BoardCard.findById(card._id)
          .populate('assignee', 'username firstName lastName avatar')
          .populate('issue', 'title status priority');
      } catch (error) {
        throw new Error(error.message || 'Failed to create card');
      }
    },

    updateBoardCard: async (parent, { id, input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const card = await BoardCard.findById(id).populate('board');
        if (!card) {
          throw new Error('Card not found');
        }

        // Check board permissions through project
        const board = await ProjectBoard.findById(card.board).populate('project');
        const project = board.project;
        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner) {
          throw new Error('Access denied');
        }

        Object.assign(card, input);
        await card.save();

        return await BoardCard.findById(id)
          .populate('assignee', 'username firstName lastName avatar')
          .populate('issue', 'title status priority');
      } catch (error) {
        throw new Error(error.message || 'Failed to update card');
      }
    },

    deleteBoardCard: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const card = await BoardCard.findById(id).populate('board');
        if (!card) {
          throw new Error('Card not found');
        }

        // Check board permissions through project
        const board = await ProjectBoard.findById(card.board).populate('project');
        const project = board.project;
        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner) {
          throw new Error('Access denied');
        }

        await BoardCard.findByIdAndDelete(id);
        return true;
      } catch (error) {
        throw new Error(error.message || 'Failed to delete card');
      }
    },

    moveBoardCard: async (parent, { input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const { cardId, targetColumnId, targetPosition } = input;

        const card = await BoardCard.findById(cardId).populate('board');
        if (!card) {
          throw new Error('Card not found');
        }

        // Check board permissions through project
        const board = await ProjectBoard.findById(card.board).populate('project');
        const project = board.project;
        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner) {
          throw new Error('Access denied');
        }

        await card.moveTo(targetColumnId, targetPosition);

        return await BoardCard.findById(cardId)
          .populate('assignee', 'username firstName lastName avatar')
          .populate('issue', 'title status priority');
      } catch (error) {
        throw new Error(error.message || 'Failed to move card');
      }
    },

    reorderBoardCards: async (parent, { boardId, columnId, cardOrder }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        // Check board permissions through project
        const board = await ProjectBoard.findById(boardId).populate('project');
        const project = board.project;
        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner) {
          throw new Error('Access denied');
        }

        // Update positions for all cards in the column
        for (let i = 0; i < cardOrder.length; i++) {
          await BoardCard.findByIdAndUpdate(cardOrder[i], { position: i });
        }

        return true;
      } catch (error) {
        throw new Error(error.message || 'Failed to reorder cards');
      }
    }
  },

  ProjectBoard: {
    columns: async (parent) => {
      // Return columns with their cards populated
      const columnsWithCards = await Promise.all(
        parent.columns.map(async (column) => {
          const cards = await BoardCard.findByColumn(parent._id, column._id)
            .populate('assignee', 'username firstName lastName avatar')
            .populate('issue', 'title status priority');

          return {
            ...column.toObject(),
            cards,
            cardCount: cards.length
          };
        })
      );

      return columnsWithCards;
    }
  }
};

module.exports = boardResolvers;