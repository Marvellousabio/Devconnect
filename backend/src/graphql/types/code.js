const { gql } = require('apollo-server-express');

const codeTypeDefs = gql`
  type CodeSession {
    id: ID!
    name: String!
    description: String
    project: Project!
    creator: User!
    language: String!
    content: String!
    participants: [CodeParticipant!]!
    isActive: Boolean!
    lastActivity: DateTime!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type CodeParticipant {
    user: User!
    joinedAt: DateTime!
    lastActivity: DateTime!
    cursor: CursorPosition
  }

  type CursorPosition {
    line: Int!
    column: Int!
  }

  type CodeChange {
    id: ID!
    sessionId: ID!
    userId: ID!
    changes: [TextChange!]!
    timestamp: DateTime!
  }

  type TextChange {
    type: ChangeType!
    position: Int!
    text: String
    length: Int
  }

  enum ChangeType {
    INSERT
    DELETE
    REPLACE
  }

  input CodeSessionInput {
    name: String!
    description: String
    language: String!
  }

  input CursorUpdateInput {
    line: Int!
    column: Int!
  }

  input CodeChangeInput {
    changes: [TextChangeInput!]!
  }

  input TextChangeInput {
    type: ChangeType!
    position: Int!
    text: String
    length: Int
  }

  extend type Query {
    codeSessions(projectId: ID!): [CodeSession!]!
    codeSession(id: ID!): CodeSession
    activeCodeSessions: [CodeSession!]!
  }

  extend type Mutation {
    createCodeSession(projectId: ID!, input: CodeSessionInput!): CodeSession!
    joinCodeSession(sessionId: ID!): CodeSession!
    leaveCodeSession(sessionId: ID!): Boolean!
    updateCodeContent(sessionId: ID!, input: CodeChangeInput!): CodeChange!
    updateCursorPosition(sessionId: ID!, input: CursorUpdateInput!): Boolean!
    endCodeSession(sessionId: ID!): Boolean!
  }

  extend type Subscription {
    codeSessionUpdated(sessionId: ID!): CodeSession!
    codeContentChanged(sessionId: ID!): CodeChange!
    participantJoined(sessionId: ID!): CodeParticipant!
    participantLeft(sessionId: ID!): CodeParticipant!
    cursorMoved(sessionId: ID!, userId: ID!): CursorPosition!
  }
`;

module.exports = codeTypeDefs;