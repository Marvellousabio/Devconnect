const { gql } = require('apollo-server-express');

const boardTypeDefs = gql`
  type ProjectBoard {
    id: ID!
    name: String!
    project: Project!
    columns: [BoardColumn!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type BoardColumn {
    id: ID!
    name: String!
    position: Int!
    limit: Int
    color: String
    cards: [BoardCard!]!
    cardCount: Int!
  }

  type BoardCard {
    id: ID!
    title: String!
    description: String
    board: ProjectBoard!
    column: BoardColumn!
    assignee: User
    labels: [String!]!
    priority: IssuePriority!
    dueDate: DateTime
    position: Int!
    issue: Issue
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input BoardInput {
    name: String!
  }

  input BoardColumnInput {
    name: String!
    position: Int!
    limit: Int
    color: String
  }

  input BoardCardInput {
    title: String!
    description: String
    assignee: ID
    labels: [String!]
    priority: IssuePriority
    dueDate: DateTime
    issue: ID
  }

  input UpdateBoardCardInput {
    title: String
    description: String
    assignee: ID
    labels: [String!]
    priority: IssuePriority
    dueDate: DateTime
  }

  input MoveCardInput {
    cardId: ID!
    targetColumnId: ID!
    targetPosition: Int!
  }

  extend type Query {
    projectBoards(projectId: ID!): [ProjectBoard!]!
    projectBoard(id: ID!): ProjectBoard
    boardCards(boardId: ID!): [BoardCard!]!
    boardCardsByColumn(boardId: ID!, columnId: ID!): [BoardCard!]!
  }

  extend type Mutation {
    createProjectBoard(projectId: ID!, input: BoardInput!): ProjectBoard!
    updateProjectBoard(id: ID!, name: String!): ProjectBoard!
    deleteProjectBoard(id: ID!): Boolean!

    addBoardColumn(boardId: ID!, input: BoardColumnInput!): ProjectBoard!
    updateBoardColumn(boardId: ID!, columnId: ID!, input: BoardColumnInput!): ProjectBoard!
    removeBoardColumn(boardId: ID!, columnId: ID!): ProjectBoard!
    reorderBoardColumns(boardId: ID!, columnOrder: [ID!]!): ProjectBoard!

    createBoardCard(boardId: ID!, columnId: ID!, input: BoardCardInput!): BoardCard!
    updateBoardCard(id: ID!, input: UpdateBoardCardInput!): BoardCard!
    deleteBoardCard(id: ID!): Boolean!
    moveBoardCard(input: MoveCardInput!): BoardCard!
    reorderBoardCards(boardId: ID!, columnId: ID!, cardOrder: [ID!]!): Boolean!
  }
`;

module.exports = boardTypeDefs;