import { useQuery } from '@apollo/client'
import { faGasPump } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Order, Token } from '__generated__/graphql'
import { AcceptBid, Bid, BuyNow, List } from 'components/buttons'
import AddToCart from 'components/buttons/AddToCart'
import CancelBid from 'components/buttons/CancelBid'
import CancelListing from 'components/buttons/CancelListing'
import { Button, Flex, Grid, Tooltip, Text } from 'components/primitives'
import { GET_LISTED } from 'graphql/queries/orders'
import { useRouter } from 'next/router'
import { ComponentPropsWithoutRef, FC, useState } from 'react'
import { useAccount } from 'wagmi'

type Props = {
  token: Token
  offer?: Order
  isOwner: boolean
  mutate?: () => void
  account: ReturnType<typeof useAccount>
}

export const TokenActions: FC<Props> = ({
  token,
  offer,
  isOwner,
  mutate,
  account,
}) => {
  const router = useRouter()
  const bidOpenState = useState(true)

  const queryBidId = router.query.bidId as string
  const deeplinkToAcceptBid = router.query.acceptBid === 'true'
  
  const isTopBidder =
    account.isConnected &&
    offer?.signer?.toLowerCase() ===
    account?.address?.toLowerCase()

  const buttonCss: ComponentPropsWithoutRef<typeof Button>['css'] = {
    width: '100%',
    height: 52,
    justifyContent: 'center',
    minWidth: 'max-content',
    '@sm': {
      maxWidth: 250,
    },
  }

  const { data: listedData, refetch: refetchListed } = useQuery(GET_LISTED, {
    variables: {
      where: {
        collectionAddress: token?.collection as string,
        tokenId: token?.tokenId as string
      }
    },
    skip: !token?.tokenId || !token?.collection
  })

  const listing = listedData?.listed
  const isListed = token && listing

  const showAcceptOffer =
    offer &&
    isOwner &&
    token?.owner?.toLowerCase() !== offer?.signer?.toLowerCase()
      ? true
      : false

  const showList =
    isOwner
  
  const showBuy =
    !isOwner &&
    isListed
  
  const showBid =
    !isOwner
  
  const showCancelBid =
    isTopBidder
  
  const showCancelList =
    isOwner && isListed
  
  return (
    <Grid
      align="center"
      css={{
        gap: '$4',
        gridTemplateColumns: 'repeat(1,minmax(0,1fr))',
        width: '100%',
        '@sm': {
          gridTemplateColumns: 'repeat(2,minmax(0,1fr))',
          maxWidth: 500,
        },
      }}
    >
      {showList && (
        <List
          token={token}
          mutate={mutate}
          buttonCss={buttonCss}
          buttonChildren={
            isListed
              ? 'Create New Listing'
              : 'List for Sale'
          }
        />
      )}
      {showBuy && (
        <Flex
          css={{ ...buttonCss, borderRadius: 8, overflow: 'hidden', gap: 1 }}
        >
          <BuyNow
            orderId={listing.hash}
            token={token}
            buttonCss={{ flex: 1, justifyContent: 'center' }}
            buttonProps={{ corners: 'square' }}
            mutate={mutate}
          />
          <AddToCart
            token={token}
            buttonCss={{
              width: 52,
              p: 0,
              justifyContent: 'center',
            }}
            buttonProps={{ corners: 'square' }}
          />
        </Flex>
      )}
      {showAcceptOffer && (
        <AcceptBid
          token={token}
          bidId={offer?.hash}
          collectionId={token?.collection}
          openState={
            isOwner && (queryBidId || deeplinkToAcceptBid)
              ? bidOpenState
              : undefined
          }
          mutate={mutate}
          buttonCss={buttonCss}
          buttonChildren="Accept Offer"
        />
      )}
      {showBid && (
        <Bid
          tokenId={token?.tokenId}
          collectionId={token?.collection}
          mutate={mutate}
          buttonCss={buttonCss}
        />
      )}
      {showCancelBid && (
        <CancelBid
          bidId={offer?.hash as string}
          mutate={mutate}
          trigger={
            <Flex>
              {(
                <Tooltip
                  content={
                    <Text style="body2" as="p">
                      Cancelling this order requires gas.
                    </Text>
                  }
                >
                  <Button
                    css={{
                      color: '$red11',
                      width: '100%',
                      height: 52,
                      justifyContent: 'center',
                      minWidth: 'max-content',
                      '@sm': {
                        maxWidth: 250,
                      },
                    }}
                    color="gray3"
                  >
                    <FontAwesomeIcon
                      color="#697177"
                      icon={faGasPump}
                      width="16"
                      height="16"
                    />
                    Cancel Offer
                  </Button>
                </Tooltip>
              )}
            </Flex>
          }
        />
      )}
      {showCancelList && (
        <CancelListing
          listingId={listing.hash}
          trigger={
            <Flex>
             <Tooltip
                  content={
                    <Text style="body2" as="p">
                      Cancelling this order requires gas.
                    </Text>
                  }
                >
                  <Button
                    css={{
                      color: '$red11',
                      minWidth: '150px',
                      backgroundColor: '$gray6'
                    }}
                    color="gray3"
                  >
                    <FontAwesomeIcon
                      color="#697177"
                      icon={faGasPump}
                      width="16"
                      height="16"
                    />
                    Cancel Listing
                  </Button>
                </Tooltip>
            </Flex>
          }
          mutate={mutate}
        />
      )}
    </Grid>
  )
}
