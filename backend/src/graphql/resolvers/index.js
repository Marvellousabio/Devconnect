const userResolvers = require('./user');
const projectResolvers = require('./project');

module.exports = {
  ...userResolvers,
  ...projectResolvers
};