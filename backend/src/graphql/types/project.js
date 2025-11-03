const { gql } = require('apollo-server-express');

const projectTypeDefs = gql`
  type Project {
    id: ID!
    name: String!
    description: String!
    owner: User!
    members: [ProjectMember!]!
    memberCount: Int!
    status: ProjectStatus!
    visibility: ProjectVisibility!
    tags: [String!]!
    githubRepo: String
    website: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProjectMember {
    user: User!
    role: ProjectRole!
    joinedAt: DateTime!
  }

  enum ProjectStatus {
    active
    archived
    completed
  }

  enum ProjectVisibility {
    public
    private
  }

  enum ProjectRole {
    owner
    admin
    member
  }

  input ProjectInput {
    name: String!
    description: String!
    visibility: ProjectVisibility
    tags: [String!]
    githubRepo: String
    website: String
  }

  input ProjectUpdateInput {
    name: String
    description: String
    status: ProjectStatus
    visibility: ProjectVisibility
    tags: [String!]
    githubRepo: String
    website: String
  }

  input AddMemberInput {
    userId: ID!
    role: ProjectRole
  }

  input UpdateMemberInput {
    userId: ID!
    role: ProjectRole!
  }

  extend type Query {
    project(id: ID!): Project
    projects(limit: Int, offset: Int, status: ProjectStatus, visibility: ProjectVisibility): [Project!]!
    myProjects: [Project!]!
    userProjects(userId: ID!): [Project!]!
    searchProjects(query: String!, limit: Int): [Project!]!
  }

  extend type Mutation {
    createProject(input: ProjectInput!): Project!
    updateProject(id: ID!, input: ProjectUpdateInput!): Project!
    deleteProject(id: ID!): Boolean!
    addProjectMember(projectId: ID!, input: AddMemberInput!): Project!
    updateProjectMember(projectId: ID!, input: UpdateMemberInput!): Project!
    removeProjectMember(projectId: ID!, userId: ID!): Project!
    leaveProject(projectId: ID!): Boolean!
  }
`;

module.exports = projectTypeDefs;