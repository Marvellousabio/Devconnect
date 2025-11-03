const validator = require('validator');

// Validation middleware for user registration
const validateUserRegistration = (req, res, next) => {
  const { username, email, password, firstName, lastName } = req.body;
  const errors = [];

  // Username validation
  if (!username || !validator.isLength(username, { min: 3, max: 30 })) {
    errors.push('Username must be between 3 and 30 characters');
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }

  // Email validation
  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password || !validator.isLength(password, { min: 6 })) {
    errors.push('Password must be at least 6 characters long');
  }

  // Name validation
  if (!firstName || !validator.isLength(firstName.trim(), { min: 1, max: 50 })) {
    errors.push('First name is required and must be less than 50 characters');
  }
  if (!lastName || !validator.isLength(lastName.trim(), { min: 1, max: 50 })) {
    errors.push('Last name is required and must be less than 50 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please correct the following errors:',
      errors
    });
  }

  // Sanitize inputs
  req.body.username = validator.escape(username.trim());
  req.body.email = validator.normalizeEmail(email);
  req.body.firstName = validator.escape(firstName.trim());
  req.body.lastName = validator.escape(lastName.trim());

  next();
};

// Validation middleware for user login
const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password || password.trim().length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please correct the following errors:',
      errors
    });
  }

  req.body.email = validator.normalizeEmail(email);
  next();
};

// Validation middleware for project creation
const validateProjectCreation = (req, res, next) => {
  const { name, description } = req.body;
  const errors = [];

  if (!name || !validator.isLength(name.trim(), { min: 3, max: 100 })) {
    errors.push('Project name must be between 3 and 100 characters');
  }

  if (!description || !validator.isLength(description.trim(), { min: 1, max: 1000 })) {
    errors.push('Project description is required and must be less than 1000 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please correct the following errors:',
      errors
    });
  }

  req.body.name = validator.escape(name.trim());
  req.body.description = validator.escape(description.trim());
  next();
};

// Validation middleware for issue creation
const validateIssueCreation = (req, res, next) => {
  const { title, description } = req.body;
  const errors = [];

  if (!title || !validator.isLength(title.trim(), { min: 3, max: 200 })) {
    errors.push('Issue title must be between 3 and 200 characters');
  }

  if (!description || description.trim().length === 0) {
    errors.push('Issue description is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please correct the following errors:',
      errors
    });
  }

  req.body.title = validator.escape(title.trim());
  req.body.description = validator.escape(description.trim());
  next();
};

// Validation middleware for message sending
const validateMessageSending = (req, res, next) => {
  const { content, type } = req.body;
  const errors = [];

  if (!content || !validator.isLength(content.trim(), { min: 1, max: 2000 })) {
    errors.push('Message content must be between 1 and 2000 characters');
  }

  const validTypes = ['text', 'code', 'file', 'system'];
  if (type && !validTypes.includes(type)) {
    errors.push('Invalid message type');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please correct the following errors:',
      errors
    });
  }

  req.body.content = validator.escape(content.trim());
  next();
};

// General input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Recursively sanitize string fields in req.body
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = validator.escape(obj[key].trim());
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitizeObject(req.body);
  }

  next();
};

// Validation middleware for repository creation
const validateRepositoryCreation = (req, res, next) => {
  const { name, description } = req.body;
  const errors = [];

  if (!name || !validator.isLength(name.trim(), { min: 3, max: 100 })) {
    errors.push('Repository name must be between 3 and 100 characters');
  }

  if (description && !validator.isLength(description, { max: 500 })) {
    errors.push('Repository description must be less than 500 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'Please correct the following errors:',
      errors
    });
  }

  if (name) req.body.name = validator.escape(name.trim());
  if (description) req.body.description = validator.escape(description.trim());

  next();
};

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateProjectCreation,
  validateIssueCreation,
  validateMessageSending,
  validateRepositoryCreation,
  sanitizeInput
};