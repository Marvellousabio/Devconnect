const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

// Stricter rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 authentication attempts per windowMs
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many login/signup attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for GraphQL operations
const graphqlLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 GraphQL operations per windowMs
  message: {
    error: 'Too many GraphQL operations',
    message: 'Too many GraphQL operations, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for file uploads
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: {
    error: 'Too many file uploads',
    message: 'Too many file uploads, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Create account limiter (stricter for signup)
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 account creations per hour
  message: {
    error: 'Too many account creations',
    message: 'Too many accounts created from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Password reset limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password resets per hour
  message: {
    error: 'Too many password reset requests',
    message: 'Too many password reset requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  apiLimiter,
  authLimiter,
  graphqlLimiter,
  uploadLimiter,
  createAccountLimiter,
  passwordResetLimiter
};