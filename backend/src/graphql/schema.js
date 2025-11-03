const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { mergeTypeDefs, mergeResolvers } = require('@graphql-tools/merge');

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
  context: ({ req, res }) => ({
    req,
    res,
    user: req.user // From auth middleware
  }),
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