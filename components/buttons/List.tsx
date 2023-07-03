import { Button } from 'components/primitives'
import {
  cloneElement,
  ComponentProps,
  ComponentPropsWithoutRef,
  FC,
  ReactNode,
  useContext,
} from 'react'
import { CSS } from '@stitches/react'
import { useAccount, useNetwork, useSigner, useSwitchNetwork } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ToastContext } from 'context/ToastContextProvider'
import { useDefaultChain, useIsInTheWrongNetwork } from 'hooks'
import { ListModal } from 'components/@reservoir0x/components/Modal/List/ListModal'
import { Token } from '__generated__/graphql'
import { ListingStep } from 'components/@reservoir0x/components/Modal/List/ListModalRenderer'

type Props = {
  token?: Token
  buttonCss?: CSS
  buttonChildren?: ReactNode
  buttonProps?: ComponentProps<typeof Button>
  mutate?: () => void
}

const List: FC<Props> = ({
  token,
  buttonCss,
  buttonChildren,
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

  const contract = token?.collection
  const tokenId = token?.tokenId

  const trigger = (
    <Button css={buttonCss} color="primary" {...buttonProps}>
      {buttonChildren}
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
      <ListModal
        trigger={trigger}
        collectionId={contract}
        tokenId={tokenId}
        onListingError={(err: any) => {
          if (err?.code === 4001) {
            addToast?.({
              title: 'User canceled transaction',
              description: 'You have canceled the transaction.',
            })
            return
          }
          addToast?.({
            title: 'Could not list token',
            description: 'The transaction was not completed.',
          })
        }}
        onClose={(currentStep) => {
          if (mutate && currentStep == ListingStep.Complete) mutate()
        }}
      />
    )
}

export default List
