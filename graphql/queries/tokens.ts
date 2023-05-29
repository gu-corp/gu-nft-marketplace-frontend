import { gql } from "__generated__";

export const GET_TOKEN = gql(/* GraphQL */`
  query GetToken($id: String!) {
    token(id: $id) {
      id
      tokenId
      tokenUri
      collection
      owner
      image
      description
      name
      bids {
        hash
        collectionAddress
        price
        currencyAddress
      }
      asks {
        hash
        collectionAddress
        price
        currencyAddress
      }
    }
  }
`);

export const GET_TOKENS = gql(/* GraphQL */`
  query GetTokens($first: Int, $skip: Int, $orderDirection: OrderDirection, $where: Token_FilterArgs) {
    tokens(first: $first, skip: $skip, orderDirection: $orderDirection, where: $where) {
      id
      tokenId
      tokenUri
      collection
      owner
      image
      description
      name
      bids {
        hash
        collectionAddress
        price
        currencyAddress
      }
      asks {
        hash
        collectionAddress
        price
        currencyAddress
      }
    }
  }
`);

