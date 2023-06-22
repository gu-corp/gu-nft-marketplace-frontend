import { FC, useContext, useEffect, useRef } from 'react'
import { useMediaQuery } from 'react-responsive'
import {
  Text,
  Flex,
  TableCell,
  TableRow,
  HeaderRow,
  Tooltip,
  FormatCryptoCurrency,
} from '../primitives'
import { List, AcceptBid } from 'components/buttons'
import Image from 'next/image'
import { useIntersectionObserver } from 'usehooks-ts'
import LoadingSpinner from '../common/LoadingSpinner'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBolt,
  faCircleInfo,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import { Address } from 'wagmi'
import { NAVBAR_HEIGHT } from 'components/navbar'
import { PortfolioSortingOption } from 'components/common/PortfolioSortDropdown'
import { QueryResult, useQuery } from '@apollo/client'
import { Token } from '__generated__/graphql'
import { GET_TOKENS } from 'graphql/queries/tokens'
import { GET_COLLECTION } from 'graphql/queries/collections'
import { BigNumber } from 'ethers'
import { GET_HIGHEST_BID, GET_LISTED } from 'graphql/queries/orders'

type Props = {
  address: Address | undefined
  filterCollection: string | undefined
  sortBy: PortfolioSortingOption
  isLoading?: boolean
}

const desktopTemplateColumns = '1.25fr repeat(3, .75fr) 1.5fr'

export const TokenTable: FC<Props> = ({
  address,
  isLoading,
  sortBy,
  filterCollection,
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadMoreObserver = useIntersectionObserver(loadMoreRef, {})

  const { data, loading, fetchMore, refetch: mutate } = useQuery(GET_TOKENS, {
    variables: {
      first: 20,
      where: {
        owner: address?.toLocaleLowerCase(),
        collection: filterCollection
      }
    },
    skip: !address
  })

  const tokens = (data?.tokens || []) as Token[]


  useEffect(() => {
    const isVisible = !!loadMoreObserver?.isIntersecting
    if (isVisible) {
      fetchMore({ variables: { skip: tokens.length }})
    }
  }, [loadMoreObserver?.isIntersecting])

  return (
    <>
      {!loading && tokens && tokens.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          css={{ py: '$6', gap: '$4', width: '100%' }}
        >
          <Text css={{ color: '$gray11' }}>
            <FontAwesomeIcon icon={faMagnifyingGlass} size="2xl" />
          </Text>
          <Text css={{ color: '$gray11' }}>No items found</Text>
        </Flex>
      ) : isLoading || loading ? (
        <Flex align="center" justify="center" css={{ py: '$6' }}>
          <LoadingSpinner />
        </Flex>
      ) : (
        <Flex direction="column" css={{ width: '100%' }}>
          <TableHeading />
          {tokens.map((token, i: number) => {
            if (!token) return null

            return (
              <TokenTableRow
                key={token.id}
                token={token}
                mutate={mutate}
              />
            )
          })}
          <div ref={loadMoreRef}></div>
        </Flex>
      )}
    </>
  )
}

type TokenTableRowProps = {
  token: Token
  mutate: QueryResult["refetch"]
}

const TokenTableRow: FC<TokenTableRowProps> = ({ token, mutate }) => {
  const isSmallDevice = useMediaQuery({ maxWidth: 900 })

  const { data } = useQuery(GET_COLLECTION, {
    variables: {
      id: token.collection
    },
    skip: !token.collection
  })

  const collection = data?.collection

  let imageSrc = token?.image || collection?.image as string

  const { data: listedData, refetch } = useQuery(GET_LISTED, {
    variables: {
      where: {
        collectionAddress: token.collection ,
        tokenId: token.tokenId
      }
    },
    skip: !token.tokenId || !token.collection
  })

  const ask = listedData?.listed;
  
  const { data: highestBidData } = useQuery(GET_HIGHEST_BID, {
    variables: {
      where: {
        collectionAddress: token.collection,
        tokenId: token.tokenId
      }
    },
    skip: !token.collection || !token.tokenId
  })
  
  const highestBid = highestBidData?.highestBid

  if (isSmallDevice) {
    return (
      <Flex
        key={token?.id}
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
        <Link
          href={`/collection/${token?.collection}/${token?.tokenId}`}
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
                alt={`${collection?.name}-${token?.tokenId}`}
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
              <Text style="subtitle3" ellipsify color="subtle">
                {collection?.name}
              </Text>
              <Text style="subtitle2" ellipsify>
                #{token?.tokenId}
              </Text>
            </Flex>
          </Flex>
        </Link>
        <Flex justify="between" css={{ width: '100%', gap: '$3' }}>
          <Flex direction="column" align="start" css={{ width: '100%' }}>
            <Text style="subtitle3" color="subtle">
              Net Floor
            </Text>
            <FormatCryptoCurrency
              amount={collection?.floor?.floorPrice}
              textStyle="subtitle2"
              logoHeight={14}
            />
            <List
              token={token}
              buttonCss={{
                width: '100%',
                maxWidth: '300px',
                justifyContent: 'center',
                px: '42px',
                backgroundColor: '$gray6',
                color: '$gray12',
                mt: '$2',
                '&:hover': {
                  backgroundColor: '$gray4',
                },
              }}
              buttonChildren="List"
              mutate={mutate}
            />
          </Flex>
          <Flex direction="column" align="start" css={{ width: '100%' }}>
            <Text style="subtitle3" color="subtle">
              You Get
            </Text>
            <FormatCryptoCurrency
              amount={highestBid?.price}
              textStyle="subtitle2"
              logoHeight={14}
            />
            {highestBid && (
              <AcceptBid
                bidId={highestBid.hash} 
                token={token}
                collectionId={token?.collection}
                buttonCss={{
                  width: '100%',
                  maxWidth: '300px',
                  justifyContent: 'center',
                  px: '32px',
                  backgroundColor: '$primary9',
                  color: 'white',
                  mt: '$2',
                  '&:hover': {
                    backgroundColor: '$primary10',
                  },
                }}
                buttonChildren={
                  <Flex align="center" css={{ gap: '$2' }}>
                    <FontAwesomeIcon icon={faBolt} />
                    Sell
                  </Flex>
                }
                mutate={mutate}
              />
            )}
          </Flex>
        </Flex>
      </Flex>
    )
  }

  return (
    <TableRow
      key={token?.tokenId}
      css={{ gridTemplateColumns: desktopTemplateColumns }}
    >
      <TableCell css={{ minWidth: 0 }}>
        <Link
          href={`/collection/${token?.collection}/${token?.tokenId}`}
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
                alt={`${token?.tokenId}`}
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
              <Flex justify="between" css={{ gap: '$2' }}>
                <Text style="subtitle3" ellipsify color="subtle">
                  {collection?.name}
                </Text>
                {/* {token?.kind === 'erc1155' &&
                  token?.ownership?.tokenCount && (
                    <Flex
                      justify="center"
                      align="center"
                      css={{
                        borderRadius: 9999,
                        backgroundColor: '$gray4',
                        maxWidth: '50%',
                      }}
                    >
                      <Text
                        ellipsify
                        style="subtitle3"
                        css={{ px: '$2', fontSize: 10 }}
                    >
                        x{token?.collection?.totalTokens} 
                      </Text>
                    </Flex>
                  )} 
                    */}
              </Flex>
              <Text style="subtitle2" ellipsify>
                #{token?.tokenId}
              </Text>
            </Flex>
          </Flex>
        </Link>
      </TableCell>
      <TableCell>
        <FormatCryptoCurrency
          amount={ask?.price}
          textStyle="subtitle1"
          logoHeight={14}
        />
      </TableCell>
      <TableCell>
        <FormatCryptoCurrency
          amount={collection?.floor?.floorPrice}
          textStyle="subtitle2"
          logoHeight={14}
        />
      </TableCell>
      <TableCell>
        <FormatCryptoCurrency
          amount={highestBid?.price}
          address={highestBid?.currencyAddress}
          textStyle="subtitle1"
          logoHeight={14}
        />
      </TableCell>
      <TableCell>
        <Flex justify="end" css={{ gap: '$3' }}>
          {highestBid && (
            <AcceptBid
              bidId={highestBid.hash}
              token={token}
              collectionId={token?.collection}
              buttonCss={{
                px: '32px',
                backgroundColor: '$primary9',
                color: 'white',
                '&:hover': {
                  backgroundColor: '$primary10',
                },
              }}
              buttonChildren={
                <Flex align="center" css={{ gap: '$2' }}>
                  <FontAwesomeIcon icon={faBolt} />
                  Sell
                </Flex>
              }
              mutate={mutate}
            />
          )}
          <List
            token={token}
            buttonCss={{
              px: '42px',
              backgroundColor: '$gray6',
              color: '$gray12',
              '&:hover': {
                backgroundColor: '$gray4',
              },
            }}
            buttonChildren="List"
          />
        </Flex>
      </TableCell>
    </TableRow>
  )
}

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
    <TableCell>
      <Text style="subtitle3" color="subtle">
        Items
      </Text>
    </TableCell>
    <TableCell>
      <Text style="subtitle3" color="subtle">
        Listed Price
      </Text>
    </TableCell>
    <TableCell>
      <Flex align="center" css={{ gap: '$2' }}>
        <Text style="subtitle3" color="subtle">
          Net Floor
        </Text>
        <Tooltip
          content={
            <Flex>
              <Text style="body2" css={{ mx: '$2', maxWidth: '200px' }}>
                The floor price with royalties and fees removed. This is the eth
                you would receive if you listed at the floor.
              </Text>
            </Flex>
          }
        >
          <Text css={{ color: '$gray9' }}>
            <FontAwesomeIcon icon={faCircleInfo} width={12} height={12} />
          </Text>
        </Tooltip>
      </Flex>
    </TableCell>
    <TableCell>
      <Flex align="center" css={{ gap: '$2' }}>
        <Text style="subtitle3" color="subtle">
          You Get
        </Text>
        <Tooltip
          content={
            <Flex>
              <Text style="body2" css={{ mx: '$2', maxWidth: '200px' }}>
                The eth you would receive if you sold instantly.
              </Text>
            </Flex>
          }
        >
          <Text css={{ color: '$gray9' }}>
            <FontAwesomeIcon icon={faCircleInfo} width={12} height={12} />
          </Text>
        </Tooltip>
      </Flex>
    </TableCell>
    <TableCell></TableCell>
  </HeaderRow>
)
