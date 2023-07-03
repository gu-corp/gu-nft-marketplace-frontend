import React, { FC, ReactNode, useEffect, useMemo, useState } from 'react'
import { Address, useAccount, useBalance, useNetwork } from 'wagmi'
import { BigNumber, constants, utils } from 'ethers'
import { toFixed } from '../../lib/numbers'
import {
  Cart,
  CheckoutStatus,
  CheckoutTransactionError,
} from '../../context/CartProvider'
import { Currency } from 'types/currency'
import useCart from 'components/@reservoir0x/hooks/useCart'

type ChildrenProps = {
  loading: boolean
  currency?: Currency
  cartCurrencyConverted?: Boolean
  totalPrice: string
  referrerFee?: number
  balance?: BigNumber
  hasEnoughCurrency: boolean
  items: Cart['items']
  unavailableItems: Cart['items']
  transaction?: Cart['transaction']
  blockExplorerBaseUrl: string
  checkout: ReturnType<typeof useCart>['checkout']
  clear: ReturnType<typeof useCart>['clear']
  remove: ReturnType<typeof useCart>['remove']
  add: ReturnType<typeof useCart>['add']
  validate: ReturnType<typeof useCart>['validate'],
  usdPrice: number
}

type Props = {
  open: boolean
  children: (props: ChildrenProps) => ReactNode
}

export const CartPopoverRenderer: FC<Props> = ({ open, children }) => {
  const { chain } = useNetwork()

  const [hasEnoughCurrency, setHasEnoughCurrency] = useState(true)
  const { data, clear, clearTransaction, validate, remove, add, checkout } =
    useCart((cart) => cart)
  const {
    isValidating,
    totalPrice,
    items,
    currency,
    transaction,
    referrerFee,
  } = data

  const usdPrice = 0

  const blockExplorerBaseUrl =
  chain?.blockExplorers?.default?.url || 'https://etherscan.io'
  
  useEffect(() => {
    if (open) {
      validate()
    } else if (
      transaction?.status === CheckoutStatus.Complete ||
      transaction?.error
    ) {
      clearTransaction()
    }
  }, [open])

  const unavailableItems = useMemo(
    () => items.filter((item) => !item.price),
    [items]
  )
  
  const { address } = useAccount()
  const { data: balance } = useBalance({
    address: address,
    token:
      currency?.contract !== constants.AddressZero
        ? (currency?.contract as Address)
        : undefined,
    watch: open,
    formatUnits: currency?.decimals,
  })

  useEffect(() => {
    if (balance) {
      if (!balance.value) {
        setHasEnoughCurrency(false)
      } else if (
        balance.value.lt(totalPrice)
      ) {
        setHasEnoughCurrency(false)
      } else {
        setHasEnoughCurrency(true)
      }
    }
  }, [totalPrice, balance, currency])

  useEffect(() => {
    if (
      hasEnoughCurrency &&
      transaction?.errorType === CheckoutTransactionError.InsufficientBalance
    ) {
      setHasEnoughCurrency(false)
    }
  }, [transaction])

  return (
    <>
      {children({
        loading: isValidating,
        items,
        unavailableItems,
        currency,
        totalPrice,
        referrerFee,
        usdPrice,
        hasEnoughCurrency,
        balance: balance?.value,
        transaction,
        blockExplorerBaseUrl,
        checkout,
        clear,
        remove,
        add,
        validate,
      })}
    </>
  )
}

export default CartPopoverRenderer
