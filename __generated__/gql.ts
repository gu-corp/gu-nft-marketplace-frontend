/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    "\n  query GetActivities($first: Int, $skip: Int, $where: Activity_FilterArgs) {\n    activities(first: $first, skip: $skip, where: $where) {\n      id\n      type\n      timestamp\n      to\n      from\n      tokenId\n      collection\n      txHash\n    }\n}\n": types.GetActivitiesDocument,
    "\n  query GetCollections($first: Int, $skip: Int, $orderDirection: OrderDirection, $collection_OrderBy: Collection_OrderBy, $where: Collection_FilterArgs) {\n    collections(first: $first, skip: $skip, orderDirection: $orderDirection, collection_OrderBy: $collection_OrderBy, where: $where) {\n      id\n      name\n      symbol\n      totalTokens\n      image\n      description\n      volume  {\n        day1Volume\n        day7Volume\n        monthVolume\n        totalVolume\n      }\n      floor {\n        floorPrice\n      }\n    }\n  }\n": types.GetCollectionsDocument,
    "\nquery GetCollection($id: String!) {\n    collection(id: $id) {\n      id\n      name\n      symbol\n      totalTokens\n      image\n      description\n      volume  {\n        day1Volume\n        day7Volume\n        monthVolume\n        totalVolume\n      }\n      floor {\n        floorPrice\n      }\n    }\n  }\n": types.GetCollectionDocument,
    "\nquery GetUserRelativeCollections($first: Int, $skip: Int, $user: String!) {\n    relativeCollections(first: $first, skip: $skip, user: $user) {\n      id\n      name\n      symbol\n      totalTokens\n      image\n      description\n    }\n  }\n": types.GetUserRelativeCollectionsDocument,
    "\nquery GetNonce($signer: String!) {\n    nonce(signer: $signer) {\n      nonce\n    }\n  }\n": types.GetNonceDocument,
    "\n  mutation CreateOrder(\n    $createOrderInput: CreateOrderInput!\n  ) {\n    createOrder(\n      createOrderInput: $createOrderInput\n    ) {\n      hash\n    }\n  }\n": types.CreateOrderDocument,
    "\nquery GetOrderListings($first: Int, $skip: Int, $orderDirection: OrderDirection, $order_OrderBy: Order_OrderBy, $where: Order_FilterArgs) {\n    orders(first: $first, skip: $skip, orderDirection: $orderDirection, order_OrderBy: $order_OrderBy, where: $where) {\n      hash\n      collectionAddress\n      tokenId\n      price\n      startTime\n      endTime\n      nonce\n      currencyAddress\n      amount\n      isOrderAsk\n      signer\n      strategy\n      minPercentageToAsk\n      params\n      signature\n    }\n  }\n": types.GetOrderListingsDocument,
    "\nquery GetOrderByHash($hash: ID!) {\n    order(hash: $hash) {\n      hash\n      collectionAddress\n      tokenId\n      price\n      startTime\n      endTime\n      nonce\n      currencyAddress\n      amount\n      isOrderAsk\n      signer\n      strategy\n      minPercentageToAsk\n      params\n      signature\n    }\n  }\n": types.GetOrderByHashDocument,
    "\n  query GetToken($id: String!) {\n    token(id: $id) {\n      id\n      tokenId\n      tokenUri\n      collection\n      owner\n      image\n      description\n      name\n      bids {\n        hash\n        collectionAddress\n        price\n        currencyAddress\n      }\n      asks {\n        hash\n        collectionAddress\n        price\n        currencyAddress\n      }\n    }\n  }\n": types.GetTokenDocument,
    "\n  query GetTokens($first: Int, $skip: Int, $orderDirection: OrderDirection, $where: Token_FilterArgs) {\n    tokens(first: $first, skip: $skip, orderDirection: $orderDirection, where: $where) {\n      id\n      tokenId\n      tokenUri\n      collection\n      owner\n      image\n      description\n      name\n      bids {\n        hash\n        collectionAddress\n        price\n        currencyAddress\n      }\n      asks {\n        hash\n        collectionAddress\n        price\n        currencyAddress\n      }\n    }\n  }\n": types.GetTokensDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetActivities($first: Int, $skip: Int, $where: Activity_FilterArgs) {\n    activities(first: $first, skip: $skip, where: $where) {\n      id\n      type\n      timestamp\n      to\n      from\n      tokenId\n      collection\n      txHash\n    }\n}\n"): (typeof documents)["\n  query GetActivities($first: Int, $skip: Int, $where: Activity_FilterArgs) {\n    activities(first: $first, skip: $skip, where: $where) {\n      id\n      type\n      timestamp\n      to\n      from\n      tokenId\n      collection\n      txHash\n    }\n}\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetCollections($first: Int, $skip: Int, $orderDirection: OrderDirection, $collection_OrderBy: Collection_OrderBy, $where: Collection_FilterArgs) {\n    collections(first: $first, skip: $skip, orderDirection: $orderDirection, collection_OrderBy: $collection_OrderBy, where: $where) {\n      id\n      name\n      symbol\n      totalTokens\n      image\n      description\n      volume  {\n        day1Volume\n        day7Volume\n        monthVolume\n        totalVolume\n      }\n      floor {\n        floorPrice\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetCollections($first: Int, $skip: Int, $orderDirection: OrderDirection, $collection_OrderBy: Collection_OrderBy, $where: Collection_FilterArgs) {\n    collections(first: $first, skip: $skip, orderDirection: $orderDirection, collection_OrderBy: $collection_OrderBy, where: $where) {\n      id\n      name\n      symbol\n      totalTokens\n      image\n      description\n      volume  {\n        day1Volume\n        day7Volume\n        monthVolume\n        totalVolume\n      }\n      floor {\n        floorPrice\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetCollection($id: String!) {\n    collection(id: $id) {\n      id\n      name\n      symbol\n      totalTokens\n      image\n      description\n      volume  {\n        day1Volume\n        day7Volume\n        monthVolume\n        totalVolume\n      }\n      floor {\n        floorPrice\n      }\n    }\n  }\n"): (typeof documents)["\nquery GetCollection($id: String!) {\n    collection(id: $id) {\n      id\n      name\n      symbol\n      totalTokens\n      image\n      description\n      volume  {\n        day1Volume\n        day7Volume\n        monthVolume\n        totalVolume\n      }\n      floor {\n        floorPrice\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetUserRelativeCollections($first: Int, $skip: Int, $user: String!) {\n    relativeCollections(first: $first, skip: $skip, user: $user) {\n      id\n      name\n      symbol\n      totalTokens\n      image\n      description\n    }\n  }\n"): (typeof documents)["\nquery GetUserRelativeCollections($first: Int, $skip: Int, $user: String!) {\n    relativeCollections(first: $first, skip: $skip, user: $user) {\n      id\n      name\n      symbol\n      totalTokens\n      image\n      description\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetNonce($signer: String!) {\n    nonce(signer: $signer) {\n      nonce\n    }\n  }\n"): (typeof documents)["\nquery GetNonce($signer: String!) {\n    nonce(signer: $signer) {\n      nonce\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateOrder(\n    $createOrderInput: CreateOrderInput!\n  ) {\n    createOrder(\n      createOrderInput: $createOrderInput\n    ) {\n      hash\n    }\n  }\n"): (typeof documents)["\n  mutation CreateOrder(\n    $createOrderInput: CreateOrderInput!\n  ) {\n    createOrder(\n      createOrderInput: $createOrderInput\n    ) {\n      hash\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetOrderListings($first: Int, $skip: Int, $orderDirection: OrderDirection, $order_OrderBy: Order_OrderBy, $where: Order_FilterArgs) {\n    orders(first: $first, skip: $skip, orderDirection: $orderDirection, order_OrderBy: $order_OrderBy, where: $where) {\n      hash\n      collectionAddress\n      tokenId\n      price\n      startTime\n      endTime\n      nonce\n      currencyAddress\n      amount\n      isOrderAsk\n      signer\n      strategy\n      minPercentageToAsk\n      params\n      signature\n    }\n  }\n"): (typeof documents)["\nquery GetOrderListings($first: Int, $skip: Int, $orderDirection: OrderDirection, $order_OrderBy: Order_OrderBy, $where: Order_FilterArgs) {\n    orders(first: $first, skip: $skip, orderDirection: $orderDirection, order_OrderBy: $order_OrderBy, where: $where) {\n      hash\n      collectionAddress\n      tokenId\n      price\n      startTime\n      endTime\n      nonce\n      currencyAddress\n      amount\n      isOrderAsk\n      signer\n      strategy\n      minPercentageToAsk\n      params\n      signature\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\nquery GetOrderByHash($hash: ID!) {\n    order(hash: $hash) {\n      hash\n      collectionAddress\n      tokenId\n      price\n      startTime\n      endTime\n      nonce\n      currencyAddress\n      amount\n      isOrderAsk\n      signer\n      strategy\n      minPercentageToAsk\n      params\n      signature\n    }\n  }\n"): (typeof documents)["\nquery GetOrderByHash($hash: ID!) {\n    order(hash: $hash) {\n      hash\n      collectionAddress\n      tokenId\n      price\n      startTime\n      endTime\n      nonce\n      currencyAddress\n      amount\n      isOrderAsk\n      signer\n      strategy\n      minPercentageToAsk\n      params\n      signature\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetToken($id: String!) {\n    token(id: $id) {\n      id\n      tokenId\n      tokenUri\n      collection\n      owner\n      image\n      description\n      name\n      bids {\n        hash\n        collectionAddress\n        price\n        currencyAddress\n      }\n      asks {\n        hash\n        collectionAddress\n        price\n        currencyAddress\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetToken($id: String!) {\n    token(id: $id) {\n      id\n      tokenId\n      tokenUri\n      collection\n      owner\n      image\n      description\n      name\n      bids {\n        hash\n        collectionAddress\n        price\n        currencyAddress\n      }\n      asks {\n        hash\n        collectionAddress\n        price\n        currencyAddress\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetTokens($first: Int, $skip: Int, $orderDirection: OrderDirection, $where: Token_FilterArgs) {\n    tokens(first: $first, skip: $skip, orderDirection: $orderDirection, where: $where) {\n      id\n      tokenId\n      tokenUri\n      collection\n      owner\n      image\n      description\n      name\n      bids {\n        hash\n        collectionAddress\n        price\n        currencyAddress\n      }\n      asks {\n        hash\n        collectionAddress\n        price\n        currencyAddress\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetTokens($first: Int, $skip: Int, $orderDirection: OrderDirection, $where: Token_FilterArgs) {\n    tokens(first: $first, skip: $skip, orderDirection: $orderDirection, where: $where) {\n      id\n      tokenId\n      tokenUri\n      collection\n      owner\n      image\n      description\n      name\n      bids {\n        hash\n        collectionAddress\n        price\n        currencyAddress\n      }\n      asks {\n        hash\n        collectionAddress\n        price\n        currencyAddress\n      }\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;