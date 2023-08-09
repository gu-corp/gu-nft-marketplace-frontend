import { ConnectButton } from '@rainbow-me/rainbowkit'
import Box from 'components/primitives/Box'
import Button from 'components/primitives/Button'
import useTrans from 'hooks/useTrans'
import { FC } from 'react'

type Props = {}

export const ConnectWalletButton: FC<Props> = () => {
  const trans = useTrans()

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        return (
          <Box
            style={{
              flex: '1',
              display: 'flex',
              justifyContent: 'flex',
            }}
          >
            {(() => {
              if (!mounted || !account || !chain) {
                return (
                  <Button
                    css={{ flex: 1, justifyContent: 'center' }}
                    corners="rounded"
                    onClick={openConnectModal}
                    type="button"
                  >
                    {trans.nav.connect_wallet}
                  </Button>
                )
              }
            })()}
          </Box>
        )
      }}
    </ConnectButton.Custom>
  )
}
