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

import { Modal, ModalSize } from '../Modal'
import {
  BidModalRenderer,
  BidStep,
  BidData,
  RequestUserStep,
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
import useFallbackState from '../../../hooks/useFallbackState'
import { Currency } from 'types/currency'
import ProgressBar from '../ProgressBar'
import TransactionProgress from '../TransactionProgress'
import useTrans from 'hooks/useTrans'

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
  const trans = useTrans()
  const [open, setOpen] = useFallbackState(
    openState ? openState[0] : false,
    openState
  )

  const [stepTitle, setStepTitle] = useState('')

  function titleForStep(step: BidStep) {
    switch (step) {
      case BidStep.SetPrice:
        return trans.token.make_an_offer
      case BidStep.Offering:
        return trans.token.complete_offer
      case BidStep.Complete:
        return trans.token.offer_submitted
    }
  }

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
        bidData,
        steps
      }) => {
        const itemImage = token?.image || collection?.image as string
        // https://unsplash.com/blog/calling-react-hooks-conditionally-dynamically-using-render-props/#waitdoesntthisbreaktherulesofhooks
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (requestUserStep) {
            switch (requestUserStep) {
              case RequestUserStep.SIGN: {
                setStepTitle(trans.token.confirm_offer)
                break
              }
              default: {
                setStepTitle(trans.token.approval)
                break
              }
            }
          }
        }, [requestUserStep])
        // https://unsplash.com/blog/calling-react-hooks-conditionally-dynamically-using-render-props/#waitdoesntthisbreaktherulesofhooks
        // eslint-disable-next-line react-hooks/rules-of-hooks
        useEffect(() => {
          if (bidStep === BidStep.Complete && onBidComplete) {
            onBidComplete()
          }
        }, [bidStep])
        // https://unsplash.com/blog/calling-react-hooks-conditionally-dynamically-using-render-props/#waitdoesntthisbreaktherulesofhooks
        // eslint-disable-next-line react-hooks/rules-of-hooks
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
                  token={token}
                  collection={collection}
                />
                <MainContainer css={{ p: '$4' }}>
                  <Flex justify="between">
                    <Text style="tiny">{trans.token.offer_amount}</Text>
                    <Text
                      as={Flex}
                      css={{ gap: '$1' }}
                      align="center"
                      style="tiny"
                    >
                      {trans.token.balance}
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
                      onChange={(e: any) => {
                        setBidAmount(e.target.value)
                      }}
                      placeholder={trans.token.enter_price_here}
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
                    {trans.token.expiration_date}
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
                        {trans.token.currency}
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
                      <Button disabled={true} css={{ width: '100%', justifyContent: 'center' }}>
                        {trans.token.enter_a_price}
                      </Button>
                    )}
                    {bidAmount !== '' && hasEnoughCurrency && (
                      <Button onClick={placeBid} css={{ width: '100%', justifyContent: 'center' }}>
                        {trans.token.make_an_offer}
                      </Button>
                    )}
                    {bidAmount !== '' && !hasEnoughCurrency && (
                      <>
                        {!hasEnoughCurrency && (
                          <Flex css={{ gap: '$2', mt: 10 }} justify="center">
                            <Text style="body2" color="error">
                              {currencyBalance?.symbol || 'ETH'} {trans.token.balance}
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
                    value={steps.findIndex(step => step === requestUserStep) + 1}
                    max={steps.length}
                  />
                  {transactionError && <ErrorWell css={{ mt: 24 }} />}
                  <Text
                    css={{ textAlign: 'center', mt: 48, mb: 28 }}
                    style="subtitle1"
                  >
                    {stepTitle}
                  </Text>
                    {requestUserStep === RequestUserStep.SIGN && (
                      <TransactionProgress
                        justify="center"
                        fromImg={itemImage || ''}
                      />
                    )}
                    {requestUserStep === RequestUserStep.APPROVAL && (
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
                        {requestUserStep === RequestUserStep.SIGN ?
                          trans.token.a_fee_on_every_order_that_goes_to_the_collection_creator :
                          trans.token.we_ll_ask_your_approval_for_the_exchange_to_access_your_token}
                      </Text>
                  {!transactionError && (
                    <Button css={{ width: '100%', mt: 'auto', justifyContent: "center" }} disabled={true}>
                      <Loader />
                      {trans.token.waiting_for_approval}
                    </Button>
                  )}
                  {transactionError && (
                    <Flex css={{ mt: 'auto', gap: 10 }}>
                      <Button
                        color="secondary"
                        css={{ flex: 1 }}
                        onClick={() => setBidStep(BidStep.SetPrice)}
                      >
                        {trans.token.edit_offer}
                      </Button>
                      <Button css={{ flex: 1 }} onClick={placeBid}>
                        {trans.token.retry}
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
                  {trans.token.offer_submitted}
                </Text>
                {onViewOffers ? (
                  <Button
                    css={{ width: '100%' }}
                    onClick={() => {
                      onViewOffers()
                    }}
                  >
                    {trans.token.view_offers}
                  </Button>
                ) : (
                  <Button
                    css={{ width: '100%', justifyContent: 'center' }}
                    onClick={() => {
                      setOpen(false)
                    }}
                  >
                    {trans.token.close}
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
