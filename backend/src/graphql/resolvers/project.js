const { Project, User } = require('../../models');

const projectResolvers = {
  Query: {
    project: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const project = await Project.findById(id)
          .populate('owner', 'username firstName lastName avatar')
          .populate('members.user', 'username firstName lastName avatar');

        if (!project) {
          throw new Error('Project not found');
        }

        // Check if user has access to this project
        const isMember = project.members.some(member =>
          member.user._id.toString() === context.user._id.toString()
        );
        const isOwner = project.owner._id.toString() === context.user._id.toString();

        if (!isMember && !isOwner && project.visibility !== 'public') {
          throw new Error('Access denied');
        }

        return project;
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch project');
      }
    },

    projects: async (parent, { limit = 20, offset = 0, status, visibility }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const filter = {};

        if (status) filter.status = status;
        if (visibility) filter.visibility = visibility;

        // For non-public projects, only show projects user is member of
        if (visibility !== 'public') {
          filter.$or = [
            { owner: context.user._id },
            { 'members.user': context.user._id }
          ];
        }

        const projects = await Project.find(filter)
          .populate('owner', 'username firstName lastName avatar')
          .populate('members.user', 'username firstName lastName avatar')
          .limit(limit)
          .skip(offset)
          .sort({ updatedAt: -1 });

        return projects;
      } catch (error) {
        throw new Error('Failed to fetch projects');
      }
    },

    myProjects: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        return await Project.findByUser(context.user._id);
      } catch (error) {
        throw new Error('Failed to fetch user projects');
      }
    },

    userProjects: async (parent, { userId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const projects = await Project.find({
          $or: [
            { owner: userId, visibility: 'public' },
            { 'members.user': userId, visibility: 'public' }
          ]
        })
          .populate('owner', 'username firstName lastName avatar')
          .populate('members.user', 'username firstName lastName avatar')
          .sort({ updatedAt: -1 });

        return projects;
      } catch (error) {
        throw new Error('Failed to fetch user projects');
      }
    },

    searchProjects: async (parent, { query, limit = 10 }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const searchRegex = new RegExp(query, 'i');
        const projects = await Project.find({
          $or: [
            { owner: context.user._id },
            { 'members.user': context.user._id },
            { visibility: 'public' }
          ],
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { tags: { $in: [searchRegex] } }
          ]
        })
          .populate('owner', 'username firstName lastName avatar')
          .populate('members.user', 'username firstName lastName avatar')
          .limit(limit)
          .sort({ updatedAt: -1 });

        return projects;
      } catch (error) {
        throw new Error('Failed to search projects');
      }
    }
  },

  Mutation: {
    createProject: async (parent, { input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const project = new Project({
          ...input,
          owner: context.user._id
        });

        await project.save();

        return await Project.findById(project._id)
          .populate('owner', 'username firstName lastName avatar')
          .populate('members.user', 'username firstName lastName avatar');
      } catch (error) {
        throw new Error(error.message || 'Failed to create project');
      }
    },

    updateProject: async (parent, { id, input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const project = await Project.findById(id);
        if (!project) {
          throw new Error('Project not found');
        }

        // Check if user is owner or admin
        const membership = project.members.find(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();
        const isAdmin = membership && membership.role === 'admin';

        if (!isOwner && !isAdmin) {
          throw new Error('Access denied');
        }

        const updatedProject = await Project.findByIdAndUpdate(
          id,
          input,
          { new: true, runValidators: true }
        )
          .populate('owner', 'username firstName lastName avatar')
          .populate('members.user', 'username firstName lastName avatar');

        return updatedProject;
      } catch (error) {
        throw new Error(error.message || 'Failed to update project');
      }
    },

    deleteProject: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const project = await Project.findById(id);
        if (!project) {
          throw new Error('Project not found');
        }

        // Only owner can delete project
        if (project.owner.toString() !== context.user._id.toString()) {
          throw new Error('Access denied');
        }

        await Project.findByIdAndDelete(id);
        return true;
      } catch (error) {
        throw new Error(error.message || 'Failed to delete project');
      }
    },

    addProjectMember: async (parent, { projectId, input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const project = await Project.findById(projectId);
        if (!project) {
          throw new Error('Project not found');
        }

        // Check if user has permission to add members
        const membership = project.members.find(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();
        const isAdmin = membership && membership.role === 'admin';

        if (!isOwner && !isAdmin) {
          throw new Error('Access denied');
        }

        // Check if user to add exists
        const userToAdd = await User.findById(input.userId);
        if (!userToAdd) {
          throw new Error('User not found');
        }

        // Check if user is already a member
        const isAlreadyMember = project.members.some(member =>
          member.user.toString() === input.userId
        );

        if (isAlreadyMember) {
          throw new Error('User is already a member of this project');
        }

        project.members.push({
          user: input.userId,
          role: input.role || 'member',
          joinedAt: new Date()
        });

        await project.save();

        return await Project.findById(projectId)
          .populate('owner', 'username firstName lastName avatar')
          .populate('members.user', 'username firstName lastName avatar');
      } catch (error) {
        throw new Error(error.message || 'Failed to add project member');
      }
    },

    updateProjectMember: async (parent, { projectId, input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const project = await Project.findById(projectId);
        if (!project) {
          throw new Error('Project not found');
        }

        // Only owner can update member roles
        if (project.owner.toString() !== context.user._id.toString()) {
          throw new Error('Access denied');
        }

        const memberIndex = project.members.findIndex(member =>
          member.user.toString() === input.userId
        );

        if (memberIndex === -1) {
          throw new Error('User is not a member of this project');
        }

        project.members[memberIndex].role = input.role;
        await project.save();

        return await Project.findById(projectId)
          .populate('owner', 'username firstName lastName avatar')
          .populate('members.user', 'username firstName lastName avatar');
      } catch (error) {
        throw new Error(error.message || 'Failed to update project member');
      }
    },

    removeProjectMember: async (parent, { projectId, userId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const project = await Project.findById(projectId);
        if (!project) {
          throw new Error('Project not found');
        }

        // Check permissions
        const membership = project.members.find(member =>
          member.user.toString() === context.user._id.toString()
        );
        const isOwner = project.owner.toString() === context.user._id.toString();
        const isAdmin = membership && membership.role === 'admin';

        if (!isOwner && !isAdmin) {
          throw new Error('Access denied');
        }

        // Cannot remove owner
        if (userId === project.owner.toString()) {
          throw new Error('Cannot remove project owner');
        }

        project.members = project.members.filter(member =>
          member.user.toString() !== userId
        );

        await project.save();

        return await Project.findById(projectId)
          .populate('owner', 'username firstName lastName avatar')
          .populate('members.user', 'username firstName lastName avatar');
      } catch (error) {
        throw new Error(error.message || 'Failed to remove project member');
      }
    },

    leaveProject: async (parent, { projectId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const project = await Project.findById(projectId);
        if (!project) {
          throw new Error('Project not found');
        }

        // Cannot leave if owner
        if (project.owner.toString() === context.user._id.toString()) {
          throw new Error('Project owner cannot leave the project');
        }

        project.members = project.members.filter(member =>
          member.user.toString() !== context.user._id.toString()
        );

        await project.save();
        return true;
      } catch (error) {
        throw new Error(error.message || 'Failed to leave project');
      }
    }
  }
};

module.exports = projectResolvers;