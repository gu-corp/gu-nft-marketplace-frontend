import { gql } from "__generated__";

export const GET_NONCE = gql(/* GraphQL */`
query GetNonce($signer: String!) {
    nonce(signer: $signer) {
      nonce
    }
  }
`);