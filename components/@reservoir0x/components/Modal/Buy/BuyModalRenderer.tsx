import React, {
  FC,
  useEffect,
  useState,
  useCallback,
  ReactNode,
  SetStateAction,
  Dispatch,
} from 'react'

import { useAccount, useBalance, useNetwork, useProvider } from 'wagmi'

import { BigNumber, ContractTransaction, constants, utils } from 'ethers'
import { Collection, Order, Token } from '__generated__/graphql'
import { Currency } from 'types/currency'
import { Address } from 'wagmi'
import { useQuery } from '@apollo/client'
import { GET_ORDER_BY_HASH } from 'graphql/queries/orders'
import { useSdk } from 'context/SDKProvider'
import { MakerOrder, allowance } from '@gulabs/gu-nft-marketplace-sdk'
import { GET_TOKEN } from 'graphql/queries/tokens'
import { GET_COLLECTION } from 'graphql/queries/collections'
import useCurrencyOptions from 'hooks/useCurrencyOptions'

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
  buyStep: BuyStep
  transactionError?: Error | null
  hasEnoughCurrency: boolean
  address?: string
  blockExplorerBaseUrl: string
  quantity: number
  setBuyStep: React.Dispatch<React.SetStateAction<BuyStep>>
  buyToken: () => void
  requestUserStep: RequestUserStep
  txHash?: string
  ethBalance?: ReturnType<typeof useBalance>['data']
  currencyBalance?: ReturnType<typeof useBalance>['data']
  steps: RequestUserStep[],
  currencyOptions: Currency[],
  setCurrency: Dispatch<SetStateAction<Currency | undefined>>
}

export enum RequestUserStep {
  APPROVAL_ERC20,
  BUY
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
  const sdk = useSdk()
  const provider = useProvider()
  const [currency, setCurrency] = useState<undefined | Currency>()
  const [buyStep, setBuyStep] = useState<BuyStep>(BuyStep.Checkout)
  const [transactionError, setTransactionError] = useState<Error | null>()
  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)
  const [requestUserStep, setRequestUserStep] = useState<RequestUserStep>(RequestUserStep.APPROVAL_ERC20)
  const { chain: activeChain } = useNetwork()
  const blockExplorerBaseUrl =
    activeChain?.blockExplorers?.default?.url || 'https://etherscan.io'
  const [txHash, setTxHash] = useState<string | undefined>(undefined)
  const [steps, setSteps] = useState<RequestUserStep[]>([])

  const { data: tokenData } = useQuery(GET_TOKEN, {
    variables: { id: `${collectionId}-${tokenId}` },
    skip: !collectionId || !tokenId
  })

  const { data: collectionData } = useQuery(GET_COLLECTION, {
    variables: { id: collectionId as string },
    skip: !collectionId
  })


  const { address } = useAccount()

  const { data: ethBalance } = useBalance({
    address: address,
    watch: open,
    formatUnits: currency?.decimals,
  })

  const { data: currencyBalance } = useBalance({
    address: address,
    token: currency?.contract !==  constants.AddressZero ? currency?.contract as Address : undefined,
    watch: open,
    formatUnits: currency?.decimals,
  })

  const token = tokenData?.token as Token
  const collection = collectionData?.collection

  const { data, loading } = useQuery(GET_ORDER_BY_HASH, {
    variables: { hash: orderId as string },
    skip: !orderId
  })

  const listing = data?.order as Order

  const currencyOptions = useCurrencyOptions(listing)

  const buyToken = useCallback(async () => {
    try {
      if (!sdk.signer) {
        const error = new Error('Missing a signer')
        setTransactionError(error)
        throw error
      }
      
      if (!token || !collection) {
        const error = new Error('Missing tokenId or collectionId')
        setTransactionError(error)
        throw error
      }

      setBuyStep(BuyStep.Approving)
      if (currency?.contract !== constants.AddressZero) {
        const erc20Allowance = await allowance(
          provider, 
          listing.currencyAddress,
          address as string,
          sdk.addresses.EXCHANGE
        )
        
        if (BigNumber.from(listing.price).gt(erc20Allowance.toString())) {
          setSteps([RequestUserStep.APPROVAL_ERC20, RequestUserStep.BUY])
          setRequestUserStep(RequestUserStep.APPROVAL_ERC20)
          const tx = await sdk.approveErc20(listing.currencyAddress)
          await tx.wait() 
        } else {
          setSteps([RequestUserStep.BUY])
        }
      }

      setRequestUserStep(RequestUserStep.BUY)
  
      const maker: MakerOrder = {
        isOrderAsk: listing.isOrderAsk,
        signer: listing.signer,
        collection: listing.collectionAddress,
        price: listing.price,
        tokenId: listing.tokenId as string,
        amount: listing.amount,
        strategy: listing.strategy,
        currency: listing.currencyAddress,
        nonce: listing.nonce,
        startTime: listing.startTime,
        endTime: listing.endTime,
        minPercentageToAsk: listing.minPercentageToAsk,
        params: listing.params
      };
  
      const taker = sdk.createTaker(maker, {
        taker: address as string
      })
  
      let tx: ContractTransaction | null = null;
      if (currency?.contract === constants.AddressZero) {
        tx = await sdk.executeOrder(maker, taker, listing.signature, { value: listing.price }).call()
      } else {
        tx = await sdk.executeOrder(maker, taker, listing.signature).call()
      }
      setTxHash(tx.hash)
      await tx.wait()
  
      setBuyStep(BuyStep.Complete)
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
      setBuyStep(BuyStep.Checkout)
      setRequestUserStep(RequestUserStep.APPROVAL_ERC20)
      setTxHash(undefined);
      console.log(error)
    }
  }, [sdk, token, collection, listing, address, provider, currency])

  useEffect(() => {
    if (!listing && !loading && token) {
      setBuyStep(BuyStep.Unavailable)
      setCurrency(undefined)
    }
  }, [
    listing,
    loading,
    token,
    currencyOptions
  ])

  useEffect(() => {
    if (listing) {
      const currency = currencyOptions.find(currency => currency.contract === listing.currencyAddress)
      setCurrency(currency)
    } 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing])

  useEffect(() => {
    const totalBalance = currencyBalance?.value

    if (!totalBalance) {
      setHasEnoughCurrency(false)
    } else if (totalBalance.lt(utils.parseUnits(listing?.price || "0", 0))) {
      setHasEnoughCurrency(false)
    } else {
      setHasEnoughCurrency(true)
    }
    
  }, [currencyBalance, currency, ethBalance, listing?.price])

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
        buyStep,
        transactionError,
        hasEnoughCurrency,
        address: address,
        blockExplorerBaseUrl,
        setBuyStep,
        buyToken,
        quantity: 1,
        requestUserStep,
        txHash,
        ethBalance,
        currencyBalance,
        steps,
        currencyOptions,
        setCurrency
      })}
    </>
  )
}
