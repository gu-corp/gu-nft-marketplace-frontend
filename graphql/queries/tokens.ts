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
  query GetTokens($first: Int, $skip: Int, $orderDirection: OrderDirection, $where: Token_FilterArgs, $token_OrderBy: Token_OrderBy) {
    tokens(first: $first, skip: $skip, orderDirection: $orderDirection, where: $where, token_OrderBy: $token_OrderBy) {
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
        price
        currencyAddress
      }
      asks {
        hash
        price
        currencyAddress
      }
      sales {
        hash
        price
        updatedAt
      }
    }
  }
`);

export const REFRESH_TOKEN_METADATA = gql(/* GraphQL */`
  mutation RefreshTokenMetadata(
    $args: RefreshTokenMetadataArgs!
  ) {
    refreshTokenMetadata(
      args: $args
    )
  }
`);
