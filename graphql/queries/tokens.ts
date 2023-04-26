import { gql } from "__generated__";

export const GET_NONCE = gql(/* GraphQL */`
query GetNonce($signer: String!) {
    nonce(signer: $signer) {
      nonce
    }
  }
`);

export const GET_TOKEN_BY_ID = gql(/* GraphQL */`
query GetTokenById($id: ID!) {
    token(id: $id) {
      id
      tokenID
      tokenURI
      collection {
        id
        name
        totalTokens
      }
      owner {
        id
      }
    }
  }
`);

export const GET_USER_TOKENS = gql(/* GraphQL */`
  query GetUserTokens($first: Int, $skip: Int, $orderDirection: OrderDirection, $token_OrderBy: Token_OrderBy, $where: Token_FilterArgs) {
    tokens(first: $first, skip: $skip, orderDirection: $orderDirection, token_OrderBy: $token_OrderBy, where: $where) {
      id
      tokenID
      tokenURI
      collection {
        id
        name
        totalTokens
      }
    }
  }
`);