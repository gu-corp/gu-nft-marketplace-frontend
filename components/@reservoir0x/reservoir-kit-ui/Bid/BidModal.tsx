import React, {
  ReactElement,
  useEffect,
  useState,
  useRef,
  Dispatch,
  SetStateAction,
} from 'react'
import {
  Flex,
  Text,
  Box,
  Input,
  Select,
  Button,
  ErrorWell,
  Loader,
  FormatCurrency,
  FormatCryptoCurrency,
  CryptoCurrencyIcon,
} from 'components/primitives'

import { Modal, ModalSize } from '../Modal/Modal'
import {
  BidModalRenderer,
  BidStep,
  BidData,
} from './BidModalRenderer'
import TokenStats from './TokenStats'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar,
  faClose,
  faChevronDown,
  faCheckCircle,
} from '@fortawesome/free-solid-svg-icons'
import TransactionBidDetails from './TransactionBidDetails'
import { styled } from 'stitches.config'
import TransactionProgress from '../Modal/TransactionProgress'
import ProgressBar from '../Modal/ProgressBar'
import useFallbackState from '../hooks/useFallbackState'
import { Currency } from 'types/currency'

type Props = Pick<Parameters<typeof Modal>['0'], 'trigger'> & {
  openState?: [boolean, Dispatch<SetStateAction<boolean>>]
  tokenId?: string
  collectionId?: string
  currency?: Currency
  onViewOffers?: () => void
  onClose?: (
    currentStep: BidStep
  ) => void
  onBidComplete?: () => void
  onBidError?: (error: Error) => void
}

function titleForStep(step: BidStep) {
  switch (step) {
    case BidStep.SetPrice:
      return 'Make an Offer'
    case BidStep.Offering:
      return 'Complete Offer'
    case BidStep.Complete:
      return 'Offer Submitted'
  }
}

const ContentContainer = styled(Flex, {
  width: '100%',
  flexDirection: 'column',
  '@bp600': {
    flexDirection: 'row',
  },
})

const MainContainer = styled(Flex, {
  flex: 1,
  borderColor: '$borderColor',
  borderTopWidth: 1,
  borderLeftWidth: 0,
  '@bp1': {
    borderTopWidth: 0,
    borderLeftWidth: 1,
  },

  defaultVariants: {
    direction: 'column',
  },
})

export function BidModal({
  openState,
  trigger,
  tokenId,
  collectionId,
  onViewOffers,
  onClose,
  onBidComplete,
  onBidError,
}: Props): ReactElement {
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )

  const [stepTitle, setStepTitle] = useState('')
  const [attributesSelectable, setAttributesSelectable] = useState(false)
  const [attributeSelectorOpen, setAttributeSelectorOpen] = useState(false)

  return (
    <BidModalRenderer
      open={open}
      tokenId={tokenId}
      collectionId={collectionId}
    >
      {({
        token,
        collection,
        currencyBalance,
        bidAmount,
        bidStep,
        hasEnoughCurrency,
        transactionError,
        expirationOption,
        expirationOptions,
        setBidStep,
        setBidAmount,
        setExpirationOption,
        placeBid,
        requestUserStep,
        currencyOption,
        currencyOptions,
        setCurrencyOption,
        bidData
      }) => {
        const tokenCount = collection?.totalTokens
          ? +collection.totalTokens
          : undefined

        const itemImage =
          token && token?.image
            ? token?.image
            : (collection?.image as string)

        useEffect(() => {
          if (requestUserStep) {
            switch (requestUserStep) {
              case 'SIGN': {
                setStepTitle('Confirm Offer')
                break
              }
              default: {
                setStepTitle('Approval')
                break
              }
            }
          }
        }, [requestUserStep])

        useEffect(() => {
          if (bidStep === BidStep.Complete && onBidComplete) {
            onBidComplete()
          }
        }, [bidStep])

        useEffect(() => {
          if (transactionError && onBidError) {
            onBidError(transactionError)
          }
        }, [transactionError])

        return (
          <Modal
            size={bidStep !== BidStep.Complete ? ModalSize.LG : ModalSize.MD}
            trigger={trigger}
            title={titleForStep(bidStep)}
            open={open}
            onOpenChange={(open) => {
              if (!open && onClose) {
                onClose(bidStep)
              }
              setOpen(open)
            }}
            loading={!collection}
            onFocusCapture={(e) => {
              e.stopPropagation()
            }}
          >
            {bidStep === BidStep.SetPrice && collection && (
              <ContentContainer>
                <TokenStats
                  token={token ? token : undefined}
                  collection={collection}
                />
                <MainContainer css={{ p: '$4' }}>
                  <Flex justify="between">
                    <Text style="tiny">Offer Amount</Text>
                    <Text
                      as={Flex}
                      css={{ gap: '$1' }}
                      align="center"
                      style="tiny"
                    >
                      Balance:{' '}
                      <FormatCryptoCurrency
                        textStyle="tiny"
                        logoHeight={10}
                        amount={currencyBalance?.value.toString()}
                        decimals={currencyOption?.decimals}
                        address={currencyOption?.contract}
                      />
                    </Text>
                  </Flex>
                  <Flex css={{ mt: '$2', gap: 20 }}>
                    <Text
                      as={Flex}
                      css={{ gap: '$2', ml: '$3', flexShrink: 0 }}
                      align="center"
                      style="body1"
                      color="subtle"
                    >
                      <CryptoCurrencyIcon
                        css={{ height: 20 }}
                        address={currencyOption?.contract as string}
                      />
                      {currencyOption?.symbol}
                    </Text>
                    <Input
                      type="number"
                      value={bidAmount}
                      onChange={(e) => {
                        setBidAmount(e.target.value)
                      }}
                      placeholder="Enter price here"
                      containerCss={{
                        width: '100%',
                      }}
                      css={{
                        color: '$neutralText',
                        textAlign: 'left',
                      }}
                    />
                  </Flex>
                  <FormatCurrency
                    css={{
                      marginLeft: 'auto',
                      mt: '$2',
                      display: 'inline-block',
                      minHeight: 15,
                    }}
                    style="tiny"
                    amount={0}
                  />

                  <Text as={Box} css={{ mt: '$4', mb: '$2' }} style="tiny">
                    Expiration Date
                  </Text>
                  <Flex css={{ gap: '$2', mb: '$4' }}>
                    <Select
                      css={{
                        flex: 1,
                        '@bp1': {
                          width: 160,
                          flexDirection: 'row',
                        },
                      }}
                      value={expirationOption?.text || ''}
                      onValueChange={(value: string) => {
                        const option = expirationOptions.find(
                          (option) => option.value == value
                        )
                        if (option) {
                          setExpirationOption(option)
                        }
                      }}
                    >
                      {expirationOptions.map((option) => (
                        <Select.Item key={option.text} value={option.value}>
                          <Select.ItemText>{option.text}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select>
                  </Flex>

                  <Box css={{ mb: '$3', mt: '$4' }}>
                      <Text
                        as="div"
                        css={{ mb: '$2' }}
                        style="subtitle2"
                        color="subtle"
                      >
                        Currency
                      </Text>
                      <Select
                        value={currencyOption?.symbol || ''}
                        onValueChange={(value: string) => {
                          const option = currencyOptions.find(
                            (option) => option.contract == value
                          )
                          if (option) {
                            setCurrencyOption(option)
                          }
                        }}
                      >
                        {currencyOptions.map((option) => (
                          <Select.Item key={option.contract} value={option.contract}>
                            <Select.ItemText>{option.symbol}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select>
                  </Box>

                  <Box css={{ width: '100%', mt: 'auto' }}>
                    {bidAmount === '' && (
                      <Button disabled={true} css={{ width: '100%', display: 'inline' }}>
                        Enter a Price
                      </Button>
                    )}
                    {bidAmount !== '' && hasEnoughCurrency && (
                      <Button onClick={placeBid} css={{ width: '100%', display: 'inline' }}>
                        Make an Offer
                      </Button>
                    )}
                    {bidAmount !== '' && !hasEnoughCurrency && (
                      <>
                        {!hasEnoughCurrency && (
                          <Flex css={{ gap: '$2', mt: 10 }} justify="center">
                            <Text style="body2" color="error">
                              {currencyBalance?.symbol || 'ETH'} Balance
                            </Text>
                            <FormatCryptoCurrency amount={currencyBalance?.value} />
                          </Flex>
                        )}
                      </>
                    )}
                  </Box>
                </MainContainer>
              </ContentContainer>
            )}

            {bidStep === BidStep.Offering && collection && (
              <ContentContainer>
                <TransactionBidDetails
                  token={token}
                  collection={collection}
                  bidData={bidData}
                />
                <MainContainer css={{ p: '$4' }}>
                  <ProgressBar
                    value={requestUserStep === "APPROVAL" ? 1 : 2}
                    max={2}
                  />
                  {transactionError && <ErrorWell css={{ mt: 24 }} />}
                  <Text
                    css={{ textAlign: 'center', mt: 48, mb: 28 }}
                    style="subtitle1"
                  >
                    {stepTitle}
                  </Text>
                    {requestUserStep === 'SIGN' && (
                      <TransactionProgress
                        justify="center"
                        fromImg={itemImage || ''}
                      />
                    )}
                    {requestUserStep !== 'SIGN' && (
                      <Flex align="center" justify="center">
                        <Flex
                          css={{ background: '$neutalLine', borderRadius: 8 }}
                        >
                          <CryptoCurrencyIcon
                            css={{ height: 56, width: 56 }}
                            address={currencyOption.contract}
                          />
                        </Flex>
                      </Flex>
                    )}
                      <Text
                        css={{
                          textAlign: 'center',
                          mt: 24,
                          maxWidth: 395,
                          mx: 'auto',
                          mb: '$4',
                        }}
                        style="body2"
                        color="subtle"
                        >
                        {requestUserStep === 'SIGN' ?
                          'A free off-chain signature to create the offer' :
                          `We'll ask your approval for the exchange to access your token. This is a one-time only operation per exchange.`}
                      </Text>
                  {!transactionError && (
                    <Button css={{ width: '100%', mt: 'auto', justifyContent: "center" }} disabled={true}>
                      <Loader />
                      Waiting for Approval
                    </Button>
                  )}
                  {transactionError && (
                    <Flex css={{ mt: 'auto', gap: 10 }}>
                      <Button
                        color="secondary"
                        css={{ flex: 1 }}
                        onClick={() => setBidStep(BidStep.SetPrice)}
                      >
                        Edit Offer
                      </Button>
                      <Button css={{ flex: 1 }} onClick={placeBid}>
                        Retry
                      </Button>
                    </Flex>
                  )}
                </MainContainer>
              </ContentContainer>
            )}

            {bidStep === BidStep.Complete && (
              <Flex direction="column" align="center" css={{ p: '$4' }}>
                <Box css={{ color: '$successAccent', mt: 48 }}>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    style={{ width: '32px', height: '32px' }}
                  />
                </Box>
                <Text style="h5" css={{ textAlign: 'center', mt: 36, mb: 80 }}>
                  Offer Submitted!
                </Text>
                {onViewOffers ? (
                  <Button
                    css={{ width: '100%' }}
                    onClick={() => {
                      onViewOffers()
                    }}
                  >
                    View Offers
                  </Button>
                ) : (
                  <Button
                    css={{ width: '100%', display: 'inline' }}
                    onClick={() => {
                      setOpen(false)
                    }}
                  >
                    Close
                  </Button>
                )}
              </Flex>
            )}
          </Modal>
        )
      }}
    </BidModalRenderer>
  )
}

BidModal.Custom = BidModalRenderer
