import React, { ReactElement, Dispatch, SetStateAction, useEffect } from 'react'
import { Flex, Text, Box, Button, Loader, Anchor } from 'components/primitives'
import { CancelBidModalRenderer, CancelStep } from './CancelBidModalRenderer'
import { Modal } from '../Modal'
import { useNetwork } from 'wagmi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleExclamation,
  faGasPump,
} from '@fortawesome/free-solid-svg-icons'
import useTimeSince from '../../../hooks/useTimeSince'
import useFallbackState from '../../../hooks/useFallbackState'
import { parseUnits } from '@ethersproject/units'
import currencyOptions from '../../../lib/defaultCurrencyOptions'
import TokenPrimitive from '../TokenPrimitive'
import Progress from '../Progress'
import { ethers } from 'ethers'

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  bidId?: string
  onClose?: (currentStep: CancelStep) => void
  onCancelComplete?: () => void
  onCancelError?: (data: any) => void
}

export function CancelBidModal({
  openState,
  bidId,
  trigger,
  onClose,
  onCancelComplete,
  onCancelError,
}: Props): ReactElement {
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )
  const { chain: activeChain } = useNetwork()

  return (
    <CancelBidModalRenderer
      bidId={bidId}
      open={open}
    >
      {({
        loading,
        bid,
        token,
        txHash,
        cancelStep,
        transactionError,
        totalUsd,
        blockExplorerBaseUrl,
        cancelOrder,
        currency,
        collection
      }) => {
        const image = token?.image as string

        const expires = useTimeSince(
          bid?.endTime ? Number(bid.endTime) : 0
        )

        useEffect(() => {
          if (cancelStep === CancelStep.Complete && onCancelComplete) {
            onCancelComplete()
          }
        }, [cancelStep])

        useEffect(() => {
          if (transactionError && onCancelError) {
            onCancelError(transactionError)
          }
        }, [transactionError])

        const isBidAvailable = bid && !loading

        return (
          <Modal
            trigger={trigger}
            title="Cancel Offer"
            open={open}
            onOpenChange={(open) => {
              if (!open && onClose) {
                onClose(cancelStep)
              }
              setOpen(open)
            }}
            loading={loading}
          >
            {!isBidAvailable && !loading && (
              <Flex
                direction="column"
                justify="center"
                css={{ px: '$4', py: '$6' }}
              >
                <Text style="h6" css={{ textAlign: 'center' }}>
                  Selected bid is no longer available
                </Text>
              </Flex>
            )}
            {isBidAvailable && cancelStep === CancelStep.Cancel && (
              <Flex direction="column">
                {transactionError && (
                  <Flex
                    css={{
                      color: '$errorAccent',
                      p: '$4',
                      gap: '$2',
                      background: '$wellBackground',
                    }}
                    align="center"
                  >
                    <FontAwesomeIcon
                      icon={faCircleExclamation}
                      width={16}
                      height={16}
                    />
                    <Text style="body2" color="errorLight">
                      {transactionError.message}
                    </Text>
                  </Flex>
                )}
                <Box css={{ p: '$4', borderBottom: '1px solid $borderColor' }}>
                  <TokenPrimitive
                    img={image}
                    name={token?.tokenId}
                    price={parseUnits(bid?.price, 0).toString()}
                    usdPrice={totalUsd}
                    collection={collection?.name || ''}
                    currencyContract={currency?.contract}
                    currencyDecimals={currency?.decimals}
                    expires={expires}
                    priceSubtitle="Offer"
                  />
                </Box>
                <Text
                  style="body2"
                  color="subtle"
                  css={{ mt: '$3', mr: '$3', ml: '$3', textAlign: 'center' }}
                >
                  This will cancel your offer for free. You will be prompted to confirm this cancellation from your wallet.
                </Text>
                <Button onClick={cancelOrder} css={{ m: '$4', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faGasPump} width="16" height="16" />
                  Continue to Cancel
                </Button>
              </Flex>
            )}
            {cancelStep === CancelStep.Approving && (
              <Flex direction="column">
                <Box css={{ p: '$4', borderBottom: '1px solid $borderColor' }}>
                  <TokenPrimitive
                    img={image}
                    name={token?.tokenId}
                    price={parseUnits(bid?.price || "0", 0).toString()}
                    usdPrice={totalUsd}
                    collection={collection?.name || ''}
                    currencyContract={currency?.contract}
                    currencyDecimals={currency?.decimals}
                    expires={expires}
                    priceSubtitle="Offer"
                  />
                </Box>
                {!txHash && <Loader css={{ height: 206 }} />}
                {txHash && (
                  <>
                    <Progress
                      title={
                        txHash
                          ? 'Finalizing on blockchain'
                          : 'Confirm cancelation in your wallet'
                      }
                      txHash={txHash}
                      blockExplorerBaseUrl={`${blockExplorerBaseUrl}/tx/${txHash}`}
                    />
                  </>
                )}
                <Button disabled={true} css={{ m: '$4', justifyContent: "center" }}>
                  <Loader />
                  {txHash
                    ? 'Waiting for transaction to be validated'
                    : 'Waiting for approval...'}
                </Button>
              </Flex>
            )}
            {cancelStep === CancelStep.Complete && (
              <Flex direction="column">
                <Flex
                  css={{
                    p: '$4',
                    py: '$5',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Text style="h5" css={{ mb: '$2' }}>
                    Offer Canceled!
                  </Text>
                  <Text style="body2" color="subtle" css={{ mb: 24 }}>
                    <>
                      Your{' '}
                      <Text style="body2" color="accent">
                        {collection?.name}
                      </Text>{' '}
                      offer for{' '}
                      <Text style="body2" color="accent">
                        {collection?.name}{' '}
                      </Text>
                      at {ethers.utils.formatEther(bid?.price as string)}{' '}
                      {currency?.symbol} has been canceled.
                    </>
                  </Text>

                  <Anchor
                    color="primary"
                    weight="medium"
                    css={{ fontSize: 12 }}
                    href={`${blockExplorerBaseUrl}/tx/${txHash}`}
                    target="_blank"
                  >
                    View on{' '}
                    {activeChain?.blockExplorers?.default.name || 'Etherscan'}
                  </Anchor>
                </Flex>
                <Button
                  onClick={() => {
                    setOpen(false)
                  }}
                  css={{ m: '$4', justifyContent: 'center' }}
                >
                  Close
                </Button>
              </Flex>
            )}
          </Modal>
        )
      }}
    </CancelBidModalRenderer>
  )
}

CancelBidModal.Custom = CancelBidModalRenderer
