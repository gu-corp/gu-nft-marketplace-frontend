import React, { ReactElement, Dispatch, SetStateAction, useEffect } from 'react'
import { Flex, Text, Box, Button, Loader, Anchor } from 'components/primitives'
import {
  CancelListingModalRenderer,
  CancelStep,
} from './CancelListingModalRenderer'
import { Modal } from '../Modal'

import { useNetwork } from 'wagmi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleExclamation,
  faGasPump,
} from '@fortawesome/free-solid-svg-icons'
import useFallbackState from '../../../hooks/useFallbackState'
import { parseUnits } from '@ethersproject/units'
import TokenPrimitive from '../TokenPrimitive'
import Progress from '../Progress'
import { ethers } from 'ethers'
import { useTimeSince } from 'hooks'
import useTrans from 'hooks/useTrans'

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
  const trans = useTrans()
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
        currency,
        collection
      }) => {
        const img = token?.image as string

        // https://unsplash.com/blog/calling-react-hooks-conditionally-dynamically-using-render-props/#waitdoesntthisbreaktherulesofhooks
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const expires = useTimeSince(
          listing?.endTime ? Number(listing.endTime) : 0
        )

        // https://unsplash.com/blog/calling-react-hooks-conditionally-dynamically-using-render-props/#waitdoesntthisbreaktherulesofhooks
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (cancelStep === CancelStep.Complete && onCancelComplete) {
            onCancelComplete()
          }
        }, [cancelStep])

        // https://unsplash.com/blog/calling-react-hooks-conditionally-dynamically-using-render-props/#waitdoesntthisbreaktherulesofhooks
        // eslint-disable-next-line react-hooks/rules-of-hooks
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
            title={trans.token.cancel_listing}
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
                    img={img}
                    name={token?.tokenId}
                    price={parseUnits(listing?.price, 0).toString()}
                    usdPrice={totalUsd}
                    collection={collection?.name || ''}
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
                  {trans.token.this_action_will_cancel_your_listing_you_will_be_prompted_to_confirm_this_cancellation_from_your_wallet_a_gas_fee_is_required}
                </Text>
                <Button onClick={cancelOrder} css={{ m: '$4', justifyContent: 'center' }}>
                  <FontAwesomeIcon icon={faGasPump} width="16" height="16" />
                  {trans.token.continue_to_cancel}
                </Button>
              </Flex>
            )}
            {cancelStep === CancelStep.Approving && (
              <Flex direction="column">
                <Box css={{ p: '$4', borderBottom: '1px solid $borderColor' }}>
                  <TokenPrimitive
                    img={img}
                    name={token?.tokenId}
                    price={parseUnits(listing?.price || "0", 0).toString()}
                    usdPrice={totalUsd}
                    collection={collection?.name || ''}
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
                          ? trans.token.finalizing_on_blockchain
                          : trans.token.confirm_cancelation_in_your_wallet
                      }
                      txHash={txHash}
                      blockExplorerBaseUrl={`${blockExplorerBaseUrl}/tx/${txHash}`}
                    />
                  </>
                )}
                <Button disabled={true} css={{ m: '$4', justifyContent: "center" }}>
                  <Loader />
                  {txHash
                    ? trans.token.waiting_for_transaction_to_be_validated
                    : trans.token.waiting_for_approval}
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
                    {trans.token.listing_canceled}
                  </Text>
                  <Text style="body2" color="subtle" css={{ mb: 24 }}>
                    <>
                      {trans.token.your}{' '}
                      {trans.token.listing_for}{' '}
                      <Text style="body2" color="accent">
                        {collection?.name}{' '}
                      </Text>
                      {trans.token.at} {ethers.utils.formatEther(listing?.price as string)}{' '}
                      {currency?.symbol} {trans.token.has_been_canceled}
                    </>
                  </Text>

                  <Anchor
                    color="primary"
                    weight="medium"
                    css={{ fontSize: 12 }}
                    href={`${blockExplorerBaseUrl}/tx/${txHash}`}
                    target="_blank"
                  >
                    {trans.token.view_on}{' '}
                    {activeChain?.blockExplorers?.default.name || 'Etherscan'}
                  </Anchor>
                </Flex>
                <Button
                  onClick={() => {
                    setOpen(false)
                  }}
                  css={{ m: '$4', justifyContent: 'center' }}
                >
                  {trans.token.close}
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
