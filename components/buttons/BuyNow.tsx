import React, { ComponentProps, FC } from 'react'
import { SWRResponse } from 'swr'
import { useNetwork, useSigner } from 'wagmi'
import { useSwitchNetwork } from 'wagmi'
import { Button } from 'components/primitives'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { CSS } from '@stitches/react'
import { useMarketplaceChain } from 'hooks'
import { BuyStep } from 'components/@reservoir0x/components/Modal/Buy/BuyModalRenderer'
import { BuyModal } from 'components/@reservoir0x/components/Modal/Buy/BuyModal'
import { Token } from '__generated__/graphql'

type Props = {
  token?: Token
  orderId?: string
  buttonCss?: CSS
  buttonProps?: ComponentProps<typeof Button>
  mutate?: () => void
}

const BuyNow: FC<Props> = ({ token, orderId, mutate, buttonCss, buttonProps = {} }) => {
  const { data: signer } = useSigner()
  const { openConnectModal } = useConnectModal()
  const { chain: activeChain } = useNetwork()
  const marketplaceChain = useMarketplaceChain()
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: marketplaceChain.id,
  })
  const isInTheWrongNetwork = Boolean(
    signer && activeChain?.id !== marketplaceChain.id
  )

  const trigger = (
    <Button css={buttonCss} color="primary" {...buttonProps}>
      Buy Now
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
          const chain = await switchNetworkAsync(marketplaceChain.id)
          if (chain.id !== marketplaceChain.id) {
            return false
          }
        }

        if (!signer) {
          openConnectModal?.()
        }
      }}
      {...buttonProps}
    >
      Buy Now
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
