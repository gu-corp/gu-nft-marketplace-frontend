import { FC, useContext, useEffect, useRef } from 'react'
import { useMediaQuery } from 'react-responsive'
import {
  Text,
  Flex,
  TableCell,
  TableRow,
  HeaderRow,
  FormatCryptoCurrency,
  Anchor,
  Button,
  Box,
  Tooltip,
} from '../primitives'
import Image from 'next/image'
import { useIntersectionObserver } from 'usehooks-ts'
import LoadingSpinner from '../common/LoadingSpinner'
import Link from 'next/link'
import { MutatorCallback } from 'swr'
import { useMarketplaceChain, useTimeSince } from 'hooks'
import CancelBid from 'components/buttons/CancelBid'
import { Address } from 'wagmi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGasPump, faHand } from '@fortawesome/free-solid-svg-icons'
import { NAVBAR_HEIGHT } from 'components/navbar'
import { GET_ORDER_LISTINGS } from 'graphql/queries/orders'
import { Order, OrderDirection, Order_OrderBy } from '__generated__/graphql'
import { useQuery } from '@apollo/client'
import { useNft } from 'use-nft'
import { GET_COLLECTION } from 'graphql/queries/collections'
import { GET_TOKEN } from 'graphql/queries/tokens'

type Props = {
  address: Address | undefined
}

const desktopTemplateColumns = '1.25fr .75fr repeat(3, 1fr)'

export const OffersTable: FC<Props> = ({ address }) => {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadMoreObserver = useIntersectionObserver(loadMoreRef, {})

  const { data, loading, fetchMore, refetch } = useQuery(GET_ORDER_LISTINGS, {
    variables: { 
      first: 10,
      skip: 0,
      order_OrderBy: Order_OrderBy.CreatedAt,
      orderDirection: OrderDirection.Desc,
      where: {
        signer: address?.toLowerCase(),
        isOrderAsk: false
      }
    }
  })

  const offers = data?.orders || [] 


  useEffect(() => {
    const isVisible = !!loadMoreObserver?.isIntersecting
    if (isVisible) {
      fetchMore({ 
        variables: {
          skip: offers.length
        }
      })
    }
  }, [loadMoreObserver?.isIntersecting])

  useEffect(() => {
    refetch()
  }, [])

  return (
    <>
      {!loading && offers && offers.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          css={{ py: '$6', gap: '$4', width: '100%' }}
        >
          <Text css={{ color: '$gray11' }}>
            <FontAwesomeIcon icon={faHand} size="2xl" />
          </Text>
          <Text css={{ color: '$gray11' }}>No offers made yet</Text>
        </Flex>
      ) : (
        <Flex direction="column" css={{ width: '100%', pb: '$2' }}>
          <TableHeading />
          {offers.map((offer, i) => {
            return (
              <OfferTableRow
                key={`${offer.hash}-${i}`}
                offer={offer as Order}
              />
            )
          })}
          <Box ref={loadMoreRef} css={{ height: 20 }}></Box>
        </Flex>
      )}
      {loading && (
        <Flex align="center" justify="center" css={{ py: '$5' }}>
          <LoadingSpinner />
        </Flex>
      )}
    </>
  )
}

type OfferTableRowProps = {
  offer: Order
  mutate?: MutatorCallback
}

const OfferTableRow: FC<OfferTableRowProps> = ({ offer, mutate }) => {
  const isSmallDevice = useMediaQuery({ maxWidth: 900 })
  const expiration = useTimeSince(
    offer?.endTime ? Number(offer.endTime) : 0
  )

  const { data: tokenData } = useQuery(GET_TOKEN, {
    variables: { id: `${offer.collectionAddress}-${offer.tokenId}`}
  })

  const { data: collectionData } = useQuery(GET_COLLECTION, {
    variables: { id: offer.collectionAddress as string}
  })

  const collection = collectionData?.collection
  const token = tokenData?.token

  // TO-DO: remove later, should using token.image
  const { nft } = useNft(offer.collectionAddress, offer.tokenId)
  
  let imageSrc: string = (
    nft?.image
  ) as string

  if (isSmallDevice) {
    return (
      <Flex
        key={offer?.hash}
        direction="column"
        align="start"
        css={{
          gap: '$3',
          borderBottom: '1px solid $gray3',
          py: '$3',
          width: '100%',
          overflow: 'hidden',
          flex: 1,
        }}
      >
        <Flex justify="between" css={{ width: '100%' }}>
          <Link
            href={`/collection/${offer?.collectionAddress}/${offer?.tokenId}`}
          >
            <Flex align="center">
              {imageSrc && (
                <Image
                  style={{
                    borderRadius: '4px',
                    objectFit: 'cover',
                    aspectRatio: '1/1',
                  }}
                  loader={({ src }) => src}
                  src={imageSrc}
                  alt={`${offer?.hash}`}
                  width={36}
                  height={36}
                />
              )}
              <Flex
                direction="column"
                css={{
                  ml: '$2',
                  overflow: 'hidden',
                  minWidth: 0,
                }}
              >
                <Text style="subtitle3" ellipsify css={{ color: '$gray11' }}>
                  {collection?.name}
                </Text>
                <Text style="subtitle2" ellipsify>
                  #{token?.tokenId}
                </Text>
              </Flex>
            </Flex>
          </Link>
          <FormatCryptoCurrency
            amount={offer?.price}
            address={offer?.currencyAddress}
            textStyle="subtitle2"
            logoHeight={14}
          />
        </Flex>
        <Flex justify="between" align="center" css={{ width: '100%' }}>
          <Flex align="center" css={{ gap: '$2' }}>
            <Text style="subtitle2">{expiration}</Text>
          </Flex>
          <CancelBid
            bidId={offer?.hash as string}
            mutate={mutate}
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
                      justifyContent: 'center',
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
                    Cancel
                  </Button>
                </Tooltip>
              </Flex>
            }
          />
        </Flex>
      </Flex>
    )
  }

  return (
    <TableRow
      key={offer?.hash}
      css={{ gridTemplateColumns: desktopTemplateColumns }}
    >
      <TableCell css={{ minWidth: 0 }}>
        <Link
          href={`/collection/${offer?.collectionAddress}/${offer?.tokenId}`}
        >
          <Flex align="center">
            {imageSrc && (
              <Image
                style={{
                  borderRadius: '4px',
                  objectFit: 'cover',
                  aspectRatio: '1/1',
                }}
                loader={({ src }) => src}
                src={imageSrc}
                alt={`${collection?.name}`}
                width={48}
                height={48}
              />
            )}
            <Flex
              direction="column"
              css={{
                ml: '$2',
                overflow: 'hidden',
              }}
            >
              <Text style="subtitle3" ellipsify css={{ color: '$gray11' }}>
                {collection?.name}
              </Text>
              <Text style="subtitle2" ellipsify>
                #{token?.tokenId}
              </Text>
            </Flex>
          </Flex>
        </Link>
      </TableCell>
      <TableCell>
        <FormatCryptoCurrency
          amount={offer?.price}
          address={offer?.currencyAddress}
          textStyle="subtitle2"
          logoHeight={14}
        />
      </TableCell>
      <TableCell>
        <Text style="subtitle2">{expiration}</Text>
      </TableCell>

      <TableCell>
        <Flex justify="end">
          <CancelBid
            bidId={offer?.hash as string}
            mutate={mutate}
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
                        justifyContent: 'center',
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
                      Cancel
                    </Button>
                  </Tooltip>
              </Flex>
            }
          />
        </Flex>
      </TableCell>
    </TableRow>
  )
}

const headings = ['Items', 'Offer Amount', 'Expiration', '']

const TableHeading = () => (
  <HeaderRow
    css={{
      display: 'none',
      '@md': { display: 'grid' },
      gridTemplateColumns: desktopTemplateColumns,
      position: 'sticky',
      top: NAVBAR_HEIGHT,
      backgroundColor: '$neutralBg',
    }}
  >
    {headings.map((heading) => (
      <TableCell key={heading}>
        <Text style="subtitle3" color="subtle">
          {heading}
        </Text>
      </TableCell>
    ))}
  </HeaderRow>
)
