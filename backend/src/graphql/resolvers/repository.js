const { Repository, Project, User } = require('../../models');
const https = require('https');

// Helper function to fetch GitHub repository data
function fetchGitHubRepo(owner, repo) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}`,
      method: 'GET',
      headers: {
        'User-Agent': 'DevConnect-App',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const repoData = JSON.parse(data);
            resolve(repoData);
          } else {
            reject(new Error(`GitHub API returned ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

const repositoryResolvers = {
  Query: {
    repositories: async (parent, { projectId }, context) => {
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

        return await Repository.findByProject(projectId);
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch repositories');
      }
    },

    repository: async (parent, { id }, context) => {
      try {
        const repository = await Repository.findById(id)
          .populate('project', 'name visibility')
          .populate('owner', 'username firstName lastName avatar');

        if (!repository) {
          throw new Error('Repository not found');
        }

        // Check access for private repositories
        if (repository.visibility === 'private') {
          if (!context.user) {
            throw new Error('Not authenticated');
          }

          const project = repository.project;
          const isMember = project.members.some(member =>
            member.user.toString() === context.user._id.toString()
          );
          const isOwner = project.owner.toString() === context.user._id.toString();

          if (!isMember && !isOwner) {
            throw new Error('Access denied');
          }
        }

        return repository;
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch repository');
      }
    },

    publicRepositories: async (parent, { limit = 20, language, sortBy = 'stars' }, context) => {
      try {
        return await Repository.findPublic(limit, sortBy);
      } catch (error) {
        throw new Error('Failed to fetch public repositories');
      }
    },

    userRepositories: async (parent, { userId }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        // Only allow users to see their own repositories or public ones
        if (userId !== context.user._id.toString()) {
          // Return only public repositories for other users
          return await Repository.find({
            owner: userId,
            visibility: 'public'
          })
            .populate('project', 'name')
            .sort({ updatedAt: -1 });
        }

        // Return all repositories for the current user
        return await Repository.find({ owner: userId })
          .populate('project', 'name')
          .sort({ updatedAt: -1 });
      } catch (error) {
        throw new Error('Failed to fetch user repositories');
      }
    },

    searchRepositories: async (parent, { query, limit = 10 }, context) => {
      try {
        const searchRegex = new RegExp(query, 'i');

        let filter = {
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { topics: { $in: [searchRegex] } },
            { language: searchRegex }
          ]
        };

        // If not authenticated, only show public repositories
        if (!context.user) {
          filter.visibility = 'public';
        } else {
          // Show public repositories and private ones the user has access to
          const userProjects = await Project.find({
            $or: [
              { owner: context.user._id },
              { 'members.user': context.user._id }
            ]
          });

          const projectIds = userProjects.map(p => p._id);

          filter.$or = [
            { visibility: 'public' },
            { project: { $in: projectIds } }
          ];
        }

        return await Repository.find(filter)
          .populate('owner', 'username firstName lastName avatar')
          .populate('project', 'name')
          .limit(limit)
          .sort({ stars: -1 });
      } catch (error) {
        throw new Error('Failed to search repositories');
      }
    }
  },

  Mutation: {
    createRepository: async (parent, { projectId, input }, context) => {
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

        const repository = new Repository({
          ...input,
          project: projectId,
          owner: context.user._id
        });

        await repository.save();

        return await Repository.findById(repository._id)
          .populate('project', 'name')
          .populate('owner', 'username firstName lastName avatar');
      } catch (error) {
        throw new Error(error.message || 'Failed to create repository');
      }
    },

    updateRepository: async (parent, { id, input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const repository = await Repository.findById(id).populate('project');
        if (!repository) {
          throw new Error('Repository not found');
        }

        // Check permissions (owner or project admin)
        const project = repository.project;
        const isRepoOwner = repository.owner.toString() === context.user._id.toString();
        const isProjectOwner = project.owner.toString() === context.user._id.toString();
        const isProjectAdmin = project.members.some(member =>
          member.user.toString() === context.user._id.toString() && member.role === 'admin'
        );

        if (!isRepoOwner && !isProjectOwner && !isProjectAdmin) {
          throw new Error('Access denied');
        }

        const updatedRepository = await Repository.findByIdAndUpdate(
          id,
          input,
          { new: true, runValidators: true }
        )
          .populate('project', 'name')
          .populate('owner', 'username firstName lastName avatar');

        return updatedRepository;
      } catch (error) {
        throw new Error(error.message || 'Failed to update repository');
      }
    },

    deleteRepository: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const repository = await Repository.findById(id).populate('project');
        if (!repository) {
          throw new Error('Repository not found');
        }

        // Check permissions (owner or project admin)
        const project = repository.project;
        const isRepoOwner = repository.owner.toString() === context.user._id.toString();
        const isProjectOwner = project.owner.toString() === context.user._id.toString();
        const isProjectAdmin = project.members.some(member =>
          member.user.toString() === context.user._id.toString() && member.role === 'admin'
        );

        if (!isRepoOwner && !isProjectOwner && !isProjectAdmin) {
          throw new Error('Access denied');
        }

        await Repository.findByIdAndDelete(id);
        return true;
      } catch (error) {
        throw new Error(error.message || 'Failed to delete repository');
      }
    },

    starRepository: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const repository = await Repository.findById(id);
        if (!repository) {
          throw new Error('Repository not found');
        }

        await repository.incrementStat('stars', 1);

        return await Repository.findById(id)
          .populate('project', 'name')
          .populate('owner', 'username firstName lastName avatar');
      } catch (error) {
        throw new Error(error.message || 'Failed to star repository');
      }
    },

    unstarRepository: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const repository = await Repository.findById(id);
        if (!repository) {
          throw new Error('Repository not found');
        }

        await repository.incrementStat('stars', -1);

        return await Repository.findById(id)
          .populate('project', 'name')
          .populate('owner', 'username firstName lastName avatar');
      } catch (error) {
        throw new Error(error.message || 'Failed to unstar repository');
      }
    },

    forkRepository: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const originalRepo = await Repository.findById(id).populate('project');
        if (!originalRepo) {
          throw new Error('Repository not found');
        }

        // Check if user already forked this repository
        const existingFork = await Repository.findOne({
          name: `${originalRepo.name}-fork`,
          owner: context.user._id,
          project: originalRepo.project._id
        });

        if (existingFork) {
          throw new Error('Repository already forked');
        }

        // Create fork
        const fork = new Repository({
          name: `${originalRepo.name}-fork`,
          description: `Fork of ${originalRepo.name}`,
          project: originalRepo.project._id,
          owner: context.user._id,
          visibility: 'private', // Forks are private by default
          defaultBranch: originalRepo.defaultBranch,
          language: originalRepo.language,
          license: originalRepo.license,
          topics: [...originalRepo.topics],
          githubUrl: originalRepo.githubUrl
        });

        await fork.save();
        await originalRepo.incrementStat('forks', 1);

        return await Repository.findById(fork._id)
          .populate('project', 'name')
          .populate('owner', 'username firstName lastName avatar');
      } catch (error) {
        throw new Error(error.message || 'Failed to fork repository');
      }
    },

    watchRepository: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const repository = await Repository.findById(id);
        if (!repository) {
          throw new Error('Repository not found');
        }

        await repository.incrementStat('watchers', 1);

        return await Repository.findById(id)
          .populate('project', 'name')
          .populate('owner', 'username firstName lastName avatar');
      } catch (error) {
        throw new Error(error.message || 'Failed to watch repository');
      }
    },

    unwatchRepository: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const repository = await Repository.findById(id);
        if (!repository) {
          throw new Error('Repository not found');
        }

        await repository.incrementStat('watchers', -1);

        return await Repository.findById(id)
          .populate('project', 'name')
          .populate('owner', 'username firstName lastName avatar');
      } catch (error) {
        throw new Error(error.message || 'Failed to unwatch repository');
      }
    },

    syncRepository: async (parent, { id }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const repository = await Repository.findById(id);
        if (!repository) {
          throw new Error('Repository not found');
        }

        // Check permissions
        const isOwner = repository.owner.toString() === context.user._id.toString();
        if (!isOwner) {
          throw new Error('Access denied');
        }

        // Check if repository has GitHub URL
        if (!repository.githubUrl) {
          throw new Error('Repository does not have a GitHub URL configured');
        }

        // Extract owner and repo name from GitHub URL
        const urlMatch = repository.githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!urlMatch) {
          throw new Error('Invalid GitHub URL format');
        }

        const [, githubOwner, githubRepo] = urlMatch;

        try {
          // Fetch repository data from GitHub API
          const githubData = await fetchGitHubRepo(githubOwner, githubRepo);

          // Update repository with GitHub data
          repository.description = githubData.description || repository.description;
          repository.language = githubData.language || repository.language;
          repository.stars = githubData.stargazers_count || 0;
          repository.forks = githubData.forks_count || 0;
          repository.watchers = githubData.watchers_count || 0;
          repository.license = githubData.license?.name || repository.license;
          repository.topics = githubData.topics || repository.topics;
          repository.visibility = githubData.private ? 'private' : 'public';
          repository.defaultBranch = githubData.default_branch || repository.defaultBranch;
          repository.lastSync = new Date();

          await repository.save();

        } catch (githubError) {
          // If GitHub API fails, still update lastSync but don't fail the operation
          console.warn('GitHub sync failed:', githubError.message);
          repository.lastSync = new Date();
          await repository.save();
        }

        return await Repository.findById(id)
          .populate('project', 'name')
          .populate('owner', 'username firstName lastName avatar');
      } catch (error) {
        throw new Error(error.message || 'Failed to sync repository');
      }
    }
  }
};

module.exports = repositoryResolvers;