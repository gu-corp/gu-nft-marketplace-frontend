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
import { Token, Collection } from 'types/workaround'
import { Currency } from 'types/currency'
import { useLooksRareSDK } from 'context/LooksRareSDKProvider'
import { GET_NONCE, GET_TOKEN_BY_ID } from 'graphql/queries/tokens'
import { useMutation, useQuery } from '@apollo/client'
import { MakerOrder } from '@cuonghx.gu-tech/looksrare-sdk'
import { CREATE_ORDER } from 'graphql/queries/orders'
import { useNft } from 'use-nft'
import currencyOptions from '../../../lib/defaultCurrencyOptions'

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
  requestUserStep: "APPROVAL" | "SIGN"
  currencyOptions: Currency[]
  currencyOption: Currency
  setCurrencyOption: (currency: Currency) => void
  bidData: BidData
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
  const [requestUserStep, setRequestUserStep] = useState<"APPROVAL" | "SIGN">("APPROVAL")
  const [currencyOption, setCurrencyOption] = useState<Currency>(
    currencyOptions[0]
  )
  const looksRareSdk = useLooksRareSDK()

  // TO-DO: strategyOptions
  const strategy = looksRareSdk.addresses.STRATEGY_STANDARD_SALE_DEPRECATED;

  const { data: tokenData, refetch: refetchToken } = useQuery(GET_TOKEN_BY_ID, {
    variables: { id: `${collectionId}-${tokenId}`}
  })

  // TO-DO: remove later, should using token.image
  const { nft } = useNft(collectionId as string, tokenId as string)
  const token = { ...tokenData?.token, image: nft?.image } as Token

  const collection = tokenData?.token?.collection

  const { address } = useAccount()

  const { data: currencyBalance } = useBalance({
    token: currencyOption?.contract as Address,
    address: address,
    watch: open,
  })

  const { data: dataNonce, refetch: refetchNonce } = useQuery(GET_NONCE, {
    variables: { signer: address as string },
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

    refetchNonce()
    refetchToken()
  }, [open])

  useEffect(() => {
    setBidAmount('')
  }, [currencyOption])

  const placeBid = useCallback(async () => {
    try {
      if (!looksRareSdk.signer) {
        const error = new Error('Missing a signer')
        setTransactionError(error)
        throw error
      }
  
      if (!collectionId) {
        const error = new Error('Missing collection id')
        setTransactionError(error)
        throw error
      }
  
      if (!tokenId) {
        const error = new Error('Missing collection id')
        setTransactionError(error)
        throw error
      }
  
      setBidStep(BidStep.Offering)
      setTransactionError(null)
      
      const expirationTime = dayjs()
        .add(expirationOption.relativeTime, expirationOption.relativeTimeUnit)
        .unix()
      
      const { maker, isCurrencyApproved } = await looksRareSdk.createMakerBid({
        collection: collectionId,
        price: parseUnits(bidAmount, currencyOption?.decimals),
        tokenId: tokenId,
        amount: 1,
        strategy,
        currency: currencyOption?.contract,
        nonce: nonce || 0,
        startTime: dayjs().unix(),
        endTime: expirationTime,
        minPercentageToAsk: 0, // TO-DO: update later
        params: []
      })
  
      setBidData(maker)
    
      if (!isCurrencyApproved) {
        const tx = await looksRareSdk.approveErc20(maker.currency)
        await tx.wait()
      }
  
      setRequestUserStep("SIGN")
      const signature = await looksRareSdk.signMakerOrder(maker)
  
      await createOrderMutation({ variables: { createOrderInput: {
        collectionAddress: maker.collection,
        price: maker.price.toString(),
        tokenId: maker.tokenId.toString(),
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
      setRequestUserStep("APPROVAL")
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
        bidData
      })}
    </>
  )
}
