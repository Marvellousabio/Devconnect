const express = require('express');
const { graphqlServer } = require('./graphql/schema');
const { authenticateToken } = require('./middleware/auth');
const corsConfig = require('./middleware/cors');
const { apiLimiter } = require('./middleware/rateLimit');

const app = express();

// Apply authentication middleware to GraphQL
app.use('/graphql', authenticateToken);

// Apply rate limiting to GraphQL
app.use('/graphql', apiLimiter);

// Apply GraphQL server middleware
graphqlServer.applyMiddleware({ app, path: '/graphql' });

module.exports = app;