import {
  Box,
  Flex,
  Text,
  Button,
  Anchor,
  FormatCryptoCurrency,
  FormatCurrency,
  Loader,
} from 'components/primitives'
import Popover from 'components/primitives/Popover'
import React, {
  ComponentPropsWithRef,
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClose,
  faCube,
  faRefresh,
  faShoppingCart,
} from '@fortawesome/free-solid-svg-icons'
import CartItem from './CartItem'
import CartToast from './CartToast'
import CartPopoverRenderer from './CartPopoverRenderer'
import {
  CheckoutStatus,
  CheckoutTransactionError,
} from '../../context/CartProvider'
import { useAccount } from 'wagmi'
import useFallbackState from 'components/@reservoir0x/hooks/useFallbackState'
import { styled, keyframes } from 'stitches.config'

const scaleUp = keyframes({
  '0%': { opacity: 0, transform: 'scale(0.9) translateY(-10px)' },
  '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
})

const scaleDown = keyframes({
  '0%': { opacity: 1, transform: 'scale(1) translateY(0)' },
  '100%': { opacity: 0, transform: 'scale(0.9) translateY(-10px)' },
})

type Props = {
  trigger: ReactNode
  side?: ComponentPropsWithRef<typeof Popover>['side']
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  tokenUrl?: string
  onConnectWallet: () => void
}

const CONTENT_OFFSET = 8

export function CartPopover({
  trigger,
  side,
  openState,
  onConnectWallet,
}: Props): ReactElement {
  const [popoverTrigger, setPopoverTrigger] =
    useState<HTMLButtonElement | null>(null)
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )
  const [displayPendingTransaction, setDisplayPendingTransaction] =
    useState(false)
  const [purchaseComplete, setPurchaseComplete] = useState(false)
  const { isConnected } = useAccount()

  useEffect(() => {
    if (!open) {
      setDisplayPendingTransaction(false)
      setPurchaseComplete(false)
    }
  }, [open])

  const triggerBottom = useMemo(
    () =>
      (popoverTrigger?.offsetTop || 0) +
      (popoverTrigger?.offsetHeight || 0) +
      CONTENT_OFFSET,
    [popoverTrigger?.offsetHeight, popoverTrigger?.offsetTop]
  )

  return (
    <CartPopoverRenderer open={open}>
      {({
        loading,
        items,
        unavailableItems,
        totalPrice,
        referrerFee,
        usdPrice,
        hasEnoughCurrency,
        balance,
        currency,
        cartCurrencyConverted,
        transaction,
        blockExplorerBaseUrl,
        remove,
        clear,
        checkout,
      }) => {
        // https://unsplash.com/blog/calling-react-hooks-conditionally-dynamically-using-render-props/#waitdoesntthisbreaktherulesofhooks
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (transaction?.status === CheckoutStatus.Complete) {
            setDisplayPendingTransaction(false)
            setPurchaseComplete(true)
          }
        }, [transaction?.status])

        const unavailableItemsSubject =
          unavailableItems.length > 1 ? 'items' : 'item'

        const isCartEmpty = items.length === 0
        const hasValidItems = items.length > unavailableItems.length

        return (
          <Popover.Root modal={true} open={open} onOpenChange={setOpen}>
            <Popover.Trigger asChild ref={setPopoverTrigger}>
              {trigger}
            </Popover.Trigger>
            <Popover.Content
              side={side}
              sideOffset={CONTENT_OFFSET}
              css={{
                display: 'flex',
                flexDirection: 'column',
                zIndex: 1001,
                transformOrigin:
                  'var(--radix-popover-content-transform-origin)',
                animation: `${open ? scaleUp : scaleDown} 0.2s ease-in-out`,
                overflowY: 'auto',
                borderRadius: '$borderRadius',
                $$shadowColor: '$colors$gray7',
                boxShadow: 'box-shadow: 0px 2px 16px $$shadowColor',
                border: '1px solid $borderColor',
                p: 24,
                minHeight: 500,
                width: 395,
                maxHeight: `calc(100vh - ${
                  triggerBottom || 0
                }px - (25px * 2) - 10px)`,
                backgroundColor: '$contentBackground',
                boxSizing: 'border-box',
                '@media(max-width: 520px)': {
                  height: `calc(100vh - ${triggerBottom || 0}px - (25px * 2))`,
                  width: '100vw',
                  minHeight: '100%',
                },
              }}
            >
              {loading && (
                <Loader
                  css={{
                    backgroundColor: '$contentBackground',
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.6,
                    zIndex: 10000,
                  }}
                />
              )}
              <Flex align="center" css={{ mb: '$4' }}>
                <Text style="h6">Cart</Text>
                {!isCartEmpty && (
                  <Flex
                    align="center"
                    justify="center"
                    css={{
                      background: '$accentBgActive',
                      height: 20,
                      width: 20,
                      borderRadius: '99999px',
                      ml: '$2',
                    }}
                  >
                    <Text style="subtitle2">{items.length}</Text>
                  </Flex>
                )}
                {!isCartEmpty && (
                  <Text
                    style="subtitle2"
                    color="accent"
                    css={{
                      cursor: 'pointer',
                      ml: 24,
                      '&:hover': { color: '$accentSolidHover' },
                    }}
                    onClick={clear}
                  >
                    Clear All
                  </Text>
                )}
                <Button
                  color="ghost"
                  css={{ color: '$neutralSolid', ml: 'auto', justifyContent: 'center' }}
                  onClick={() => {
                    setOpen(false)
                  }}
                >
                  <FontAwesomeIcon icon={faClose} width="16" height="16" />
                </Button>
              </Flex>
              {cartCurrencyConverted && (
                <CartToast
                  kind="warning"
                  message={`Mixed currency items are only available to be checked out with ${currency?.symbol}`}
                />
              )}
              {/* {flaggedItems.length > 0 && (
                <CartToast
                  kind="warning"
                  message={`${flaggedItems.length} ${flaggedItemsSubject} not tradeable on OpenSea`}
                  link={
                    <Text
                      color="accent"
                      style="subtitle2"
                      css={{ ml: 'auto', mt: 3, cursor: 'pointer' }}
                      onClick={(e) => {
                        e.preventDefault()
                        remove(
                          flaggedItems.map(
                            (item) => `${item.token.collection}:${item.token.id}`
                          )
                        )
                      }}
                    >
                      Remove {flaggedItemsSubject}
                    </Text>
                  }
                />
              )} */}
              {unavailableItems.length > 0 && (
                <CartToast
                  kind="error"
                  message={`${unavailableItems.length} ${unavailableItemsSubject} no longer available`}
                  link={
                    <Text
                      color="accent"
                      style="subtitle2"
                      css={{ ml: 'auto', mt: 3, cursor: 'pointer' }}
                      onClick={(e) => {
                        e.preventDefault()
                        remove(
                          unavailableItems.map(
                            (item) => `${item.token.collection}:${item.token.id}`
                          )
                        )
                      }}
                    >
                      Remove {unavailableItemsSubject}
                    </Text>
                  }
                />
              )}
              {/* {priceChangeItems.length > 0 && (
                <CartToast
                  kind="warning"
                  message={`${priceChangeItems.length} ${priceChangeItemsSubject} updated`}
                />
              )} */}
              {transaction?.error &&
                transaction.errorType !==
                  CheckoutTransactionError.UserDenied && (
                  <CartToast kind="error" message={transaction.error.message} />
                )}
              {purchaseComplete && (
                <CartToast
                  message={`Transaction Complete`}
                  link={
                    <Anchor
                      href={`${blockExplorerBaseUrl}/tx/${transaction?.txHash}`}
                      target="_blank"
                      css={{ ml: 'auto', fontSize: 12, mt: 2 }}
                      weight="medium"
                      color="primary"
                    >
                      Etherscan
                    </Anchor>
                  }
                />
              )}
              {!isCartEmpty && (
                <Flex
                  direction="column"
                  css={{ gap: '$4', mb: '$4', overflowY: 'auto', mx: -24 }}
                >
                  {items.map((item) => (
                    <CartItem
                      key={`${item.token.collection}:${item.token.id}`}
                      item={item}
                      usdConversion={usdPrice}
                    />
                  ))}
                </Flex>
              )}
              {isCartEmpty &&
                !(
                  displayPendingTransaction &&
                  transaction?.status === CheckoutStatus.Finalizing
                ) && (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    css={{ color: '$neutralBorderHover', flex: 1, gap: '$5' }}
                  >
                    <FontAwesomeIcon
                      icon={faShoppingCart}
                      width="30"
                      height="30"
                      style={{ height: 30 }}
                    />
                    <Text style="body2" color="subtle">
                      No items in your cart
                    </Text>
                  </Flex>
                )}
              {displayPendingTransaction &&
                transaction?.status === CheckoutStatus.Finalizing && (
                  <Flex
                    direction="column"
                    align="center"
                    justify="center"
                    css={{ color: '$neutralBorderHover', flex: 1, gap: '$5' }}
                  >
                    <Text style="h6">Finalizing on blockchain</Text>
                    <FontAwesomeIcon icon={faCube} width="24" />
                    <Anchor
                      href={`${blockExplorerBaseUrl}/tx/${transaction?.txHash}`}
                      color="primary"
                      weight="medium"
                      target="_blank"
                      css={{ fontSize: 12 }}
                    >
                      View on Etherscan
                    </Anchor>
                  </Flex>
                )}
              <Flex direction="column" css={{ mt: 'auto', pb: 10 }}>
                {!isCartEmpty && referrerFee ? (
                  <Flex css={{ mb: '$4' }}>
                    <Text style="subtitle2">Referrer Fee</Text>
                    <Flex
                      direction="column"
                      justify="center"
                      css={{ ml: 'auto', gap: '$1', '> div': { ml: 'auto' } }}
                    >
                      <FormatCryptoCurrency
                        textStyle="subtitle2"
                        amount={referrerFee}
                        address={currency?.contract}
                        decimals={currency?.decimals}
                        logoHeight={12}
                      />
                      {usdPrice && (
                        <FormatCurrency
                          amount={usdPrice * referrerFee}
                          style="subtitle2"
                          color="subtle"
                          css={{ textAlign: 'end' }}
                        />
                      )}
                    </Flex>
                  </Flex>
                ) : null}
                {!isCartEmpty && (
                  <Flex css={{ mb: 28 }}>
                    <Text style="h6">Total</Text>
                    <Flex
                      direction="column"
                      justify="center"
                      css={{ ml: 'auto', gap: '$1', '> div': { ml: 'auto' } }}
                    >
                      <FormatCryptoCurrency
                        textStyle="h6"
                        amount={totalPrice}
                        address={currency?.contract}
                        decimals={currency?.decimals}
                        logoHeight={18}
                      />
                      {/* {usdPrice && (
                        <FormatCurrency
                          amount={usdPrice * totalPrice}
                          style="subtitle2"
                          color="subtle"
                          css={{ textAlign: 'end' }}
                        />
                      )} */}
                    </Flex>
                  </Flex>
                )}

                {displayPendingTransaction &&
                  transaction?.status === CheckoutStatus.Approving && (
                    <Text
                      style="body2"
                      color="subtle"
                      css={{ mb: '$2', textAlign: 'center' }}
                    >
                      Please confirm purchase in your wallet{' '}
                    </Text>
                  )}
                {!hasEnoughCurrency && isConnected && (
                  <Flex
                    align="center"
                    justify="center"
                    css={{ mb: '$2', gap: '$2' }}
                  >
                    <Text style="body2" color="error">
                      Insufficient balance
                    </Text>
                    <FormatCryptoCurrency
                      textStyle="body2"
                      amount={balance}
                      address={currency?.contract}
                      decimals={currency?.decimals}
                      logoHeight={10}
                    />
                  </Flex>
                )}
                {isCartEmpty && !displayPendingTransaction && (
                  <Button disabled={true} css={{ justifyContent: 'center' }}>Select Items to Buy</Button>
                )}
                {!isCartEmpty &&
                  hasValidItems &&
                  (transaction?.status === CheckoutStatus.Idle ||
                    !displayPendingTransaction) && (
                  <Button
                    css={{ justifyContent: 'center' }}
                    // TO-DO: Not support purchase many now
                    // disabled={!hasEnoughCurrency && isConnected}
                    disabled={true}
                    onClick={async () => {
                      if (!isConnected) {
                        onConnectWallet?.()
                      } else {
                        checkout()
                          .then(() => {
                            setDisplayPendingTransaction(true)
                          })
                          .catch((e: any) => {
                            console.error(e)
                            setDisplayPendingTransaction(false)
                          })
                      }
                    }}
                    >
                      {hasEnoughCurrency || !isConnected
                        ? 'Purchase'
                        : 'Add Funds to Purchase'}
                    </Button>
                  )}
                {!isCartEmpty && !hasValidItems && (
                  <Button
                    color="secondary"
                    onClick={() => {
                      clear()
                    }}
                  >
                    <FontAwesomeIcon icon={faRefresh} width="16" height="16" />
                    Refresh Cart
                  </Button>
                )}
                {displayPendingTransaction &&
                  transaction?.status === CheckoutStatus.Approving && (
                    <Button disabled={true}>
                      <Loader />
                      Waiting for Approval...
                    </Button>
                  )}
                {displayPendingTransaction &&
                  transaction?.status === CheckoutStatus.Finalizing && (
                    <Button disabled={true}>
                      <Loader />
                      Waiting to be Validated...
                    </Button>
                  )}
              </Flex>
            </Popover.Content>
            {open && (
              <Box
                css={{
                  backgroundColor: '$overlayBackground',
                  position: 'fixed',
                  inset: 0,
                  zIndex: 1000,
                }}
              ></Box>
            )}
          </Popover.Root>
        )
      }}
    </CartPopoverRenderer>
  )
}

CartPopover.Custom = CartPopoverRenderer

export default CartPopover
