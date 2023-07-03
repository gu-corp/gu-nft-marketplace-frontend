import { Button } from 'components/primitives'
import { cloneElement, ComponentProps, FC, useContext } from 'react'
import { CSS } from '@stitches/react'
import { SWRResponse } from 'swr'
import { useAccount, useNetwork, useSigner, useSwitchNetwork } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ToastContext } from 'context/ToastContextProvider'
import { useDefaultChain, useIsInTheWrongNetwork } from 'hooks'
import { BidModal } from 'components/@reservoir0x/components/Modal/Bid/BidModal'
import { BidStep } from 'components/@reservoir0x/components/Modal/Bid/BidModalRenderer'

type Props = {
  tokenId?: string | undefined
  collectionId?: string | undefined
  disabled?: boolean
  openState?: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
  buttonCss?: CSS
  buttonProps?: ComponentProps<typeof Button>
  mutate?: () => void
}

const Bid: FC<Props> = ({
  tokenId,
  collectionId,
  disabled,
  openState,
  buttonCss,
  buttonProps,
  mutate,
}) => {
  const { isDisconnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { addToast } = useContext(ToastContext)
  const defaultChain = useDefaultChain()
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: defaultChain.id,
  })

  const { data: signer } = useSigner()
  const { chain: activeChain } = useNetwork()

  const isInTheWrongNetwork = useIsInTheWrongNetwork()

  const trigger = (
    <Button css={buttonCss} disabled={disabled} {...buttonProps} color="gray4">
      Make Offer
    </Button>
  )

  if (isDisconnected || isInTheWrongNetwork) {
    return cloneElement(trigger, {
      onClick: async () => {
        if (switchNetworkAsync && activeChain) {
          const chain = await switchNetworkAsync(defaultChain.id)
          if (chain.id !== defaultChain.id) {
            return false
          }
        }

        if (!signer) {
          openConnectModal?.()
        }
      },
    })
  } else
    return (
      <BidModal
        tokenId={tokenId}
        collectionId={collectionId}
        trigger={trigger}
        openState={openState}
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
    )
}

export default Bid
