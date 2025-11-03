const { gql } = require('apollo-server-express');

const chatTypeDefs = gql`
  type ChatRoom {
    id: ID!
    name: String!
    description: String
    type: ChatRoomType!
    project: Project
    participants: [User!]!
    owner: User!
    isActive: Boolean!
    lastMessage: LastMessage
    participantCount: Int!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type LastMessage {
    content: String!
    sender: User!
    timestamp: DateTime!
  }

  type Message {
    id: ID!
    content: String!
    sender: User!
    room: ChatRoom!
    type: MessageType!
    metadata: MessageMetadata
    edited: Boolean!
    editedAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type MessageMetadata {
    language: String
    filename: String
    fileUrl: String
  }

  enum ChatRoomType {
    project
    direct
    group
  }

  enum MessageType {
    text
    code
    file
    system
  }

  input ChatRoomInput {
    name: String!
    description: String
    type: ChatRoomType!
    participantIds: [ID!]
  }

  input MessageInput {
    content: String!
    type: MessageType
    metadata: MessageMetadataInput
  }

  input MessageMetadataInput {
    language: String
    filename: String
    fileUrl: String
  }

  input DirectMessageInput {
    participantId: ID!
  }

  extend type Query {
    chatRooms(projectId: ID): [ChatRoom!]!
    chatRoom(id: ID!): ChatRoom
    messages(roomId: ID!, limit: Int, offset: Int): [Message!]!
    directMessageRoom(userId: ID!): ChatRoom
  }

  extend type Mutation {
    createChatRoom(projectId: ID!, input: ChatRoomInput!): ChatRoom!
    createDirectMessage(input: DirectMessageInput!): ChatRoom!
    sendMessage(roomId: ID!, input: MessageInput!): Message!
    editMessage(messageId: ID!, content: String!): Message!
    deleteMessage(messageId: ID!): Boolean!
    joinChatRoom(roomId: ID!): Boolean!
    leaveChatRoom(roomId: ID!): Boolean!
  }

  extend type Subscription {
    messageReceived(roomId: ID!): Message!
    userTyping(roomId: ID!, userId: ID!): TypingIndicator!
    userStoppedTyping(roomId: ID!, userId: ID!): TypingIndicator!
  }

  type TypingIndicator {
    userId: ID!
    username: String!
    roomId: ID!
  }
`;

module.exports = chatTypeDefs;