const { gql } = require('apollo-server-express');

const commonTypeDefs = gql`
  scalar DateTime

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  enum SortOrder {
    ASC
    DESC
  }

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }
`;

module.exports = commonTypeDefs;