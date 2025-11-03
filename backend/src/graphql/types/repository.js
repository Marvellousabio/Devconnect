const { gql } = require('apollo-server-express');

const repositoryTypeDefs = gql`
  type Repository {
    id: ID!
    name: String!
    description: String
    project: Project!
    owner: User!
    visibility: RepositoryVisibility!
    defaultBranch: String!
    language: String
    stars: Int!
    forks: Int!
    watchers: Int!
    license: String
    topics: [String!]!
    githubUrl: String
    lastSync: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum RepositoryVisibility {
    public
    private
  }

  input RepositoryInput {
    name: String!
    description: String
    visibility: RepositoryVisibility
    defaultBranch: String
    language: String
    license: String
    topics: [String!]
    githubUrl: String
  }

  input RepositoryUpdateInput {
    description: String
    visibility: RepositoryVisibility
    defaultBranch: String
    language: String
    license: String
    topics: [String!]
    githubUrl: String
  }

  extend type Query {
    repositories(projectId: ID!): [Repository!]!
    repository(id: ID!): Repository
    publicRepositories(limit: Int, language: String, sortBy: String): [Repository!]!
    userRepositories(userId: ID!): [Repository!]!
    searchRepositories(query: String!, limit: Int): [Repository!]!
  }

  extend type Mutation {
    createRepository(projectId: ID!, input: RepositoryInput!): Repository!
    updateRepository(id: ID!, input: RepositoryUpdateInput!): Repository!
    deleteRepository(id: ID!): Boolean!
    starRepository(id: ID!): Repository!
    unstarRepository(id: ID!): Repository!
    forkRepository(id: ID!): Repository!
    watchRepository(id: ID!): Repository!
    unwatchRepository(id: ID!): Repository!
    syncRepository(id: ID!): Repository!
  }
`;

module.exports = repositoryTypeDefs;