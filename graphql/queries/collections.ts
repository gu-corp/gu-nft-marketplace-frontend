import { gql } from "__generated__";

export const GET_COLLECTIONS = gql(/* GraphQL */`
  query GetCollections($first: Int, $skip: Int, $orderDirection: OrderDirection) {
    collections(first: $first, skip: $skip, orderDirection: $orderDirection) {
      id
      name
      symbol
      totalTokens
      totalOwners
    }
  }
`);

export const GET_COLLECTION = gql(/* GraphQL */`
query GetCollection($id: String!) {
    collection(id: $id) {
      id
      name
      symbol
      totalTokens
      totalOwners
    }
  }
`);

export const GET_USER_RELATIVE_COLLECTIONS = gql(/* GraphQL */`
query GetUserRelativeCollections($first: Int, $skip: Int, $user: String!) {
    relativeCollections(first: $first, skip: $skip, user: $user) {
      id
      name
      symbol
      totalTokens
      totalOwners
    }
  }
`);