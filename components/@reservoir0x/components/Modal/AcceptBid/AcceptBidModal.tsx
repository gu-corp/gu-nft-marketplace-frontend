import React, { Dispatch, ReactElement, SetStateAction, useEffect } from 'react'

import {
  Flex,
  Box,
  Text,
  Anchor,
  Button,
  FormatCurrency,
  Loader,
  FormatCryptoCurrency,
} from 'components/primitives'

import { Progress } from './Progress'
import { Modal } from '../Modal'
import {
  faCircleExclamation,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  AcceptBidStep,
  AcceptBidModalRenderer,
  // AcceptBidStepData,
} from './AcceptBidModalRenderer'
import Fees from './Fees'
import { useNetwork } from 'wagmi'
import useFallbackState from '../../../hooks/useFallbackState'
import useTimeSince from '../../../hooks/useTimeSince'
import { formatUnits } from 'ethers/lib/utils.js'
import TokenLineItem from '../TokenLineItem'

type BidData = {
  tokenId?: string
  collectionId?: string
  txHash?: string
  maker?: string
}

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  tokenId?: string
  collectionId?: string
  bidId?: string
  onBidAccepted?: () => void
  onClose?: (
    currentStep: AcceptBidStep
  ) => void
  onBidAcceptError?: (error: Error) => void
  onCurrentStepUpdate?: () => void
}

function titleForStep(step: AcceptBidStep) {
  switch (step) {
    case AcceptBidStep.Unavailable:
      return 'Selected item is no longer available'
    default:
      return 'Accept Offer'
  }
}

export function AcceptBidModal({
  openState,
  trigger,
  tokenId,
  collectionId,
  bidId,
  onBidAccepted,
  onClose,
  onBidAcceptError,
  onCurrentStepUpdate,
}: Props): ReactElement {
  const { chain: activeChain } = useNetwork()

  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )
  return (
    <AcceptBidModalRenderer
      open={open}
      tokenId={tokenId}
      collectionId={collectionId}
      bidId={bidId}
    >
      {({
        loading,
        token,
        collection,
        fees,
        acceptBidStep,
        transactionError,
        txHash,
        etherscanBaseUrl,
        acceptBid,
        bid,
        currency,
      }) => {
        const title = titleForStep(acceptBidStep)

        useEffect(() => {
          if (acceptBidStep === AcceptBidStep.Complete && onBidAccepted) {
            onBidAccepted()
          }
        }, [acceptBidStep])

        useEffect(() => {
          if (transactionError && onBidAcceptError) {
            onBidAcceptError(transactionError)
          }
        }, [transactionError])

        useEffect(() => {
          if (onCurrentStepUpdate) {
            onCurrentStepUpdate()
          }
        }, [])

        // TO-DO: floorPrice
        // const floorPrice = token?.market?.floorAsk?.price?.amount?.native

        // const difference =
        //   floorPrice && ethBidAmount
        //     ? ((floorPrice - ethBidAmount) / floorPrice) * 100
        //     : undefined

        const difference = 0
        const warning =
          difference && difference > 50
            ? `${difference}% lower than floor price`
            : undefined

        const tokenImage =
          token?.image || token?.collection?.image

        const expires = useTimeSince(
          bid?.endTime ? Number(bid.endTime) : 0
        )

        return (
          <Modal
            trigger={trigger}
            title={title}
            open={open}
            onOpenChange={(open) => {
              if (!open && onClose) {
                onClose(acceptBidStep)
              }
              setOpen(open)
            }}
            loading={loading}
          >
            {acceptBidStep === AcceptBidStep.Unavailable && !loading && (
              <Flex direction="column">
                <TokenLineItem
                  tokenDetails={token}
                  collection={collection}
                  usdConversion={0}
                  isUnavailable={true}
                  price={+(bid?.price || 0)}
                  warning={warning}
                  currency={currency}
                  expires={expires}
                  priceSubtitle="Offer"
                />
                <Button onClick={() => setOpen(false)} css={{ m: '$4', justifyContent: 'center' }}>
                  Close
                </Button>
              </Flex>
            )}

            {acceptBidStep === AcceptBidStep.Checkout && !loading && (
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
                <TokenLineItem
                  tokenDetails={token}
                  collection={collection}
                  usdConversion={0}
                  isUnavailable={true}
                  price={+(bid?.price || 0)}
                  warning={warning}
                  currency={currency}
                  expires={expires}
                  priceSubtitle="Offer"
                />
                <Fees fees={fees} />

                <Flex
                  align="center"
                  justify="between"
                  css={{ px: '$4', mt: '$4' }}
                >
                  <Text style="h6">You Get</Text>
                  <FormatCryptoCurrency
                    textStyle="h6"
                    amount={bid?.price}
                    address={currency?.contract}
                    logoHeight={16}
                  />
                </Flex>
                <Flex justify="end">
                  <FormatCurrency
                    amount={0}
                    color="subtle"
                    css={{ mr: '$4' }}
                  />
                </Flex>

                <Button
                  style={{
                    flex: 1,
                    marginBottom: 16,
                    marginTop: 16,
                    marginRight: 16,
                    marginLeft: 16,
                    justifyContent: 'center'
                  }}
                  color="primary"
                  onClick={acceptBid}
                >
                  Accept
                </Button>
              </Flex>
            )}

            {(acceptBidStep === AcceptBidStep.Confirming ||
              acceptBidStep === AcceptBidStep.Finalizing ||
              acceptBidStep === AcceptBidStep.ApproveMarketplace) &&
              token && (
                <Flex direction="column">
                  <TokenLineItem
                  tokenDetails={token}
                  collection={collection}
                  usdConversion={0}
                  isUnavailable={true}
                  price={+(bid?.price || 0)}
                  warning={warning}
                  currency={currency}
                  expires={expires}
                  priceSubtitle="Offer"
                />
                  <Progress
                    acceptBidStep={acceptBidStep}
                    etherscanBaseUrl={`${etherscanBaseUrl}/tx/${txHash}`}
                    tokenImage={tokenImage}
                  />
                  <Button disabled={true} css={{ m: '$4', justifyContent: 'center' }}>
                    <Loader />
                    {acceptBidStep === AcceptBidStep.Confirming
                      ? 'Waiting for approval...'
                      : 'Waiting for transaction to be validated'}
                  </Button>
                </Flex>
              )}

            {acceptBidStep === AcceptBidStep.Complete && token && (
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
                  {' '}
                  <Box
                    css={{
                      color: '$successAccent',
                      mb: 24,
                    }}
                  >
                    <FontAwesomeIcon icon={faCheckCircle} fontSize={32} />
                  </Box>
                  <Text style="h5" css={{ mb: 8 }}>
                    Bid accepted!
                  </Text>
                  <Flex
                    css={{ mb: 24, maxWidth: '100%' }}
                    align="center"
                    justify="center"
                  >
                    <Text
                      style="subtitle2"
                      css={{ maxWidth: '100%' }}
                      ellipsify
                    >
                      You’ve sold{' '}
                      <Anchor
                        color="primary"
                        weight="medium"
                        css={{ fontSize: 12 }}
                        href={`collection/${collectionId}/${tokenId}`}
                        target="_blank"
                      >
                        {token?.name
                          ? token?.name
                          : `#${token?.tokenID}`}
                      </Anchor>{' '}
                      from the {token?.collection?.name} collection.
                    </Text>
                  </Flex>
                  <Anchor
                    color="primary"
                    weight="medium"
                    css={{ fontSize: 12 }}
                    href={`${etherscanBaseUrl}/tx/${txHash}`}
                    target="_blank"
                  >
                    View on{' '}
                    {activeChain?.blockExplorers?.default.name || 'Etherscan'}
                  </Anchor>
                </Flex>
                <Flex
                  css={{
                    p: '$4',
                    flexDirection: 'column',
                    gap: '$3',
                    '@bp1': {
                      flexDirection: 'row',
                    },
                  }}
                >
                  <Button
                    css={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      setOpen(false)
                    }}
                  >
                    Done
                  </Button>
                </Flex>
              </Flex>
            )}
          </Modal>
        )
      }}
    </AcceptBidModalRenderer>
  )
}

AcceptBidModal.Custom = AcceptBidModalRenderer
