import React, { ComponentProps, FC } from 'react'
import { useSigner } from 'wagmi'
import { useSwitchNetwork } from 'wagmi'
import { Button } from 'components/primitives'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { CSS } from '@stitches/react'
import { useDefaultChain, useIsInTheWrongNetwork } from 'hooks'
import { BuyStep } from 'components/@reservoir0x/components/Modal/Buy/BuyModalRenderer'
import { BuyModal } from 'components/@reservoir0x/components/Modal/Buy/BuyModal'
import { Token } from '__generated__/graphql'
import useTrans from 'hooks/useTrans'

type Props = {
  token?: Token
  orderId?: string
  buttonCss?: CSS
  buttonProps?: ComponentProps<typeof Button>
  mutate?: () => void
}

const BuyNow: FC<Props> = ({ token, orderId, mutate, buttonCss, buttonProps = {} }) => {
  const trans = useTrans()
  const { data: signer } = useSigner()
  const { openConnectModal } = useConnectModal()
  const defaultChain = useDefaultChain()
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: defaultChain.id,
  })
  const isInTheWrongNetwork = useIsInTheWrongNetwork()

  const trigger = (
    <Button css={buttonCss} color="primary" {...buttonProps}>
      {trans.collection.buy_now}
    </Button>
  )
  const canBuy =
    signer &&
    token?.tokenId &&
    token?.collection &&
    !isInTheWrongNetwork

  return !canBuy ? (
    <Button
      css={buttonCss}
      aria-haspopup="dialog"
      color="primary"
      onClick={async () => {
        if (isInTheWrongNetwork && switchNetworkAsync) {
          const chain = await switchNetworkAsync(defaultChain.id)
          if (chain.id !== defaultChain.id) {
            return false
          }
        }

        if (!signer) {
          openConnectModal?.()
        }
      }}
      {...buttonProps}
    >
      {trans.collection.buy_now}
    </Button>
  ) : (
    <BuyModal
      trigger={trigger}
      tokenId={token?.tokenId}
      orderId={orderId}
      collectionId={token?.collection}
      onClose={(currentStep) => {
        if (mutate && currentStep == BuyStep.Complete) mutate()
      }}
    />
  )
}

export default BuyNow
