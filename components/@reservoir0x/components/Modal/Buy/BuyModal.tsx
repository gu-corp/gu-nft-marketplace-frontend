import React, { Dispatch, ReactElement, SetStateAction, useEffect } from 'react'
import {
  Flex,
  Box,
  Text,
  Input,
  Anchor,
  Button,
  FormatCurrency,
  FormatCryptoCurrency,
  Loader,
} from 'components/primitives'
import Popover from 'components/primitives/Popover'
import { Modal } from '../Modal'
import {
  faCopy,
  faCircleExclamation,
  faCheckCircle,
  faExchange,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { BuyModalRenderer, BuyStep } from './BuyModalRenderer'
import { useNetwork } from 'wagmi'
import useFallbackState from '../../../hooks/useFallbackState'
import useCopyToClipboard from '../../../hooks/useCopyToClipboard'
import ProgressBar from '../ProgressBar'
import TokenLineItem from '../TokenLineItem'
import Progress from '../Progress'
import Image from 'next/image'

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  tokenId?: string
  collectionId?: string
  orderId?: string
  onPurchaseComplete?: () => void
  onPurchaseError?: (error: Error) => void
  onClose?: (
    currentStep: BuyStep
  ) => void
}

function titleForStep(step: BuyStep) {
  switch (step) {
    case BuyStep.AddFunds:
      return 'Add Funds'
    case BuyStep.Unavailable:
      return 'Selected item is no longer Available'
    default:
      return 'Complete Checkout'
  }
}

export function BuyModal({
  openState,
  trigger,
  tokenId,
  collectionId,
  orderId,
  onPurchaseComplete,
  onPurchaseError,
  onClose,
}: Props): ReactElement {
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )
  const { copy: copyToClipboard, copied } = useCopyToClipboard()
  const { chain: activeChain } = useNetwork()

  return (
    <BuyModalRenderer
      open={open}
      tokenId={tokenId}
      collectionId={collectionId}
      orderId={orderId}
    >
      {({
        loading,
        token,
        collection,
        listing,
        quantity,
        currency,
        mixedCurrencies,
        buyStep,
        transactionError,
        hasEnoughCurrency,
        address,
        blockExplorerBaseUrl,
        setBuyStep,
        buyToken,
        requestUserStep,
        txHash,
        currencyBalance,
        ethBalance
      }) => {
        const title = titleForStep(buyStep)
        // https://unsplash.com/blog/calling-react-hooks-conditionally-dynamically-using-render-props/#waitdoesntthisbreaktherulesofhooks
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (buyStep === BuyStep.Complete && onPurchaseComplete) {
            onPurchaseComplete()
          }
        }, [buyStep])
        // https://unsplash.com/blog/calling-react-hooks-conditionally-dynamically-using-render-props/#waitdoesntthisbreaktherulesofhooks
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (transactionError && onPurchaseError) {
            onPurchaseError(transactionError)
          }
        }, [transactionError])

        return (
          <Modal
            trigger={trigger}
            title={title}
            onBack={
              buyStep == BuyStep.AddFunds
                ? () => {
                    setBuyStep(BuyStep.Checkout)
                  }
                : null
            }
            open={open}
            onOpenChange={(open) => {
              if (!open && onClose) {
                onClose(buyStep)
              }
              setOpen(open)
            }}
            loading={loading}
          >
            {buyStep === BuyStep.Unavailable && !loading && (
              <Flex direction="column">
                <TokenLineItem
                  tokenDetails={token}
                  collection={collection}
                  usdConversion={0}
                  isUnavailable={true}
                  price={listing?.price}
                  currency={currency}
                  priceSubtitle={quantity > 1 ? 'Average Price' : undefined}
                  showRoyalties={true}
                />
                <Button
                  onClick={() => {
                    setOpen(false)
                  }}
                  css={{ m: '$4' }}
                >
                  Close
                </Button>
              </Flex>
            )}

            {buyStep === BuyStep.Checkout && !loading && (
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
                  price={listing?.price}
                  currency={currency}
                  css={{ border: 0 }}
                  priceSubtitle={quantity > 1 ? 'Average Price' : undefined}
                  showRoyalties={true}
                />
                <Flex
                  align="center"
                  justify="between"
                  css={{ pt: '$4', px: '$4' }}
                >
                  <Text style="h6">Total</Text>
                  <FormatCryptoCurrency
                    textStyle="h6"
                    amount={listing?.price}
                    address={currency?.contract}
                    decimals={currency?.decimals}
                  />
                </Flex>
                <Flex justify="end">
                  <FormatCurrency
                    amount={0}
                    color="subtle"
                    css={{ mr: '$4' }}
                  />
                </Flex>
                <Flex justify="end" css={{ mr: '$4' }}>
                  <Text style="body2" css={{ mr: '$4' }}>Your balance</Text>
                  <FormatCryptoCurrency
                    address={currency?.contract}
                    amount={currencyBalance?.value}
                    textColor="subtle"
                    decimals={currencyBalance?.decimals}
                  />
                </Flex>
              
                <Box css={{ p: '$4', width: '100%' }}>
                  {hasEnoughCurrency ? (
                    <Button
                      onClick={buyToken}
                      css={{ width: '100%', justifyContent: 'center' }}
                      color="primary"
                    >
                      Checkout
                    </Button>
                  ) : (
                    <Flex direction="column" align="center">
                      <Flex align="center" css={{ mb: '$3' }}>
                        <Text css={{ mr: '$3' }} color="error" style="body2">
                          Insufficient Balance
                        </Text>

                        <FormatCryptoCurrency
                          amount={listing?.price}
                          address={currency?.contract}
                          decimals={currency?.decimals}
                          textStyle="body2"
                        />
                      </Flex>

                      <Button
                        onClick={() => {
                          setBuyStep(BuyStep.AddFunds)
                        }}
                        css={{ width: '100%', justifyContent: 'center' }}
                      >
                        Add Funds
                      </Button>
                    </Flex>
                  )}
                </Box>
              </Flex>
            )}

            {buyStep === BuyStep.Approving && token && (
              <Flex direction="column">
                <TokenLineItem
                  tokenDetails={token}
                  collection={collection}
                  usdConversion={0}
                  price={listing?.price}
                  currency={currency}
                  priceSubtitle={quantity > 1 ? 'Average Price' : undefined}
                  quantity={quantity}
                />
                <ProgressBar
                  css={{ px: '$4', mt: '$3' }}
                  value={requestUserStep === "APPROVAL_ERC20" ? 1: 2}
                  max={2}
                />
                {!txHash && <Loader css={{ height: 206 }} />}
                <Progress
                  title={requestUserStep === "APPROVAL_ERC20" ? "Waiting for approval allowance currency..." : "Waiting for buying..."}
                  txHash={txHash}
                  blockExplorerBaseUrl={`${blockExplorerBaseUrl}/tx/${txHash}`}
                />
                <Button disabled={true} css={{ m: '$4', justifyContent: "center" }}>
                  <Loader />
                  {txHash
                    ? 'Waiting for transaction to be validated'
                    : 'Waiting for approval...'}
                </Button>
              </Flex>
            )}

            {buyStep === BuyStep.Complete && token && (
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
                  <Text style="h5" css={{ mb: 24 }}>
                    Congratulations!
                  </Text>
                  <Image
                    src={token?.image as string}
                    style={{ width: 100, height: 100 }}
                    alt=''
                  />
                  <Flex
                    css={{ mb: 24, mt: '$2', maxWidth: '100%' }}
                    align="center"
                    justify="center"
                  >
                    {collection?.image && (
                      <Box css={{ mr: '$1' }}>
                        <Image
                          src={collection?.image}
                          style={{ width: 24, height: 24, borderRadius: '50%' }}
                          alt=''
                        />
                      </Box>
                    )}

                    <Text
                      style="subtitle2"
                      css={{ maxWidth: '100%' }}
                      ellipsify
                    >
                      {`#${token?.tokenId}`}
                    </Text>
                  </Flex>

                  <Flex css={{ mb: '$2' }} align="center">
                    <Box css={{ color: '$successAccent', mr: '$2' }}>
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </Box>
                    <Text style="body1">
                      Your transaction went through successfully
                    </Text>
                  </Flex>
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
                <Flex
                  css={{
                    p: '$4',
                    flexDirection: 'column',
                    gap: '$3',
                    '@bp600': {
                      flexDirection: 'row',
                    },
                  }}
                >
                  <Button
                    onClick={() => {
                      setOpen(false)
                    }}
                    style={{ flex: 1, justifyContent: 'center' }}
                    color="primary"
                  >
                    Close
                  </Button>
                </Flex>
              </Flex>
            )}

            {buyStep === BuyStep.AddFunds && token && (
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
                  <Box css={{ color: '$neutralText' }}>
                    <FontAwesomeIcon
                      icon={faExchange}
                      style={{
                        width: '32px',
                        height: '32px',
                        margin: '12px 0px',
                      }}
                    />
                  </Box>
                  <Text style="subtitle1" css={{ my: 24 }}>
                    <Popover
                      content={
                        <Text style={'body2'}>
                          Trade one crypto for another on a crypto exchange.
                          Popular decentralized exchanges include{' '}
                          <Anchor
                            css={{ fontSize: 12 }}
                            href="https://app.uniswap.org/"
                            target="_blank"
                            color="primary"
                          >
                            Uniswap
                          </Anchor>
                          ,{' '}
                          <Anchor
                            css={{ fontSize: 12 }}
                            href="https://app.sushi.com/"
                            target="_blank"
                            color="primary"
                          >
                            SushiSwap
                          </Anchor>{' '}
                          and many others.
                        </Text>
                      }
                    >
                      <Text as="span" color="accent">
                        Exchange currencies
                      </Text>
                    </Popover>{' '}
                    or transfer funds to your
                    <br /> wallet address below:
                  </Text>
                  <Box css={{ width: '100%', position: 'relative' }}>
                    <Flex
                      css={{
                        pointerEvents: 'none',
                        opacity: copied ? 1 : 0,
                        position: 'absolute',
                        inset: 0,
                        borderRadius: 8,
                        transition: 'all 200ms ease-in-out',
                        pl: '$4',
                        alignItems: 'center',
                        zIndex: 3,
                        textAlign: 'left',
                        background: '$neutralBg',
                      }}
                    >
                      <Text style={'body1'}>Copied Address!</Text>
                    </Flex>
                    <Input
                      readOnly
                      onClick={() => copyToClipboard(address as string)}
                      value={address || ''}
                      css={{
                        color: '$neutralText',
                        textAlign: 'left',
                      }}
                    />
                    <Box
                      css={{
                        position: 'absolute',
                        right: '$3',
                        top: '50%',
                        touchEvents: 'none',
                        transform: 'translateY(-50%)',
                        color: '$neutralText',
                        pointerEvents: 'none',
                      }}
                    >
                      <FontAwesomeIcon icon={faCopy} width={16} height={16} />
                    </Box>
                  </Box>
                </Flex>
                <Button
                  css={{ m: '$4', justifyContent: 'center' }}
                  color="primary"
                  onClick={() => copyToClipboard(address as string)}
                >
                  Copy Wallet Address
                </Button>
              </Flex>
            )}
          </Modal>
        )
      }}
    </BuyModalRenderer>
  )
}

BuyModal.Custom = BuyModalRenderer
