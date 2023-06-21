import { gql } from "__generated__";

export const GET_COLLECTIONS = gql(/* GraphQL */`
  query GetCollections($first: Int, $skip: Int, $orderDirection: OrderDirection, $collection_OrderBy: Collection_OrderBy, $where: Collection_FilterArgs) {
    collections(first: $first, skip: $skip, orderDirection: $orderDirection, collection_OrderBy: $collection_OrderBy, where: $where) {
      id
      name
      symbol
      totalTokens
      image
      description
      volume  {
        day1Volume
        day7Volume
        monthVolume
        totalVolume
      }
      floor {
        floorPrice
      }
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
      image
      description
      volume  {
        day1Volume
        day7Volume
        monthVolume
        totalVolume
      }
      floor {
        floorPrice
      }
    }
  }
`);

export const GET_USER_RELATIVE_COLLECTIONS = gql(/* GraphQL */`
query GetUserRelativeCollections($first: Int, $skip: Int, $where: RelativeCollection_FilterArgs!, $orderBy: RelativeCollection_OrderBy, $orderDirection: OrderDirection) {
    relativeCollections(first: $first, skip: $skip, where: $where, relativeCollection_OrderBy: $orderBy, orderDirection: $orderDirection) {
      id
      name
      symbol
      totalTokens
      image
      description
      volume  {
        day1Volume
        day7Volume
        monthVolume
        totalVolume
      }
      floor {
        floorPrice
      }
    }
  }
`);

export const REFRESH_COLLECTION_METADATA = gql(/* GraphQL */`
  mutation RefreshCollectionMetadata(
    $args: RefreshCollectionMetadataArgs!
  ) {
    refreshCollectionMetadata(
      args: $args
    )
  }
`);