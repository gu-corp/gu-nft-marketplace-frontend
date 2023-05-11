import React, {
  FC,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  ComponentProps,
} from 'react'

import { useAccount, useSigner, useNetwork, useProvider, Address } from 'wagmi'
import Fees from './Fees'
import { Collection, Token } from 'types/workaround'
import { GET_TOKEN_BY_ID } from 'graphql/queries/tokens'
import { useQuery } from '@apollo/client'
import { useNft } from 'use-nft'
import { Order } from '__generated__/graphql'
import { GET_ORDER_BY_HASH } from 'graphql/queries/orders'
import { useLooksRareSDK } from 'context/LooksRareSDKProvider'
import { useCurrency, useRoyaltyFee, useStrategyFee } from 'hooks'
import { Currency } from 'types/currency'
import { MakerOrder, isApprovedForAll } from "@cuonghx.gu-tech/looksrare-sdk"

export enum AcceptBidStep {
  Checkout,
  ApproveMarketplace,
  Confirming,
  Finalizing,
  Complete,
  Unavailable,
}


type ChildrenProps = {
  loading: boolean
  token?: Token
  bid?: Order
  collection?: Collection
  acceptBidStep: AcceptBidStep
  fees: ComponentProps<typeof Fees>['fees']
  transactionError?: Error | null
  txHash: string | null
  address?: string
  etherscanBaseUrl: string
  acceptBid: () => void
  setAcceptBidStep: React.Dispatch<React.SetStateAction<AcceptBidStep>>
  currency?: Currency
}

type Props = {
  open: boolean
  tokenId?: string
  collectionId?: string
  bidId?: string
  children: (props: ChildrenProps) => ReactNode
}

export const AcceptBidModalRenderer: FC<Props> = ({
  open,
  tokenId,
  bidId,
  collectionId,
  children,
}) => {
  const provider = useProvider()
  const [acceptBidStep, setAcceptBidStep] = useState<AcceptBidStep>(
    AcceptBidStep.Checkout
  )
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [txHash, setTxHash] = useState<string | null>(null)
  const { chain: activeChain } = useNetwork()
  const etherscanBaseUrl =
    activeChain?.blockExplorers?.default?.url || 'https://etherscan.io'
  const looksRareSdk = useLooksRareSDK()

  const { data: tokenData, loading: tokenLoading } = useQuery(GET_TOKEN_BY_ID, {
    variables: { id: `${collectionId}-${tokenId}` },
  })
  // TO-DO: remove later, should using token.image
  const { nft } = useNft(collectionId as string, tokenId as string)
  const token = {...tokenData?.token, image: nft?.image} as Token
  const collection = token.collection;

  const { data, loading: bidLoading } = useQuery(GET_ORDER_BY_HASH, {
    variables: { hash: bidId as string }
  })

  const bid = data?.order as Order
  const currency = useCurrency(bid?.currencyAddress)

  // TO-DO: strategyOptions
  const strategy = looksRareSdk.addresses.STRATEGY_STANDARD_SALE_DEPRECATED;
  
  const protocolFee = useStrategyFee(strategy)
  const royaltyFee = useRoyaltyFee(collectionId as string, tokenId as string)

  const fees = {
    feeBreakdown: [
      {
        kind: 'marketplace',
        bps: protocolFee
      },
      {
        kind: 'royalty',
        bps: royaltyFee
      }
    ]
  } as ComponentProps<typeof Fees>['fees'];

  const acceptBid = useCallback(async () => {
    try {
      if (!looksRareSdk.signer) {
        const error = new Error('Missing a signer')
        setTransactionError(error)
        throw error
      }
  
      if (!tokenId || !collectionId) {
        const error = new Error('Missing tokenId or collectionId')
        setTransactionError(error)
        throw error
      }
  
      setAcceptBidStep(AcceptBidStep.Confirming)
      
      const isCollectionApproved = await isApprovedForAll(
        provider,
        collectionId,
        address as Address,
        looksRareSdk.addresses.EXCHANGE
      )
  
      if (isCollectionApproved) {
        setAcceptBidStep(AcceptBidStep.ApproveMarketplace)
        const tx = await looksRareSdk.approveAllCollectionItems(collectionId, true)
        setTxHash(tx.hash)
        setAcceptBidStep(AcceptBidStep.Finalizing)
        await tx.wait()
      }
  
      setAcceptBidStep(AcceptBidStep.Confirming)
      const maker: MakerOrder = {
        isOrderAsk: bid.isOrderAsk,
        signer: bid.signer,
        collection: bid.collectionAddress,
        price: bid.price,
        tokenId: bid.tokenId,
        amount: bid.amount,
        strategy: bid.strategy,
        currency: bid.currencyAddress,
        nonce: bid.nonce,
        startTime: bid.startTime,
        endTime: bid.endTime,
        minPercentageToAsk: bid.minPercentageToAsk,
        params: bid.params
      };
  
      const taker = looksRareSdk.createTaker(maker, {
        taker: address as Address
      })
  
      const tx = await looksRareSdk.executeOrder(maker, taker, bid.signature).call()
      setTxHash(tx.hash)
      setAcceptBidStep(AcceptBidStep.Finalizing)
      await tx.wait()
  
      setAcceptBidStep(AcceptBidStep.Complete) 
    } catch (error: any) {
      setTransactionError(error)
    }
  }, [
    tokenId,
    collectionId,
    looksRareSdk,
    bid
  ])

  useEffect(() => {
    if ((!bid && !bidLoading) || (!token && !tokenLoading)) {
      setAcceptBidStep(AcceptBidStep.Unavailable)
    }
  }, [bid, bidLoading, token, tokenLoading])

  const { address } = useAccount()

  useEffect(() => {
    if (!open) {
      setAcceptBidStep(AcceptBidStep.Checkout)
      setTxHash(null)
      setTransactionError(null)
    }
  }, [open])

  return (
    <>
      {children({
        loading: bidLoading && tokenLoading,
        token,
        collection,
        acceptBidStep,
        transactionError,
        txHash,
        address,
        etherscanBaseUrl,
        acceptBid,
        setAcceptBidStep,
        bid,
        currency,
        fees
      })}
    </>
  )
}
