import React, { ComponentProps, FC } from 'react'
import { SWRResponse } from 'swr'
import { useNetwork, useSigner } from 'wagmi'
import { useSwitchNetwork } from 'wagmi'
import { Button } from 'components/primitives'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { CSS } from '@stitches/react'
import { useMarketplaceChain } from 'hooks'
import { Token } from 'types/workaround'
import { BuyModal } from 'components/@reservoir0x/components/Modal/Buy/BuyModal'
import { BuyStep } from 'components/@reservoir0x/components/Modal/Buy/BuyModalRenderer'

type Props = {
  token?: Token
  orderId?: string
  buttonCss?: CSS
  buttonProps?: ComponentProps<typeof Button>
  mutate?: SWRResponse['mutate']
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
    token?.tokenID &&
    token?.collection?.id &&
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
      tokenId={token?.tokenID}
      orderId={orderId}
      collectionId={token?.collection?.id}
      onClose={(currentStep) => {
        if (mutate && currentStep == BuyStep.Complete) mutate()
      }}
    />
  )
}

export default BuyNow
