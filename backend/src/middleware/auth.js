const jwt = require('jsonwebtoken');
const { authConfig } = require('../config');
const { User } = require('../models');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, authConfig.jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn
  });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, authConfig.jwtSecret, {
    expiresIn: authConfig.refreshTokenExpiresIn
  });
};

// Middleware to authenticate JWT tokens
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid access token'
      });
    }

    const decoded = jwt.verify(token, authConfig.jwtSecret);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        error: 'Account deactivated',
        message: 'Your account has been deactivated'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Your access token has expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Invalid access token provided'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      error: 'Authentication error',
      message: 'An error occurred during authentication'
    });
  }
};

// Middleware to check if user is authenticated (optional auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, authConfig.jwtSecret);
      const user = await User.findById(decoded.userId).select('-password');

      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

// Middleware to check if user owns the resource or is admin
const requireOwnership = (resourceField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource'
      });
    }

    const resourceId = req.params.id || req.body[resourceField];
    const userId = req.user._id.toString();

    if (resourceId !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access your own resources'
      });
    }

    next();
  };
};

// Middleware to check project membership
const requireProjectAccess = (requiredRole = null) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'You must be logged in to access this resource'
        });
      }

      const projectId = req.params.projectId || req.body.projectId || req.params.id;
      const { Project } = require('../models');

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({
          error: 'Project not found',
          message: 'The requested project does not exist'
        });
      }

      const membership = project.members.find(member =>
        member.user.toString() === req.user._id.toString()
      );

      if (!membership) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not a member of this project'
        });
      }

      if (requiredRole && membership.role !== 'owner' && membership.role !== 'admin') {
        if (requiredRole === 'owner' && membership.role !== 'owner') {
          return res.status(403).json({
            error: 'Owner access required',
            message: 'Only project owners can perform this action'
          });
        }
        if (requiredRole === 'admin' && membership.role !== 'owner' && membership.role !== 'admin') {
          return res.status(403).json({
            error: 'Admin access required',
            message: 'Only project admins can perform this action'
          });
        }
      }

      req.project = project;
      req.membership = membership;
      next();
    } catch (error) {
      console.error('Project access middleware error:', error);
      res.status(500).json({
        error: 'Access check failed',
        message: 'An error occurred while checking project access'
      });
    }
  };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  authenticateToken,
  optionalAuth,
  requireOwnership,
  requireProjectAccess
};