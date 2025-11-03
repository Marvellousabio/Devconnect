const { User } = require('../../models');
const { generateToken, generateRefreshToken } = require('../../middleware/auth');
const { authConfig } = require('../../config');

const userResolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (!context.user) {
        throw new Error('Not authenticated');
      }
      return context.user;
    },

    user: async (parent, { id }, context) => {
      try {
        const user = await User.findById(id);
        if (!user) {
          throw new Error('User not found');
        }
        return user.getPublicProfile();
      } catch (error) {
        throw new Error('Failed to fetch user');
      }
    },

    users: async (parent, { limit = 20, offset = 0 }, context) => {
      try {
        const users = await User.find({ isActive: true })
          .select('-password')
          .limit(limit)
          .skip(offset)
          .sort({ createdAt: -1 });

        return users.map(user => user.getPublicProfile());
      } catch (error) {
        throw new Error('Failed to fetch users');
      }
    },

    searchUsers: async (parent, { query, limit = 10 }, context) => {
      try {
        const searchRegex = new RegExp(query, 'i');
        const users = await User.find({
          isActive: true,
          $or: [
            { username: searchRegex },
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex }
          ]
        })
          .select('-password')
          .limit(limit);

        return users.map(user => user.getPublicProfile());
      } catch (error) {
        throw new Error('Failed to search users');
      }
    }
  },

  Mutation: {
    register: async (parent, { input }, context) => {
      try {
        const { username, email, password, ...userData } = input;

        // Check if user already exists
        const existingUser = await User.findOne({
          $or: [{ email }, { username }]
        });

        if (existingUser) {
          if (existingUser.email === email) {
            throw new Error('Email already registered');
          }
          if (existingUser.username === username) {
            throw new Error('Username already taken');
          }
        }

        // Create new user
        const user = new User({
          username,
          email,
          password,
          ...userData
        });

        await user.save();

        // Generate tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        return {
          token,
          refreshToken,
          user: user.getPublicProfile()
        };
      } catch (error) {
        if (error.code === 11000) {
          throw new Error('Username or email already exists');
        }
        throw new Error(error.message || 'Failed to register user');
      }
    },

    login: async (parent, { input }, context) => {
      try {
        const { email, password } = input;

        // Find user by email
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
          throw new Error('Invalid email or password');
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          throw new Error('Invalid email or password');
        }

        // Check if user is active
        if (!user.isActive) {
          throw new Error('Account has been deactivated');
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate tokens
        const token = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        return {
          token,
          refreshToken,
          user: user.getPublicProfile()
        };
      } catch (error) {
        throw new Error(error.message || 'Login failed');
      }
    },

    updateProfile: async (parent, { input }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const allowedFields = [
          'firstName', 'lastName', 'avatar', 'bio', 'skills',
          'githubUsername', 'linkedinUrl', 'website', 'location'
        ];

        const updates = {};
        allowedFields.forEach(field => {
          if (input[field] !== undefined) {
            updates[field] = input[field];
          }
        });

        const user = await User.findByIdAndUpdate(
          context.user._id,
          updates,
          { new: true, runValidators: true }
        );

        return user.getPublicProfile();
      } catch (error) {
        throw new Error('Failed to update profile');
      }
    },

    changePassword: async (parent, { currentPassword, newPassword }, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        const user = await User.findById(context.user._id).select('+password');
        if (!user) {
          throw new Error('User not found');
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
          throw new Error('Current password is incorrect');
        }

        // Update password (will be hashed by pre-save middleware)
        user.password = newPassword;
        await user.save();

        return true;
      } catch (error) {
        throw new Error(error.message || 'Failed to change password');
      }
    },

    deactivateAccount: async (parent, args, context) => {
      try {
        if (!context.user) {
          throw new Error('Not authenticated');
        }

        await User.findByIdAndUpdate(context.user._id, { isActive: false });
        return true;
      } catch (error) {
        throw new Error('Failed to deactivate account');
      }
    }
  },

  User: {
    fullName: (parent) => `${parent.firstName} ${parent.lastName}`
  }
};

module.exports = userResolvers;