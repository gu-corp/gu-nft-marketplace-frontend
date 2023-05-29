/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Activity = {
  __typename?: 'Activity';
  collection?: Maybe<Scalars['String']>;
  from?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  order?: Maybe<Order>;
  timestamp?: Maybe<Scalars['Int']>;
  to?: Maybe<Scalars['String']>;
  tokenId?: Maybe<Scalars['String']>;
  txHash?: Maybe<Scalars['String']>;
  type: ActivityType;
};

export enum ActivityType {
  CancelListingEvent = 'CancelListingEvent',
  CancelOfferEvent = 'CancelOfferEvent',
  ListingEvent = 'ListingEvent',
  MintEvent = 'MintEvent',
  NftTransferEvent = 'NftTransferEvent',
  OfferEvent = 'OfferEvent',
  SaleEvent = 'SaleEvent'
}

export type Activity_FilterArgs = {
  collection?: InputMaybe<Scalars['String']>;
  tokenId?: InputMaybe<Scalars['String']>;
  types?: InputMaybe<Array<ActivityType>>;
  user?: InputMaybe<Scalars['String']>;
};

export type Collection = {
  __typename?: 'Collection';
  description?: Maybe<Scalars['String']>;
  floor?: Maybe<CollectionFloorPrice>;
  id: Scalars['String'];
  image?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  symbol?: Maybe<Scalars['String']>;
  totalTokens: Scalars['Int'];
  volume?: Maybe<CollectionVolume>;
};

export type CollectionFloorPrice = {
  __typename?: 'CollectionFloorPrice';
  floorPrice?: Maybe<Scalars['String']>;
};

export type CollectionVolume = {
  __typename?: 'CollectionVolume';
  day1Volume?: Maybe<Scalars['String']>;
  day7Volume?: Maybe<Scalars['String']>;
  monthVolume?: Maybe<Scalars['String']>;
  totalVolume?: Maybe<Scalars['String']>;
};

export enum Collection_OrderBy {
  Volume1d = 'Volume1d',
  Volume1m = 'Volume1m',
  Volume7d = 'Volume7d',
  VolumeMax = 'VolumeMax'
}

export type CreateOrderInput = {
  /** The amount of tokens to sell/purchase. It's 1 for ERC-721 and >= 1 for ERC-1155. */
  amount: Scalars['Int'];
  /** The address of the collection. */
  collectionAddress: Scalars['String'];
  /** The currency address. See Addresses | LooksRare SDK for the possible values. */
  currencyAddress: Scalars['String'];
  /** End time timestamp in seconds (when the order becomes invalid). */
  endTime: Scalars['Int'];
  /** If true, the order is a sell order (listing). If false, the order is a buy order (offer). */
  isOrderAsk: Scalars['Boolean'];
  /** The minPercentageToAsk represents the minimum percentage required to be transferred to the ask or the trade is rejected (e.g., 9800 = 98% of the trade price). It protects the ask user from an unexpected increase in fees. */
  minPercentageToAsk: Scalars['Int'];
  /** The order nonce. It's meant to be unique expect for conditional orders. Once executed, the order nonce becomes invalid rendering all the orders with the same nonce invalid. */
  nonce: Scalars['String'];
  /** The order params are used for more advanced orders. For example to define the maximum price for a Dutch auction or recipient address for a private sale. Not used for standard orders. */
  params: Scalars['String'];
  /** The price in WEI. */
  price: Scalars['String'];
  /** The full EIP-712 signature. */
  signature: Scalars['String'];
  /** The address of the MakerOrder signer. */
  signer: Scalars['String'];
  /** Start time timestamp in seconds (when the order starts to be valid). */
  startTime: Scalars['Int'];
  /** The strategy address. See Addresses | LooksRare SDK for the possible values. */
  strategy: Scalars['String'];
  /** The id of the asset. If the order is a collection offer, this field will be null. */
  tokenId: Scalars['String'];
};

export enum EventKind {
  CancelAllOrders = 'CancelAllOrders',
  CancelMultipleOrders = 'CancelMultipleOrders',
  Erc20Approval = 'ERC20Approval',
  Erc721ApprovalForAll = 'ERC721ApprovalForAll',
  Erc721Transfer = 'ERC721Transfer',
  TakerAsk = 'TakerAsk',
  TakerBid = 'TakerBid'
}

export type Mutation = {
  __typename?: 'Mutation';
  createOrder: Order;
  reSyncDailyVolume: Scalars['String'];
  syncEvents: Scalars['String'];
};


export type MutationCreateOrderArgs = {
  createOrderInput: CreateOrderInput;
};


export type MutationSyncEventsArgs = {
  syncEventInput: SyncEventInput;
};

export type Nonce = {
  __typename?: 'Nonce';
  /** The order nonce. It's meant to be unique expect for conditional orders. Once executed, the order nonce becomes invalid rendering all the orders with the same nonce invalid. */
  nonce: Scalars['String'];
  /** The address of the MakerOrder signer. */
  signer: Scalars['String'];
};

export type Order = {
  __typename?: 'Order';
  /** The amount of tokens to sell/purchase. It's 1 for ERC-721 and >= 1 for ERC-1155. */
  amount: Scalars['Int'];
  /** The address of the collection. */
  collectionAddress: Scalars['String'];
  createdAt: Scalars['Int'];
  /** The currency address. See Addresses | LooksRare SDK for the possible values. */
  currencyAddress: Scalars['String'];
  /** End time timestamp in seconds (when the order becomes invalid). */
  endTime: Scalars['Int'];
  /** The order hash is a unique hash which identifies the order. */
  hash: Scalars['String'];
  /** If true, the order is a sell order (listing). If false, the order is a buy order (offer). */
  isOrderAsk: Scalars['Boolean'];
  /** The minPercentageToAsk represents the minimum percentage required to be transferred to the ask or the trade is rejected (e.g., 9800 = 98% of the trade price). It protects the ask user from an unexpected increase in fees. */
  minPercentageToAsk: Scalars['Int'];
  /** The order nonce. It's meant to be unique expect for conditional orders. Once executed, the order nonce becomes invalid rendering all the orders with the same nonce invalid. */
  nonce: Scalars['String'];
  /** The order params are used for more advanced orders. For example to define the maximum price for a Dutch auction or recipient address for a private sale. Not used for standard orders. */
  params: Scalars['String'];
  /** The price in WEI. */
  price: Scalars['String'];
  /** The r parameter of the EIP-712 signature. */
  r: Scalars['String'];
  /** The s parameter of the EIP-712 signature. */
  s: Scalars['String'];
  /** The full EIP-712 signature. */
  signature: Scalars['String'];
  /** The address of the MakerOrder signer. */
  signer: Scalars['String'];
  /** Start time timestamp in seconds (when the order starts to be valid). */
  startTime: Scalars['Int'];
  /** The order status. Only VALID orders can be matched with a TakerOrder. */
  status: OrderStatus;
  /** The strategy address. See Addresses | LooksRare SDK for the possible values. */
  strategy: Scalars['String'];
  /** The id of the asset. If the order is a collection offer, this field will be null. */
  tokenId: Scalars['String'];
  updatedAt: Scalars['Int'];
  /** The v parameter of the EIP-712 signature. */
  v: Scalars['String'];
};

export enum OrderDirection {
  Asc = 'Asc',
  Desc = 'Desc'
}

export enum OrderStatus {
  Cancelled = 'CANCELLED',
  Erc20Approval = 'ERC20_APPROVAL',
  ErcApproval = 'ERC_APPROVAL',
  Executed = 'EXECUTED',
  Expired = 'EXPIRED',
  InvalidOwner = 'INVALID_OWNER',
  Valid = 'VALID'
}

export type Order_FilterArgs = {
  collectionAddress?: InputMaybe<Scalars['String']>;
  isOrderAsk?: InputMaybe<Scalars['Boolean']>;
  signer?: InputMaybe<Scalars['String']>;
  tokenId?: InputMaybe<Scalars['String']>;
};

export enum Order_OrderBy {
  CreatedAt = 'CreatedAt',
  Price = 'Price'
}

export type Query = {
  __typename?: 'Query';
  activities: Array<Activity>;
  collection: Collection;
  collections: Array<Collection>;
  nonce: Nonce;
  order: Order;
  orders: Array<Order>;
  relativeCollections: Array<Collection>;
  token: Token;
  tokens: Array<Token>;
};


export type QueryActivitiesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Activity_FilterArgs>;
};


export type QueryCollectionArgs = {
  id: Scalars['String'];
};


export type QueryCollectionsArgs = {
  collection_OrderBy?: InputMaybe<Collection_OrderBy>;
  first?: InputMaybe<Scalars['Int']>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
};


export type QueryNonceArgs = {
  signer: Scalars['String'];
};


export type QueryOrderArgs = {
  hash: Scalars['ID'];
};


export type QueryOrdersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderDirection?: InputMaybe<OrderDirection>;
  order_OrderBy?: InputMaybe<Order_OrderBy>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Order_FilterArgs>;
};


export type QueryRelativeCollectionsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  user: Scalars['String'];
};


export type QueryTokenArgs = {
  id: Scalars['String'];
};


export type QueryTokensArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Token_FilterArgs>;
};

export type SyncEventInput = {
  backfill: Scalars['Boolean'];
  fromBlock: Scalars['Int'];
  kinds?: InputMaybe<Array<EventKind>>;
  toBlock: Scalars['Int'];
};

export type Token = {
  __typename?: 'Token';
  asks?: Maybe<Array<Order>>;
  bids?: Maybe<Array<Order>>;
  collection: Scalars['String'];
  description?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  image?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  owner: Scalars['String'];
  tokenId: Scalars['String'];
  tokenUri?: Maybe<Scalars['String']>;
};

export type Token_FilterArgs = {
  collection?: InputMaybe<Scalars['String']>;
  owner?: InputMaybe<Scalars['String']>;
};

export type GetActivitiesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Activity_FilterArgs>;
}>;


export type GetActivitiesQuery = { __typename?: 'Query', activities: Array<{ __typename?: 'Activity', id: string, type: ActivityType, timestamp?: number | null, to?: string | null, from?: string | null, tokenId?: string | null, collection?: string | null, txHash?: string | null }> };

export type GetCollectionsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  orderDirection?: InputMaybe<OrderDirection>;
  collection_OrderBy?: InputMaybe<Collection_OrderBy>;
}>;


export type GetCollectionsQuery = { __typename?: 'Query', collections: Array<{ __typename?: 'Collection', id: string, name?: string | null, symbol?: string | null, totalTokens: number, image?: string | null, description?: string | null, volume?: { __typename?: 'CollectionVolume', day1Volume?: string | null, day7Volume?: string | null, monthVolume?: string | null, totalVolume?: string | null } | null, floor?: { __typename?: 'CollectionFloorPrice', floorPrice?: string | null } | null }> };

export type GetCollectionQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetCollectionQuery = { __typename?: 'Query', collection: { __typename?: 'Collection', id: string, name?: string | null, symbol?: string | null, totalTokens: number, image?: string | null, description?: string | null, volume?: { __typename?: 'CollectionVolume', day1Volume?: string | null, day7Volume?: string | null, monthVolume?: string | null, totalVolume?: string | null } | null, floor?: { __typename?: 'CollectionFloorPrice', floorPrice?: string | null } | null } };

export type GetUserRelativeCollectionsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  user: Scalars['String'];
}>;


export type GetUserRelativeCollectionsQuery = { __typename?: 'Query', relativeCollections: Array<{ __typename?: 'Collection', id: string, name?: string | null, symbol?: string | null, totalTokens: number, image?: string | null, description?: string | null }> };

export type GetNonceQueryVariables = Exact<{
  signer: Scalars['String'];
}>;


export type GetNonceQuery = { __typename?: 'Query', nonce: { __typename?: 'Nonce', nonce: string } };

export type CreateOrderMutationVariables = Exact<{
  createOrderInput: CreateOrderInput;
}>;


export type CreateOrderMutation = { __typename?: 'Mutation', createOrder: { __typename?: 'Order', hash: string } };

export type GetOrderListingsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  orderDirection?: InputMaybe<OrderDirection>;
  order_OrderBy?: InputMaybe<Order_OrderBy>;
  where?: InputMaybe<Order_FilterArgs>;
}>;


export type GetOrderListingsQuery = { __typename?: 'Query', orders: Array<{ __typename?: 'Order', hash: string, collectionAddress: string, tokenId: string, price: string, startTime: number, endTime: number, nonce: string, currencyAddress: string, amount: number, isOrderAsk: boolean, signer: string, strategy: string, minPercentageToAsk: number, params: string, signature: string }> };

export type GetOrderByHashQueryVariables = Exact<{
  hash: Scalars['ID'];
}>;


export type GetOrderByHashQuery = { __typename?: 'Query', order: { __typename?: 'Order', hash: string, collectionAddress: string, tokenId: string, price: string, startTime: number, endTime: number, nonce: string, currencyAddress: string, amount: number, isOrderAsk: boolean, signer: string, strategy: string, minPercentageToAsk: number, params: string, signature: string } };

export type GetTokenQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetTokenQuery = { __typename?: 'Query', token: { __typename?: 'Token', id: string, tokenId: string, tokenUri?: string | null, collection: string, owner: string, image?: string | null, description?: string | null, name?: string | null, bids?: Array<{ __typename?: 'Order', hash: string, collectionAddress: string, price: string, currencyAddress: string }> | null, asks?: Array<{ __typename?: 'Order', hash: string, collectionAddress: string, price: string, currencyAddress: string }> | null } };

export type GetTokensQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Token_FilterArgs>;
}>;


export type GetTokensQuery = { __typename?: 'Query', tokens: Array<{ __typename?: 'Token', id: string, tokenId: string, tokenUri?: string | null, collection: string, owner: string, image?: string | null, description?: string | null, name?: string | null, bids?: Array<{ __typename?: 'Order', hash: string, collectionAddress: string, price: string, currencyAddress: string }> | null, asks?: Array<{ __typename?: 'Order', hash: string, collectionAddress: string, price: string, currencyAddress: string }> | null }> };


export const GetActivitiesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetActivities"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"where"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Activity_FilterArgs"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activities"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"Variable","name":{"kind":"Name","value":"where"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}},{"kind":"Field","name":{"kind":"Name","value":"to"}},{"kind":"Field","name":{"kind":"Name","value":"from"}},{"kind":"Field","name":{"kind":"Name","value":"tokenId"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"txHash"}}]}}]}}]} as unknown as DocumentNode<GetActivitiesQuery, GetActivitiesQueryVariables>;
export const GetCollectionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCollections"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderDirection"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderDirection"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"collection_OrderBy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Collection_OrderBy"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collections"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderDirection"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderDirection"}}},{"kind":"Argument","name":{"kind":"Name","value":"collection_OrderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"collection_OrderBy"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"totalTokens"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"volume"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"day1Volume"}},{"kind":"Field","name":{"kind":"Name","value":"day7Volume"}},{"kind":"Field","name":{"kind":"Name","value":"monthVolume"}},{"kind":"Field","name":{"kind":"Name","value":"totalVolume"}}]}},{"kind":"Field","name":{"kind":"Name","value":"floor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"floorPrice"}}]}}]}}]}}]} as unknown as DocumentNode<GetCollectionsQuery, GetCollectionsQueryVariables>;
export const GetCollectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCollection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"totalTokens"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"volume"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"day1Volume"}},{"kind":"Field","name":{"kind":"Name","value":"day7Volume"}},{"kind":"Field","name":{"kind":"Name","value":"monthVolume"}},{"kind":"Field","name":{"kind":"Name","value":"totalVolume"}}]}},{"kind":"Field","name":{"kind":"Name","value":"floor"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"floorPrice"}}]}}]}}]}}]} as unknown as DocumentNode<GetCollectionQuery, GetCollectionQueryVariables>;
export const GetUserRelativeCollectionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUserRelativeCollections"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"user"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"relativeCollections"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"user"},"value":{"kind":"Variable","name":{"kind":"Name","value":"user"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}},{"kind":"Field","name":{"kind":"Name","value":"totalTokens"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<GetUserRelativeCollectionsQuery, GetUserRelativeCollectionsQueryVariables>;
export const GetNonceDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetNonce"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"signer"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nonce"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"signer"},"value":{"kind":"Variable","name":{"kind":"Name","value":"signer"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nonce"}}]}}]}}]} as unknown as DocumentNode<GetNonceQuery, GetNonceQueryVariables>;
export const CreateOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"createOrderInput"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"createOrderInput"},"value":{"kind":"Variable","name":{"kind":"Name","value":"createOrderInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hash"}}]}}]}}]} as unknown as DocumentNode<CreateOrderMutation, CreateOrderMutationVariables>;
export const GetOrderListingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrderListings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderDirection"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderDirection"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"order_OrderBy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Order_OrderBy"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"where"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Order_FilterArgs"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderDirection"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderDirection"}}},{"kind":"Argument","name":{"kind":"Name","value":"order_OrderBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"order_OrderBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"Variable","name":{"kind":"Name","value":"where"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"collectionAddress"}},{"kind":"Field","name":{"kind":"Name","value":"tokenId"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"nonce"}},{"kind":"Field","name":{"kind":"Name","value":"currencyAddress"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"isOrderAsk"}},{"kind":"Field","name":{"kind":"Name","value":"signer"}},{"kind":"Field","name":{"kind":"Name","value":"strategy"}},{"kind":"Field","name":{"kind":"Name","value":"minPercentageToAsk"}},{"kind":"Field","name":{"kind":"Name","value":"params"}},{"kind":"Field","name":{"kind":"Name","value":"signature"}}]}}]}}]} as unknown as DocumentNode<GetOrderListingsQuery, GetOrderListingsQueryVariables>;
export const GetOrderByHashDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOrderByHash"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hash"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"hash"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hash"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"collectionAddress"}},{"kind":"Field","name":{"kind":"Name","value":"tokenId"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"nonce"}},{"kind":"Field","name":{"kind":"Name","value":"currencyAddress"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"isOrderAsk"}},{"kind":"Field","name":{"kind":"Name","value":"signer"}},{"kind":"Field","name":{"kind":"Name","value":"strategy"}},{"kind":"Field","name":{"kind":"Name","value":"minPercentageToAsk"}},{"kind":"Field","name":{"kind":"Name","value":"params"}},{"kind":"Field","name":{"kind":"Name","value":"signature"}}]}}]}}]} as unknown as DocumentNode<GetOrderByHashQuery, GetOrderByHashQueryVariables>;
export const GetTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"token"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tokenId"}},{"kind":"Field","name":{"kind":"Name","value":"tokenUri"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"owner"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"bids"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"collectionAddress"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currencyAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"asks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"collectionAddress"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currencyAddress"}}]}}]}}]}}]} as unknown as DocumentNode<GetTokenQuery, GetTokenQueryVariables>;
export const GetTokensDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetTokens"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skip"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderDirection"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderDirection"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"where"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Token_FilterArgs"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tokens"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"skip"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skip"}}},{"kind":"Argument","name":{"kind":"Name","value":"orderDirection"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderDirection"}}},{"kind":"Argument","name":{"kind":"Name","value":"where"},"value":{"kind":"Variable","name":{"kind":"Name","value":"where"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tokenId"}},{"kind":"Field","name":{"kind":"Name","value":"tokenUri"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"owner"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"bids"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"collectionAddress"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currencyAddress"}}]}},{"kind":"Field","name":{"kind":"Name","value":"asks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hash"}},{"kind":"Field","name":{"kind":"Name","value":"collectionAddress"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"currencyAddress"}}]}}]}}]}}]} as unknown as DocumentNode<GetTokensQuery, GetTokensQueryVariables>;