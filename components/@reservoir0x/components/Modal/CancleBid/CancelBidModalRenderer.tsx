import { useQuery } from '@apollo/client'
import { Collection, Order } from '__generated__/graphql'
import { useLooksRareSDK } from 'context/LooksRareSDKProvider'
import { GET_ORDER_BY_HASH } from 'graphql/queries/orders'
import { useCurrency } from 'hooks'
import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react'
import { Currency } from 'types/currency'
import { Token } from '__generated__/graphql'
import { useNetwork } from 'wagmi'
import { GET_TOKEN } from 'graphql/queries/tokens'
import { GET_COLLECTION } from 'graphql/queries/collections'

export enum CancelStep {
  Cancel,
  Approving,
  Complete,
}

type ChildrenProps = {
  loading: boolean
  bid?: Order
  token?: Token
  cancelStep: CancelStep
  transactionError?: Error | null
  totalUsd: number
  blockExplorerBaseUrl: string
  txHash: string | null
  setCancelStep: React.Dispatch<React.SetStateAction<CancelStep>>
  cancelOrder: () => void
  currency?: Currency
  collection?: Collection
}

type Props = {
  open: boolean
  bidId?: string
  children: (props: ChildrenProps) => ReactNode
}

export const CancelBidModalRenderer: FC<Props> = ({
  open,
  bidId,
  children,
}) => {
  const [cancelStep, setCancelStep] = useState<CancelStep>(CancelStep.Cancel)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [txHash, setTxHash] = useState<string|null>(null)
  const { chain: activeChain } = useNetwork()
  const blockExplorerBaseUrl =
    activeChain?.blockExplorers?.default.url || 'https://etherscan.io'
  const looksRareSdk = useLooksRareSDK()

  const { data, loading } = useQuery(GET_ORDER_BY_HASH, {
    variables: { hash: bidId as string }
  })

  const bid = data?.order as Order

  const currency = useCurrency(bid?.currencyAddress)

  const { data: tokenData } = useQuery(GET_TOKEN, {
    variables: { id: `${bid?.collectionAddress}-${bid?.tokenId}` },
  })

  const { data: collectionData } = useQuery(GET_COLLECTION, {
    variables: { id: bid?.collectionAddress as string },
  })

  const token = tokenData?.token as Token
  const collection = collectionData?.collection

  const cancelOrder = useCallback(async () => {
    try {
      if (!looksRareSdk.signer) {
        const error = new Error('Missing a signer')
        setTransactionError(error)
        throw error
      }
  
      if (!bid) {
        const error = new Error('Missing bid id to cancel')
        setTransactionError(error)
        throw error
      }
  
      setCancelStep(CancelStep.Approving)
      
      const tx = await looksRareSdk.cancelMultipleMakerOrders([bid?.nonce]).call()
      setTxHash(tx.hash);
      await tx.wait()
  
      setCancelStep(CancelStep.Complete)
    } catch (error: any) {
      const errorStatus = (error)?.statusCode
        let message = 'Oops, something went wrong. Please try again.'
        if (errorStatus >= 400 && errorStatus < 500) {
          message = error.message
        }
        //@ts-ignore: Should be fixed in an update to typescript
        const transactionError = new Error(message, {
          cause: error,
        })
        setTransactionError(transactionError)
        setCancelStep(CancelStep.Cancel)
        setTxHash(null);
    }
  }, [bid, looksRareSdk])

  useEffect(() => {
    if (!open) {
      setCancelStep(CancelStep.Cancel)
      setTransactionError(null)
      setTxHash(null)
    }
  }, [open])

  return (
    <>
      {children({
        loading,
        bid,
        cancelStep,
        transactionError,
        blockExplorerBaseUrl,
        setCancelStep,
        cancelOrder,
        txHash,
        token,
        totalUsd: 0,
        currency,
        collection
      })}
    </>
  )
}
