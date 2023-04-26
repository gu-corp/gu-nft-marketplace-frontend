import { gql } from "__generated__";

export const GET_USER_COLLECTIONS = gql(/* GraphQL */`
  query GetUserCollections($first: Int, $skip: Int $orderDirection: OrderDirection, $collection_orderBy: Collection_orderBy, $where: Collection_FilterArgs) {
    collections(first: $first, skip: $skip, orderDirection: $orderDirection, collection_orderBy: $collection_orderBy, where: $where) {
      id
      name
      totalTokens
    }
}
`);