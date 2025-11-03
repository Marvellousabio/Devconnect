const { gql } = require('apollo-server-express');

const issueTypeDefs = gql`
  type Issue {
    id: ID!
    title: String!
    description: String!
    project: Project!
    creator: User!
    assignee: User
    status: IssueStatus!
    priority: IssuePriority!
    labels: [String!]!
    comments: [IssueComment!]!
    commentCount: Int!
    dueDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type IssueComment {
    id: ID!
    author: User!
    content: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum IssueStatus {
    open
    in_progress
    review
    closed
  }

  enum IssuePriority {
    low
    medium
    high
    urgent
  }

  input IssueInput {
    title: String!
    description: String!
    assignee: ID
    priority: IssuePriority
    labels: [String!]
    dueDate: DateTime
  }

  input IssueUpdateInput {
    title: String
    description: String
    assignee: ID
    status: IssueStatus
    priority: IssuePriority
    labels: [String!]
    dueDate: DateTime
  }

  input IssueCommentInput {
    content: String!
  }

  input IssueFilters {
    status: IssueStatus
    assignee: ID
    creator: ID
    labels: [String!]
    priority: IssuePriority
  }

  extend type Query {
    issue(id: ID!): Issue
    issues(projectId: ID!, filters: IssueFilters, limit: Int, offset: Int): [Issue!]!
    projectIssues(projectId: ID!, filters: IssueFilters, limit: Int, offset: Int): [Issue!]!
    myAssignedIssues(limit: Int, offset: Int): [Issue!]!
    issueComments(issueId: ID!): [IssueComment!]!
  }

  extend type Mutation {
    createIssue(projectId: ID!, input: IssueInput!): Issue!
    updateIssue(id: ID!, input: IssueUpdateInput!): Issue!
    deleteIssue(id: ID!): Boolean!
    addIssueComment(issueId: ID!, input: IssueCommentInput!): IssueComment!
    updateIssueComment(issueId: ID!, commentId: ID!, content: String!): IssueComment!
    deleteIssueComment(issueId: ID!, commentId: ID!): Boolean!
  }
`;

module.exports = issueTypeDefs;