import React, { ComponentProps, FC, useContext, useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from 'components/primitives'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { CSS } from '@stitches/react'
import { useMarketplaceChain } from 'hooks'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMinus, faShoppingCart } from '@fortawesome/free-solid-svg-icons'
import { ToastContext } from 'context/ToastContextProvider'
import { ConfirmationModal } from 'components/common/ConfirmationModal'
import { Token } from '__generated__/graphql'
import useCart from 'components/@reservoir0x/hooks/useCart'

type Props = {
  token?: Token
  buttonCss?: CSS
  buttonProps?: ComponentProps<typeof Button>
}

const AddToCart: FC<Props> = ({ token, buttonCss, buttonProps }) => {
  const { addToast } = useContext(ToastContext)
  const { data: items, add, remove, clear } = useCart((cart) => cart.items)
  const { isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const marketplaceChain = useMarketplaceChain()
  const [confirmationOpen, setConfirmationOpen] = useState<boolean>(false)

  if (
    !token ||
    !token.asks?.[0]
  ) {
    return null
  }

  let tokenKey = token.id
  
  const isInCart = items.find(
    (item) => `${item.token.collection}:${item.token.id}` === tokenKey
  )

  return (
    <>
      <Button
        css={buttonCss}
        color="primary"
        onClick={async () => {
          if (!isConnected) {
            openConnectModal?.()
          }

          if (isInCart) {
            remove([tokenKey])
          }
          else {
            add([token]).then(() => {
              addToast?.({
                title: 'Added to cart',
              })
            })
          }
        }}
        {...buttonProps}
      >
        <FontAwesomeIcon
          icon={isInCart ? faMinus : faShoppingCart}
          width="16"
          height="16"
        />
      </Button>
      <ConfirmationModal
        title="Could not add item to cart"
        message="Your cart has items from a different chain than the item you are trying to add. Adding this item will clear your existing cart and start a new one."
        open={confirmationOpen}
        onOpenChange={setConfirmationOpen}
        onConfirmed={(confirmed) => {
          if (confirmed) {
            clear()
            add([token])
          }
        }}
      />
    </>
  )
}

export default AddToCart
