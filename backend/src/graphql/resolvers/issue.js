const { Issue, Project, User } = require('../../models');

const issueResolvers = {
  Query: {
    issue: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const issue = await Issue.findById(id)
          .populate('project', 'name visibility')
          .populate('creator', 'username firstName lastName avatar')
          .populate('assignee', 'username firstName lastName avatar')
          .populate('comments.author', 'username firstName lastName avatar');

        if (!issue) {
          throw new Error('Issue not found');
        }

        // Check if user has access to the project
        const project = await Project.findById(issue.project._id);
        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner && project.visibility !== 'public') {
          throw new Error('Access denied');
        }

        return issue;
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch issue');
      }
    },

    issues: async (parent, { projectId, filters = {}, limit = 20, offset = 0 }, context) => {
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

        return await Issue.findByProject(projectId, filters, limit, offset);
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch issues');
      }
    },

    projectIssues: async (parent, { projectId, filters = {}, limit = 20, offset = 0 }, context) => {
      // Alias for issues query
      return issueResolvers.Query.issues(parent, { projectId, filters, limit, offset }, context);
    },

    myAssignedIssues: async (parent, { limit = 20, offset = 0 }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const issues = await Issue.find({
          assignee: context.user._id,
          status: { $ne: 'closed' }
        })
          .populate('project', 'name')
          .populate('creator', 'username firstName lastName avatar')
          .sort({ updatedAt: -1 })
          .limit(limit)
          .skip(offset);

        return issues;
      } catch (error) {
        throw new Error('Failed to fetch assigned issues');
      }
    },

    issueComments: async (parent, { issueId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const issue = await Issue.findById(issueId).populate('comments.author', 'username firstName lastName avatar');
        if (!issue) {
          throw new Error('Issue not found');
        }

        return issue.comments;
      } catch (error) {
        throw new Error('Failed to fetch issue comments');
      }
    }
  },

  Mutation: {
    createIssue: async (parent, { projectId, input }, context) => {
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

        const issue = new Issue({
          ...input,
          project: projectId,
          creator: context.user._id
        });

        await issue.save();

        return await Issue.findById(issue._id)
          .populate('project', 'name')
          .populate('creator', 'username firstName lastName avatar')
          .populate('assignee', 'username firstName lastName avatar');
      } catch (error) {
        throw new Error(error.message || 'Failed to create issue');
      }
    },

    updateIssue: async (parent, { id, input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const issue = await Issue.findById(id).populate('project');
        if (!issue) {
          throw new Error('Issue not found');
        }

        // Check project access
        const project = issue.project;
        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner) {
          throw new Error('Access denied');
        }

        const updatedIssue = await Issue.findByIdAndUpdate(id, input, { new: true })
          .populate('project', 'name')
          .populate('creator', 'username firstName lastName avatar')
          .populate('assignee', 'username firstName lastName avatar')
          .populate('comments.author', 'username firstName lastName avatar');

        return updatedIssue;
      } catch (error) {
        throw new Error(error.message || 'Failed to update issue');
      }
    },

    deleteIssue: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const issue = await Issue.findById(id).populate('project');
        if (!issue) {
          throw new Error('Issue not found');
        }

        // Check permissions (only creator or project admin/owner can delete)
        const project = issue.project;
        const membership = project.members.find(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();
        const isAdmin = membership && membership.role === 'admin';
        const isCreator = issue.creator.toString() === context.user._id.toString();

        if (!isOwner && !isAdmin && !isCreator) {
          throw new Error('Access denied');
        }

        await Issue.findByIdAndDelete(id);
        return true;
      } catch (error) {
        throw new Error(error.message || 'Failed to delete issue');
      }
    },

    addIssueComment: async (parent, { issueId, input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const issue = await Issue.findById(issueId).populate('project');
        if (!issue) {
          throw new Error('Issue not found');
        }

        // Check project access
        const project = issue.project;
        const isMember = project.members.some(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();

        if (!isMember && !isOwner && project.visibility !== 'public') {
          throw new Error('Access denied');
        }

        const comment = await issue.addComment(context.user._id, input.content);

        // Populate the newly added comment
        await issue.populate('comments.author', 'username firstName lastName avatar');

        return issue.comments[issue.comments.length - 1];
      } catch (error) {
        throw new Error(error.message || 'Failed to add comment');
      }
    },

    updateIssueComment: async (parent, { issueId, commentId, content }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const issue = await Issue.findById(issueId);
        if (!issue) {
          throw new Error('Issue not found');
        }

        const comment = issue.comments.id(commentId);
        if (!comment) {
          throw new Error('Comment not found');
        }

        // Only comment author can edit
        if (comment.author.toString() !== context.user._id.toString()) {
          throw new Error('Access denied');
        }

        comment.content = content;
        comment.updatedAt = new Date();
        await issue.save();

        await issue.populate('comments.author', 'username firstName lastName avatar');

        return comment;
      } catch (error) {
        throw new Error(error.message || 'Failed to update comment');
      }
    },

    deleteIssueComment: async (parent, { issueId, commentId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const issue = await Issue.findById(issueId);
        if (!issue) {
          throw new Error('Issue not found');
        }

        const comment = issue.comments.id(commentId);
        if (!comment) {
          throw new Error('Comment not found');
        }

        // Only comment author or project admin/owner can delete
        const project = await Project.findById(issue.project);
        const membership = project.members.find(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();
        const isAdmin = membership && membership.role === 'admin';
        const isAuthor = comment.author.toString() === context.user._id.toString();

        if (!isOwner && !isAdmin && !isAuthor) {
          throw new Error('Access denied');
        }

        issue.comments.pull(commentId);
        await issue.save();

        return true;
      } catch (error) {
        throw new Error(error.message || 'Failed to delete comment');
      }
    }
  }
};

module.exports = issueResolvers;