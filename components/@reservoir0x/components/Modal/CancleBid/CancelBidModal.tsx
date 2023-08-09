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
import useFallbackState from '../../../hooks/useFallbackState'
import { parseUnits } from '@ethersproject/units'
import currencyOptions from '../../../lib/defaultCurrencyOptions'
import TokenPrimitive from '../TokenPrimitive'
import Progress from '../Progress'
import { ethers } from 'ethers'
import { useTimeSince } from 'hooks'
import useTrans from 'hooks/useTrans'

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
  const trans = useTrans()
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

        // https://unsplash.com/blog/calling-react-hooks-conditionally-dynamically-using-render-props/#waitdoesntthisbreaktherulesofhooks
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const expires = useTimeSince(
          bid?.endTime ? Number(bid.endTime) : 0
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

        const isBidAvailable = bid && !loading

        return (
          <Modal
            trigger={trigger}
            title={trans.token.cancel_offer}
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
                  {trans.token.selected_bid_is_no_longer_available}
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
                    priceSubtitle={trans.token.offer}
                  />
                </Box>
                <Text
                  style="body2"
                  color="subtle"
                  css={{ mt: '$3', mr: '$3', ml: '$3', textAlign: 'center' }}
                >
                  {trans.token.this_will_cancel_your_offer_for_free_you_will_be_prompted_to_confirm_this_cancellation_from_your_wallet}
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
                    img={image}
                    name={token?.tokenId}
                    price={parseUnits(bid?.price || "0", 0).toString()}
                    usdPrice={totalUsd}
                    collection={collection?.name || ''}
                    currencyContract={currency?.contract}
                    currencyDecimals={currency?.decimals}
                    expires={expires}
                    priceSubtitle={trans.token.offer}
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
                    {trans.token.offer_canceled}
                  </Text>
                  <Text style="body2" color="subtle" css={{ mb: 24 }}>
                    <>
                      {trans.token.your}{' '}
                      <Text style="body2" color="accent">
                        {collection?.name}
                      </Text>{' '}
                      {trans.token.offer_for}{' '}
                      <Text style="body2" color="accent">
                        {collection?.name}{' '}
                      </Text>
                      {trans.token.at} {ethers.utils.formatEther(bid?.price as string)}{' '}
                      {currency?.symbol} {trans.token.has_been_canceled}.
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
                  {trans.token.close}
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
