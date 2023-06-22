import { gql } from "__generated__";

export const CREATE_ORDER = gql(/* GraphQL */`
  mutation CreateOrder(
    $createOrderInput: CreateOrderInput!
  ) {
    createOrder(
      createOrderInput: $createOrderInput
    ) {
      hash
    }
  }
`);

export const GET_ORDERS = gql(/* GraphQL */`
query orders($first: Int, $skip: Int, $orderDirection: OrderDirection, $order_OrderBy: Order_OrderBy, $where: Order_FilterArgs) {
    orders(first: $first, skip: $skip, orderDirection: $orderDirection, order_OrderBy: $order_OrderBy, where: $where) {
      hash
      collectionAddress
      tokenId
      price
      startTime
      endTime
      nonce
      currencyAddress
      amount
      isOrderAsk
      signer
      strategy
      minPercentageToAsk
      params
      signature
    }
  }
`);

export const GET_ORDER_BY_HASH = gql(/* GraphQL */`
query GetOrderByHash($hash: ID!) {
    order(hash: $hash) {
      hash
      collectionAddress
      tokenId
      price
      startTime
      endTime
      nonce
      currencyAddress
      amount
      isOrderAsk
      signer
      strategy
      minPercentageToAsk
      params
      signature
    }
  }
`);

export const GET_HIGHEST_BID = gql(/* GraphQL */`
query GetHighBid($where: HighestBid_FilterArgs!) {
    highestBid(where: $where) {
      hash
      collectionAddress
      tokenId
      price
      startTime
      endTime
      nonce
      currencyAddress
      amount
      isOrderAsk
      signer
      strategy
      minPercentageToAsk
      params
      signature
    }
  }
`);

export const GET_LISTED = gql(/* GraphQL */`
query GetListed($where: Listed_FilterArgs!) {
    listed(where: $where) {
      hash
      collectionAddress
      tokenId
      price
      startTime
      endTime
      nonce
      currencyAddress
      amount
      isOrderAsk
      signer
      strategy
      minPercentageToAsk
      params
      signature
    }
  }
`);
