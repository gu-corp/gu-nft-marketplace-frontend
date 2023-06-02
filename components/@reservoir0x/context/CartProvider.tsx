import React, {
  createContext,
  useCallback,
  useRef,
  ReactNode,
  useEffect,
  FC,
} from 'react'
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import { BigNumber } from 'ethers'
import { Token } from '__generated__/graphql'
import { Currency } from 'types/currency'
import currencyOptions from '../lib/defaultCurrencyOptions'

export enum CheckoutStatus {
  Idle,
  Approving,
  Finalizing,
  Complete,
}

export enum CheckoutTransactionError {
  Unknown,
  PiceMismatch,
  InsufficientBalance,
  UserDenied,
}

type CartItem = {
  token: {
    id: string
    name: string
    collection: string
    image?: string
  }
  price: string
  currency?: string
}

export type Cart = {
  totalPrice: string
  currency?: Currency
  referrer?: string
  referrerFeeBps?: number
  referrerFee?: number
  items: CartItem[]
  isValidating: boolean
  pendingTransactionId?: string
  transaction: {
    id?: string
    txHash?: string
    chain: string
    items: CartItem[]
    error?: Error
    errorType?: CheckoutTransactionError
    status: CheckoutStatus
  } | null
}

const CartStorageKey = `reservoirkit.cart`

type CartStoreProps = {
  referrer?: string
  referrerFeeBps?: number
  persist?: boolean
}

function cartStore({
  referrer,
  referrerFeeBps,
  persist = true,
}: CartStoreProps) {
  const { address } = useAccount()
  const { chains } = useNetwork()
  const { switchNetworkAsync } = useSwitchNetwork()
  const cartData = useRef<Cart>({
    totalPrice: "0",
    referrerFee: 0,
    items: [],
    isValidating: false,
    transaction: null,
  })

  const subscribers = useRef(new Set<() => void>())

  useEffect(() => {
    if (persist && typeof window !== 'undefined' && window.localStorage) {
      const storedCart = window.localStorage.getItem(CartStorageKey)
      if (storedCart) {
        const rehydratedCart: Cart = JSON.parse(storedCart)
        const currency = getCartCurrency(
          rehydratedCart.items,
        )
        const { totalPrice, referrerFee } = calculatePricing(
          rehydratedCart.items
        )
        cartData.current = {
          ...cartData.current,
          items: rehydratedCart.items,
          totalPrice,
          referrerFee,
          currency,
        }
        subscribers.current.forEach((callback) => callback())
        validate()
      }
    }
  }, [])

  useEffect(() => {
    const feeBps =
      referrer !== undefined && referrerFeeBps !== undefined
        ? referrerFeeBps
        : undefined
    const referrerAddress =
      referrer !== undefined && referrerFeeBps !== undefined
        ? referrer
        : undefined
    const currency = getCartCurrency(
      cartData.current.items
    )
    const { totalPrice, referrerFee } = calculatePricing(
      cartData.current.items,
    )
    cartData.current = {
      ...cartData.current,
      totalPrice,
      referrerFee,
      currency,
      referrer: referrerAddress,
      referrerFeeBps: feeBps,
    }
    commit()
  }, [referrer, referrerFeeBps])

  const get = useCallback(() => cartData.current, [])
  const set = useCallback((value: Partial<Cart>) => {
    cartData.current = { ...cartData.current, ...value }
    commit()
  }, [])

  const subscribe = useCallback((callback: () => void) => {
    subscribers.current.add(callback)
    return () => subscribers.current.delete(callback)
  }, [])

  const commit = useCallback(() => {
    subscribers.current.forEach((callback) => callback())
    if (persist && typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        CartStorageKey,
        JSON.stringify(cartData.current)
      )
    }
  }, [persist])

  const calculatePricing = useCallback(
    (
      items: Cart['items'],
    ) => {
      let referrerFee = 0
      let subtotal = items.reduce((total, { price }) => {
        return BigNumber.from(total).add(price).toString()
      }, "0")
      return {
        totalPrice: subtotal,
        referrerFee,
      }
    },
    []
  )

  const getCartCurrency = useCallback(
    (items: CartItem[]): Currency | undefined => {
      return currencyOptions.find(currency => currency.contract === items?.[0]?.currency)
    },
    [chains]
  )

  const convertTokenToItem = useCallback(
    (token: Token): CartItem | undefined => { 
      const ask = token.asks?.[0]

      if (!token?.tokenId || !token.collection) {
        return
      }

      return {
        token: {
          id: token.tokenId,
          name: token.name || '',
          collection: token.collection,
          image: token.image as string
        },
        price: ask?.price || "0",
        currency: ask?.currencyAddress
      }
    },
    []
  )

  const clear = useCallback(() => {
    cartData.current = {
      ...cartData.current,
      items: [],
      totalPrice: "0",
      referrerFee: 0,
    }
    commit()
  }, [commit])

  const clearTransaction = useCallback(() => {
    cartData.current = {
      ...cartData.current,
      transaction: null,
      pendingTransactionId: undefined,
    }
    commit()
  }, [commit])

  type AddToCartToken = Token

  const add = useCallback(
    async (items: AddToCartToken[]) => {
      try {
        if (cartData.current.isValidating) {
          throw 'Currently validating, adding items temporarily disabled'
        }

        const updatedItems = [...cartData.current.items]
        const currentIds = cartData.current.items.map(
          (item) => `${item.token.collection}:${item.token.id}`
        )

        const tokens: Token[] = []

        items.forEach((item) => {
          const token = item as Token
            if (
              !currentIds.includes(
                `${token.collection}:${token.tokenId}`
              )
            ) {
              tokens.push(token)
            }          
        })

        const promises: Promise<void>[] = []

        if (promises.length > 0) {
          cartData.current.isValidating = true
          subscribers.current.forEach((callback) => callback())

          await Promise.allSettled(promises)
        }

        if (tokens.length > 0) {
          tokens.forEach((token) => {
            if (
              token.asks?.[0]?.signer?.toLowerCase() !==
                address?.toLowerCase() &&
              token.owner?.toLowerCase() !== address?.toLowerCase()
            ) {
              const item = convertTokenToItem(token)
              if (item) {
                updatedItems.push(item)
              }
            }
          })
        }

        const currency = getCartCurrency(updatedItems)
        const { totalPrice, referrerFee } = calculatePricing(
          updatedItems,
        )

        cartData.current = {
          ...cartData.current,
          isValidating: false,
          items: updatedItems,
          totalPrice,
          referrerFee,
          currency,
        }

        commit()
      } catch (e) {
        if (cartData.current.isValidating) {
          cartData.current.isValidating = false
          commit()
        }
        throw e
      }
    },
    [commit, address]
  )

  /**
   * @param ids An array of order ids or token keys. Tokens should be in the format `collection:token`
   */

  const remove = useCallback((ids: string[]) => {
    if (cartData.current.isValidating) {
      console.warn('Currently validating, removing items temporarily disabled')
      return
    }
    const updatedItems: CartItem[] = []
    const removedItems: CartItem[] = []
    cartData.current.items.forEach((item) => {
      const key = `${item.token.collection}:${item.token.id}`
      if (ids.includes(key)) {
        removedItems.push(item)
      } else {
        updatedItems.push(item)
      }
    })
    const currency = getCartCurrency(
      updatedItems,
    )
    const { totalPrice, referrerFee } = calculatePricing(
      updatedItems,
    )

    cartData.current = {
      ...cartData.current,
      items: updatedItems,
      totalPrice,
      referrerFee,
      currency,
    }
    commit()
  }, [])

  const validate = useCallback(async () => {
    // To-do: disable validate now, update later
    return true
  }, [address])

  const checkout = useCallback(
    async () => {
    // To-do: disable checkout for now because lookRare contracts v1 not support match multiple
    },
    [switchNetworkAsync]
  )

  return {
    get,
    set,
    subscribe,
    add,
    remove,
    clear,
    clearTransaction,
    validate,
    checkout,
  }
}

export const CartContext = createContext<ReturnType<typeof cartStore> | null>(
  null
)

type CartProviderProps = {
  children: ReactNode
  referrer?: string
  referrerFeeBps?: number
  persist?: boolean
}

export const CartProvider: FC<CartProviderProps> = function ({
  children,
  referrer,
  referrerFeeBps,
  persist,
}) {
  return (
    <CartContext.Provider
      value={cartStore({ referrer, referrerFeeBps, persist })}
    >
      {children}
    </CartContext.Provider>
  )
}
