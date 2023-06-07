import { gql } from "__generated__";

export const GET_ATTRIBUTES = gql(/* GraphQL */`
  query attributes($where: Attribute_FilterArgs!) {
    attributes(where: $where) {
      kind
      key
      attributeCount
      values {
        tokenCount
        value
      }
    }
}
`);