import React, {
  FC,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from 'react'

import { useAccount, useBalance, useSigner, useNetwork } from 'wagmi'

import { BigNumber, ContractTransaction, utils } from 'ethers'
import { formatUnits } from 'ethers/lib/utils.js'
import { constants } from 'ethers'
import { Collection, Token } from 'types/workaround'
import { Order } from '__generated__/graphql'
import { Currency } from 'types/currency'
import { Address } from 'wagmi'
import { useQuery } from '@apollo/client'
import { GET_TOKEN_BY_ID } from 'graphql/queries/tokens'
import { GET_ORDER_BY_HASH } from 'graphql/queries/orders'
import currencyOptions from '../lib/defaultCurrencyOptions'
import { useNft } from 'use-nft'
import { useLooksRareSDK } from 'context/LooksRareSDKProvider'
import { MakerOrder } from '@cuonghx.gu-tech/looksrare-sdk'

export enum BuyStep {
  Checkout,
  Approving,
  AddFunds,
  Complete,
  Unavailable,
}


type ChildrenProps = {
  loading: boolean
  token?: Token
  collection?: Collection
  listing?: Order
  currency?: Currency
  mixedCurrencies: boolean
  buyStep: BuyStep
  transactionError?: Error | null
  hasEnoughCurrency: boolean
  address?: string
  blockExplorerBaseUrl: string
  quantity: number
  setBuyStep: React.Dispatch<React.SetStateAction<BuyStep>>
  buyToken: () => void
  requestUserStep: "APPROVAL_ERC20" | "BUY"
  txHash?: string
}

type Props = {
  open: boolean
  tokenId?: string
  collectionId?: string
  orderId?: string
  children: (props: ChildrenProps) => ReactNode
}

export const BuyModalRenderer: FC<Props> = ({
  open,
  tokenId,
  collectionId,
  orderId,
  children,
}) => {
  const looksRareSdk = useLooksRareSDK()
  const [currency, setCurrency] = useState<undefined | Currency>()
  const [buyStep, setBuyStep] = useState<BuyStep>(BuyStep.Checkout)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)
  // able to buy mixed ETH + WETH
  const [mixedCurrencies, setMixedCurrencies] = useState(false)
  const [requestUserStep, setRequestUserStep] = useState<"APPROVAL_ERC20" | "BUY">("APPROVAL_ERC20")
  const { chain: activeChain } = useNetwork()
  const blockExplorerBaseUrl =
    activeChain?.blockExplorers?.default?.url || 'https://etherscan.io'
  const [txHash, setTxHash] = useState<string | undefined>(undefined)

  const { data: tokenData } = useQuery(GET_TOKEN_BY_ID, {
    variables: { id: `${collectionId}-${tokenId}`}
  })

  const { address } = useAccount()

  const { data: ethBalance } = useBalance({
    address: address,
    watch: open,
    formatUnits: currency?.decimals,
  })

  const { data: currencyBalance } = useBalance({
    address: address,
    token: currency?.contract as Address,
    watch: open,
    formatUnits: currency?.decimals,
  })

    // TO-DO: remove later, should using token.image
  const { nft } = useNft(collectionId as string, tokenId as string)
  
  const collection = tokenData?.token?.collection
  const token = { ...tokenData?.token, image: nft?.image } as Token

  const { data, loading } = useQuery(GET_ORDER_BY_HASH, {
    variables: { hash: orderId as string }
  })

  const listing = data?.order as Order

  const buyToken = useCallback(async () => {
    try {
      if (!tokenId || !collectionId) {
        const error = new Error('Missing tokenId or collectionId')
        setTransactionError(error)
        throw error
      }

      setBuyStep(BuyStep.Approving)
      if (!mixedCurrencies) {
        const tx = await looksRareSdk.approveErc20(listing.currencyAddress)
        await tx.wait() 
      }
      
      setRequestUserStep("BUY")
  
      const maker: MakerOrder = {
        isOrderAsk: listing.isOrderAsk,
        signer: listing.signer,
        collection: listing.collectionAddress,
        price: listing.price,
        tokenId: listing.tokenId,
        amount: listing.amount,
        strategy: listing.strategy,
        currency: listing.currencyAddress,
        nonce: listing.nonce,
        startTime: listing.startTime,
        endTime: listing.endTime,
        minPercentageToAsk: listing.minPercentageToAsk,
        params: listing.params
      };
  
      const taker = looksRareSdk.createTaker(maker, {
        taker: address as string
      })
  
      let tx: ContractTransaction | null = null;
      if (mixedCurrencies) {
        tx = await looksRareSdk.executeOrder(maker, taker, listing.signature, { value: listing.price }).call()
      } else {
        tx = await looksRareSdk.executeOrder(maker, taker, listing.signature).call()
      }
      setTxHash(tx.hash)
      await tx.wait()
  
      setBuyStep(BuyStep.Complete)
    } catch (error: any) {
      console.log(error)
      setTransactionError(error)
      setRequestUserStep("APPROVAL_ERC20")
    }
  }, [
    tokenId,
    collectionId,
    mixedCurrencies
  ])

  useEffect(() => {
    if (listing) {
      const currency = currencyOptions.find(currency => currency.contract === listing.currencyAddress)
      const wethOpt = currencyOptions[0];

      setCurrency(currency)
      setMixedCurrencies(listing.currencyAddress === wethOpt.contract)

    } else if (!listing && !loading && token) {
      setBuyStep(BuyStep.Unavailable)
      setCurrency(undefined)
      setMixedCurrencies(false)
    }
  }, [
    listing,
    loading,
    token,
  ])

  useEffect(() => {
    const totalBalance = mixedCurrencies ? currencyBalance?.value.add(ethBalance?.value || 0) : currencyBalance?.value
    if (!totalBalance) {
      setHasEnoughCurrency(false)
    } else if (totalBalance.lt(utils.parseUnits(listing?.price || "0", 0))) {
      setHasEnoughCurrency(false)
    } else {
      setHasEnoughCurrency(true)
    }
    
  }, [currencyBalance, currency, ethBalance])

  useEffect(() => {
    if (!open) {
      setBuyStep(BuyStep.Checkout)
      setTransactionError(null)
    }
  }, [open])


  return (
    <>
      {children({
        loading: !listing || loading || !token,
        token,
        collection,
        listing,
        currency,
        mixedCurrencies,
        buyStep,
        transactionError,
        hasEnoughCurrency,
        address: address,
        blockExplorerBaseUrl,
        setBuyStep,
        buyToken,
        quantity: 1,
        requestUserStep,
        txHash
      })}
    </>
  )
}
