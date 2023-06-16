import { Button } from 'components/primitives'
import { useRouter } from 'next/router'
import { ComponentProps, FC, useContext, useEffect, useState } from 'react'
import { useAccount, useNetwork, useSigner, useSwitchNetwork } from 'wagmi'
import { CSS } from '@stitches/react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ToastContext } from 'context/ToastContextProvider'
import { useMarketplaceChain } from 'hooks'
import { QueryResult } from '@apollo/client'
import { Collection } from '__generated__/graphql'
import { BidModal } from 'components/@reservoir0x/components/Modal/Bid/BidModal'
import { BidStep } from 'components/@reservoir0x/components/Modal/Bid/BidModalRenderer'

type Props = {
  collection: Collection
  mutate?: QueryResult["refetch"]
  buttonCss?: CSS
  buttonProps?: ComponentProps<typeof Button>
}

const CollectionOffer: FC<Props> = ({
  collection,
  mutate,
  buttonCss,
  buttonProps = {},
}) => {
  const marketplaceChain = useMarketplaceChain()
  const { data: signer } = useSigner()
  const { chain: activeChain } = useNetwork()
  const { isDisconnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { addToast } = useContext(ToastContext)
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: marketplaceChain.id,
  })
  const isInTheWrongNetwork = Boolean(
    signer && activeChain?.id !== marketplaceChain.id
  )
  if (isDisconnected || isInTheWrongNetwork) {
    return (
      <Button
        css={buttonCss}
        disabled={isInTheWrongNetwork && !switchNetworkAsync}
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
        Collection Offer
      </Button>
    )
  } else
    return (
      <>
        <BidModal
          collectionId={collection?.id}
          trigger={
            <Button css={buttonCss} {...buttonProps}>
              Collection Offer
            </Button>
          }
          onClose={(currentStep) => {
            if (mutate && currentStep == BidStep.Complete) mutate()
          }}
          onBidError={(error) => {
            if (error) {
              if (
                (error as any).code &&
                (error as any).code === 4001
              ) {
                addToast?.({
                  title: 'User canceled transaction',
                  description: 'You have canceled the transaction.',
                })
                return
              }
            }
            addToast?.({
              title: 'Could not place bid',
              description: 'The transaction was not completed.',
            })
          }}
        />
      </>
    )
}

export default CollectionOffer
