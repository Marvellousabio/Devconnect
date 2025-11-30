const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');
const jwt = require('jsonwebtoken');

// Import configurations and models
const { authConfig } = require('../config');
const { User } = require('../models');

// Import type definitions
const commonTypeDefs = require('./types/common');
const userTypeDefs = require('./types/user');
const projectTypeDefs = require('./types/project');
const issueTypeDefs = require('./types/issue');
const boardTypeDefs = require('./types/board');
const chatTypeDefs = require('./types/chat');
const codeTypeDefs = require('./types/code');
const repositoryTypeDefs = require('./types/repository');

// Import resolvers
const userResolvers = require('./resolvers/user');
const projectResolvers = require('./resolvers/project');
const issueResolvers = require('./resolvers/issue');
const boardResolvers = require('./resolvers/board');
const chatResolvers = require('./resolvers/chat');
const codeResolvers = require('./resolvers/code');
const repositoryResolvers = require('./resolvers/repository');

// Combine type definitions
const typeDefs = mergeTypeDefs([
  commonTypeDefs,
  userTypeDefs,
  projectTypeDefs,
  issueTypeDefs,
  boardTypeDefs,
  chatTypeDefs,
  codeTypeDefs,
  repositoryTypeDefs
]);

// Combine resolvers
const resolvers = mergeResolvers([
  userResolvers,
  projectResolvers,
  issueResolvers,
  boardResolvers,
  chatResolvers,
  codeResolvers,
  repositoryResolvers
]);

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

// Create Apollo Server instance
const graphqlServer = new ApolloServer({
  schema,
  context: async ({ req, res }) => {
    let user = null;

    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      console.log('GraphQL Context - Auth header present:', !!authHeader);
      console.log('GraphQL Context - Token present:', !!token);

      if (token) {
        const decoded = jwt.verify(token, authConfig.jwtSecret);
        console.log('GraphQL Context - Token decoded userId:', decoded.userId);

        user = await User.findById(decoded.userId).select('-password');
        console.log('GraphQL Context - User found:', !!user);

        if (user && !user.isActive) {
          console.log('GraphQL Context - User not active');
          user = null;
        }
      } else {
        console.log('GraphQL Context - No token provided');
      }
    } catch (error) {
      console.error('GraphQL Context - Auth error:', error.message);
    }

    return {
      req,
      res,
      user
    };
  },
  introspection: process.env.NODE_ENV !== 'production',
  playground: process.env.NODE_ENV !== 'production',
  formatError: (error) => {
    console.error('GraphQL Error:', error);

    // Don't expose internal errors in production
    if (process.env.NODE_ENV === 'production') {
      return {
        message: 'Internal server error',
        extensions: {
          code: 'INTERNAL_SERVER_ERROR'
        }
      };
    }

    return {
      message: error.message,
      locations: error.locations,
      path: error.path,
      extensions: error.extensions
    };
  }
});

module.exports = { graphqlServer, schema };