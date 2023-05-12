import { gql } from "__generated__";

export const GET_ACTIVITIES = gql(/* GraphQL */`
  query GetActivities($first: Int, $skip: Int, $where: Activity_FilterArgs) {
    activities(first: $first, skip: $skip, where: $where) {
      id
      type
      timestamp
      to
      from
      tokenId
      collection
      txHash
    }
}
`);