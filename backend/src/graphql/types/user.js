const { gql } = require('apollo-server-express');

const userTypeDefs = gql`
  type User {
    id: ID!
    username: String!
    email: String!
    firstName: String!
    lastName: String!
    fullName: String!
    avatar: String
    bio: String
    skills: [String!]!
    githubUsername: String
    linkedinUrl: String
    website: String
    location: String
    isActive: Boolean!
    lastLogin: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type AuthPayload {
    token: String!
    refreshToken: String!
    user: User!
  }

  input UserInput {
    username: String!
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    avatar: String
    bio: String
    skills: [String!]
    githubUsername: String
    linkedinUrl: String
    website: String
    location: String
  }

  input UserUpdateInput {
    firstName: String
    lastName: String
    avatar: String
    bio: String
    skills: [String!]
    githubUsername: String
    linkedinUrl: String
    website: String
    location: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  extend type Query {
    me: User
    user(id: ID!): User
    users(limit: Int, offset: Int): [User!]!
    searchUsers(query: String!, limit: Int): [User!]!
  }

  extend type Mutation {
    register(input: UserInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateProfile(input: UserUpdateInput!): User!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!
    deactivateAccount: Boolean!
  }
`;

module.exports = userTypeDefs;