import React, { FC, useEffect, useState, useCallback, ReactNode } from 'react'

import {
  useAccount,
  useBalance,
  useNetwork,
  useSigner,
  mainnet,
  goerli,
  Address,
} from 'wagmi'

import { BigNumber, constants } from 'ethers'
import defaultExpirationOptions from '../../../lib/defaultExpirationOptions'
import { parseUnits } from 'ethers/lib/utils.js'
import dayjs from 'dayjs'
import { ExpirationOption } from 'types/ExpirationOption'
import { formatBN } from 'utils/numbers'
import { Currency } from 'types/currency'
import { useSdk } from 'context/sdkProvider'
import { GET_TOKEN } from 'graphql/queries/tokens'
import { useMutation, useQuery } from '@apollo/client'
import { CreateMakerBidOutput, MakerOrder } from '@gulabs/gu-nft-marketplace-sdk'
import { CREATE_ORDER } from 'graphql/queries/orders'
import currencyOptions from '../../../lib/defaultCurrencyOptions'
import { GET_NONCE } from 'graphql/queries/nonces'
import { Collection, Token } from '__generated__/graphql'
import { GET_COLLECTION } from 'graphql/queries/collections'

export type BidData = MakerOrder | null

export enum BidStep {
  SetPrice,
  Offering,
  Complete,
}

type ChildrenProps = {
  token?: Token
  collection?: Collection
  bidAmount: string
  bidStep: BidStep
  hasEnoughCurrency: boolean
  currencyBalance?: ReturnType<typeof useBalance>['data']
  transactionError?: Error | null
  expirationOptions: ExpirationOption[]
  expirationOption: ExpirationOption
  setBidStep: React.Dispatch<React.SetStateAction<BidStep>>
  setBidAmount: React.Dispatch<React.SetStateAction<string>>
  setExpirationOption: React.Dispatch<React.SetStateAction<ExpirationOption>>
  placeBid: () => void
  requestUserStep: RequestUserStep
  currencyOptions: Currency[]
  currencyOption: Currency
  setCurrencyOption: (currency: Currency) => void
  bidData: BidData
  steps: RequestUserStep[]
}

export enum RequestUserStep {
  APPROVAL,
  SIGN  
}


type Props = {
  open: boolean
  tokenId?: string
  collectionId?: string
  children: (props: ChildrenProps) => ReactNode
}

export const BidModalRenderer: FC<Props> = ({
  open,
  tokenId,
  collectionId,
  children,
}) => {
  const { data: signer } = useSigner()
  const [bidStep, setBidStep] = useState<BidStep>(BidStep.SetPrice)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [bidAmount, setBidAmount] = useState<string>('')
  const [expirationOption, setExpirationOption] = useState<ExpirationOption>(
    defaultExpirationOptions[3]
  )
  const [bidData, setBidData] = useState<BidData | null>(null)
  const [hasEnoughCurrency, setHasEnoughCurrency] =
    useState(false)
  const [requestUserStep, setRequestUserStep] = useState<RequestUserStep>(RequestUserStep.APPROVAL)
  const [steps, setSteps] = useState<RequestUserStep[]>([])

  const [currencyOption, setCurrencyOption] = useState<Currency>(
    currencyOptions[0]
  )
  const sdk = useSdk()

  const { data: tokenData, refetch: refetchToken } = useQuery(GET_TOKEN, {
    variables: { id: `${collectionId}-${tokenId}` },
    skip: !collectionId || !tokenId,
  })

  const { data: collectionData } = useQuery(GET_COLLECTION, {
    variables: { id: collectionId as string },
    skip: !collectionId
  })

  const collection = collectionData?.collection
  const token = tokenData?.token as Token

  const { address } = useAccount()

  const { data: currencyBalance } = useBalance({
    token: currencyOption?.contract as Address,
    address: address,
    watch: open,
  })

  const { data: dataNonce, refetch: refetchNonce } = useQuery(GET_NONCE, {
    variables: { signer: address?.toLowerCase() as string },
    skip: !address
  })
  const nonce = dataNonce?.nonce?.nonce

  const [createOrderMutation] = useMutation(CREATE_ORDER);

  useEffect(() => {
    if (bidAmount !== '') {
      const bid = parseUnits(bidAmount, currencyOption?.decimals)
      if (!currencyBalance?.value || currencyBalance?.value.lt(bid)) {
        setHasEnoughCurrency(false)
      } else {
        setHasEnoughCurrency(true)
      }
    } else {
      setHasEnoughCurrency(true)
    }
  }, [bidAmount, currencyBalance])

  useEffect(() => {
    if (!open) {
      setBidStep(BidStep.SetPrice)
      setExpirationOption(defaultExpirationOptions[3])
      setHasEnoughCurrency(false)
      setBidAmount('')
      setTransactionError(null)
    }

    if (address) {
      refetchNonce()
    }
    
    if (collectionId && tokenId) {
      refetchToken()
    }
  }, [open])

  useEffect(() => {
    setBidAmount('')
  }, [currencyOption])

  const placeBid = useCallback(async () => {
    try {
      if (!sdk.signer) {
        const error = new Error('Missing a signer')
        setTransactionError(error)
        throw error
      }
  
      if (!collectionId) {
        const error = new Error('Missing collection id')
        setTransactionError(error)
        throw error
      }
  
      setBidStep(BidStep.Offering)
      setTransactionError(null)
      
      const expirationTime = dayjs()
        .add(expirationOption.relativeTime, expirationOption.relativeTimeUnit)
        .unix()
     
      let makerBidOutput: CreateMakerBidOutput
      if (!tokenId) {
        // collection offer
        makerBidOutput = await sdk.createMakerCollectionOffer({
          collection: collectionId,
          price: parseUnits(bidAmount, currencyOption?.decimals),
          amount: 1,
          strategy: sdk.addresses.STRATEGY_COLLECTION_SALE_DEPRECATED,
          currency: currencyOption?.contract,
          nonce: nonce || 0,
          startTime: dayjs().unix(),
          endTime: expirationTime,
          minPercentageToAsk: 0,
          params: []
        })
      } else {
        // token offer
        makerBidOutput = await sdk.createMakerBid({
          collection: collectionId,
          price: parseUnits(bidAmount, currencyOption?.decimals),
          tokenId: tokenId,
          amount: 1,
          strategy: sdk.addresses.STRATEGY_STANDARD_SALE_DEPRECATED,
          currency: currencyOption?.contract,
          nonce: nonce || 0,
          startTime: dayjs().unix(),
          endTime: expirationTime,
          minPercentageToAsk: 0,
          params: []
        })
      }
      
      const { maker, isCurrencyApproved } = makerBidOutput
      setBidData(maker)
      if (!isCurrencyApproved) {
        setSteps([RequestUserStep.APPROVAL, RequestUserStep.SIGN])
      } else {
        setSteps([RequestUserStep.SIGN])
      }

      if (!isCurrencyApproved) {
        const tx = await sdk.approveErc20(maker.currency)
        await tx.wait()
      }
  
      setRequestUserStep(RequestUserStep.SIGN)
      const signature = await sdk.signMakerOrder(maker)
  
      await createOrderMutation({ variables: { createOrderInput: {
        collectionAddress: maker.collection,
        price: maker.price.toString(),
        tokenId: tokenId ? maker.tokenId.toString() : undefined,
        amount: Number(maker.amount),
        strategy: maker.strategy,
        currencyAddress: maker.currency,
        nonce: maker.nonce.toString(),
        startTime: Number(maker.startTime),
        endTime: Number(maker.endTime),
        minPercentageToAsk: Number(maker.minPercentageToAsk),
        params: maker.params.toString(),
        signer: maker.signer,
        signature: signature,
        isOrderAsk: maker.isOrderAsk
      }}})
      
      setBidStep(BidStep.Complete)
    } catch (error: any) {
      setTransactionError(error)
    }
  }, [
    tokenId,
    collectionId,
    currencyOption,
    signer,
    bidAmount,
    expirationOption,
  ])

  return (
    <>
      {children({
        token,
        collection,
        currencyBalance,
        bidAmount,
        bidStep,
        hasEnoughCurrency,
        transactionError,
        expirationOption,
        expirationOptions: defaultExpirationOptions,
        setBidStep,
        setBidAmount,
        setExpirationOption,
        placeBid,
        requestUserStep,
        currencyOptions,
        currencyOption,
        setCurrencyOption,
        bidData,
        steps
      })}
    </>
  )
}
