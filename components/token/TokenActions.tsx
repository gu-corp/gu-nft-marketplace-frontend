import { useQuery } from '@apollo/client'
import { faGasPump } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useBids, useTokens } from '@reservoir0x/reservoir-kit-ui'
import { Order, OrderDirection, Order_OrderBy, Token } from '__generated__/graphql'
import { AcceptBid, Bid, BuyNow, List } from 'components/buttons'
import AddToCart from 'components/buttons/AddToCart'
import CancelBid from 'components/buttons/CancelBid'
import CancelListing from 'components/buttons/CancelListing'
import { Button, Flex, Grid, Tooltip, Text } from 'components/primitives'
import { GET_ORDERS } from 'graphql/queries/orders'
import { useRouter } from 'next/router'
import { ComponentPropsWithoutRef, FC, useState } from 'react'
import { MutatorCallback } from 'swr'
import { useAccount } from 'wagmi'

type Props = {
  token: Token
  offer?: Order
  isOwner: boolean
  mutate?: MutatorCallback
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
  
  const is1155 = false

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

  const { data } = useQuery(GET_ORDERS, {
    variables: { 
      first: 1,
      skip: 0,
      order_OrderBy: Order_OrderBy.CreatedAt,
      orderDirection: OrderDirection.Desc,
      where: {
        collectionAddress: token.collection,
        tokenId: `${token.tokenId}`,
        isOrderAsk: true
      }
    }
  })

  const listing = data?.orders?.[0];
  const isListed = token && listing

  const { data: bidData } = useQuery(GET_ORDERS, {
    variables: { 
      first: 1,
      skip: 0,
      order_OrderBy: Order_OrderBy.Price,
      orderDirection: OrderDirection.Desc,
      where: {
        collectionAddress: token.collection,
        tokenId: `${token.tokenId}`,
        isOrderAsk: false
      }
    }
  })

  const topBid = bidData?.orders?.[0]

  const showAcceptOffer =
  !is1155 &&
  topBid &&
  isOwner &&
  token?.owner
    ? true
    : false

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
      {isOwner && !is1155 && (
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
      {(!isOwner || is1155) && isListed && (
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
          {/* <AddToCart
            token={token}
            buttonCss={{
              width: 52,
              p: 0,
              justifyContent: 'center',
            }}
            buttonProps={{ corners: 'square' }}
          /> */}
        </Flex>
      )}
      {showAcceptOffer && (
        <AcceptBid
          token={token}
          bidId={topBid?.hash}
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

      {(!isOwner || is1155) && (
        <Bid
          tokenId={token?.tokenId}
          collectionId={token?.collection}
          mutate={mutate}
          buttonCss={buttonCss}
        />
      )}

      {isTopBidder && !is1155 && (
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

      {isOwner && isListed && !is1155 && (
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
        />
      )}
    </Grid>
  )
}
