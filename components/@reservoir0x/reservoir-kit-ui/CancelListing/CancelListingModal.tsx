import React, { ReactElement, Dispatch, SetStateAction, useEffect } from 'react'
import { Flex, Text, Box, Button, Loader, Anchor } from 'components/primitives'
import {
  CancelListingModalRenderer,
  CancelStep,
} from './CancelListingModalRenderer'
import { Modal } from '../Modal/Modal'
import TokenPrimitive from '../Modal/TokenPrimitive'
import { useNetwork } from 'wagmi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleExclamation,
  faGasPump,
} from '@fortawesome/free-solid-svg-icons'
import useFallbackState from '../hooks/useFallbackState'
import useTimeSince from '../hooks/useTimeSince'
import Progress from '../Modal/Progress'
import currencyOptions from '../lib/defaultCurrencyOptions'
import { parseUnits } from '@ethersproject/units'

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  listingId?: string
  onClose?: (currentStep: CancelStep) => void
  onCancelComplete?: () => void
  onCancelError?: (error: Error) => void
}

export function CancelListingModal({
  openState,
  listingId,
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
    <CancelListingModalRenderer
      listingId={listingId}
      open={open}
    >
      {({
        loading,
        listing,
        token,
        txHash,
        cancelStep,
        transactionError,
        totalUsd,
        blockExplorerBaseUrl,
        cancelOrder,
        currency
      }) => {
        const expires = useTimeSince(
          listing?.endTime ? Number(listing.endTime) : 0
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

        const isListingAvailable =
          listing && !loading

        return (
          <Modal
            trigger={trigger}
            title="Cancel Listing"
            open={open}
            onOpenChange={(open) => {
              if (!open && onClose) {
                onClose(cancelStep)
              }
              setOpen(open)
            }}
            loading={loading}
          >
            {!isListingAvailable && !loading && (
              <Flex
                direction="column"
                justify="center"
                css={{ px: '$4', py: '$6' }}
              >
                <Text style="h6" css={{ textAlign: 'center' }}>
                  Selected listing is no longer available
                </Text>
              </Flex>
            )}
            {isListingAvailable && cancelStep === CancelStep.Cancel && (
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
                    img={token?.image}
                    name={token?.tokenID}
                    price={parseUnits(listing?.price, 0).toString()}
                    usdPrice={totalUsd}
                    collection={token?.collection?.name || ''}
                    currencyContract={currency?.contract}
                    currencyDecimals={currency?.decimals}
                    expires={expires}
                  />
                </Box>
                <Text
                  style="body2"
                  color="subtle"
                  css={{ mt: '$3', mr: '$3', ml: '$3', textAlign: 'center' }}
                >
                  This action will cancel your listing. You will be prompted to confirm this cancellation from your wallet. A gas fee is required.
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
                    img={token?.image}
                    name={token?.tokenID}
                    price={parseUnits(listing?.price || "0", 0).toString()}
                    usdPrice={totalUsd}
                    collection={token?.collection?.name || ''}
                    currencyContract={currency?.contract}
                    currencyDecimals={currency?.decimals}
                    expires={expires}
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
                    Listing Canceled!
                  </Text>
                  <Text style="body2" color="subtle" css={{ mb: 24 }}>
                    <>
                      Your{' '}
                      listing for{' '}
                      <Text style="body2" color="accent">
                        {token?.collection?.name}{' '}
                      </Text>
                      at {listing?.price}{' '}
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
    </CancelListingModalRenderer>
  )
}

CancelListingModal.Custom = CancelListingModalRenderer
