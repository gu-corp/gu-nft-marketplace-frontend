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
import { MutatorCallback } from 'swr'
import { Address } from 'wagmi'
import { useMarketplaceChain } from 'hooks'
import { NAVBAR_HEIGHT } from 'components/navbar'
import { ChainContext } from 'context/ChainContextProvider'
import { PortfolioSortingOption } from 'components/common/PortfolioSortDropdown'
import { gql } from '__generated__'
import { useQuery } from '@apollo/client'
import { Token_OrderBy } from '__generated__/graphql'
import { Token } from 'types/workaround'
import { useNft } from 'use-nft'
import { GET_USER_TOKENS } from 'graphql/queries/tokens'

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

  const { data, loading, fetchMore } = useQuery(GET_USER_TOKENS, {
    variables: {
      first: 10,
      token_OrderBy: Token_OrderBy.TotalTransactions,
      where: {
        owner: address?.toLocaleLowerCase(),
        collection: filterCollection
      }
    }
  })
  const tokens = data?.tokens || []


  useEffect(() => {
    const isVisible = !!loadMoreObserver?.isIntersecting
    if (isVisible) {
      fetchMore({ variables: { skip: data?.tokens.length || 0 }})
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
                key={`${token.id}-${i}`}
                token={token}
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
}

const TokenTableRow: FC<TokenTableRowProps> = ({ token }) => {
  const isSmallDevice = useMediaQuery({ maxWidth: 900 })

  // TO-DO: remove later, should using token.image
  const { nft } = useNft(token.collection.id, token.tokenID)
  let imageSrc = nft?.image

  if (isSmallDevice) {
    return (
      <Flex
        key={token?.tokenID}
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
          href={`/collection/${token?.collection?.id}/${token?.tokenID}`}
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
                alt={`${token.collection.name}-${token?.tokenID}`}
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
                {token?.collection?.name}
              </Text>
              <Text style="subtitle2" ellipsify>
                #{token?.tokenID}
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
              amount={
                token?.collection?.floorAskPrice?.netAmount?.decimal
              }
              address={
                token?.collection?.floorAskPrice?.currency?.contract
              }
              decimals={
                token?.collection?.floorAskPrice?.currency?.decimals
              }
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
            />
          </Flex>
          <Flex direction="column" align="start" css={{ width: '100%' }}>
            <Text style="subtitle3" color="subtle">
              You Get
            </Text>
            <FormatCryptoCurrency
              amount={token?.topBid?.price?.netAmount?.native}
              textStyle="subtitle2"
              logoHeight={14}
            />
            {/* {token?.topBid?.price?.amount?.decimal && (
              <AcceptBid
                token={token as ReturnType<typeof useTokens>['data'][0]}
                collectionId={token?.collection?.id}
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
              />
            )} */}
          </Flex>
        </Flex>
      </Flex>
    )
  }

  return (
    <TableRow
      key={token?.tokenID}
      css={{ gridTemplateColumns: desktopTemplateColumns }}
    >
      <TableCell css={{ minWidth: 0 }}>
        <Link
          href={`/collection/${token?.collection?.id}/${token?.tokenID}`}
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
                alt={`${token?.name}`}
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
                  {token?.collection?.name}
                </Text>
                {token?.kind === 'erc1155' &&
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
                      {/* // TO-DO: must total token of user not collection total token */}
                        x{token?.collection?.totalTokens} 
                      </Text>
                    </Flex>
                  )}
              </Flex>
              <Text style="subtitle2" ellipsify>
                #{token?.tokenID}
              </Text>
            </Flex>
          </Flex>
        </Link>
      </TableCell>
      <TableCell>
        <FormatCryptoCurrency
          amount={token?.ownership?.floorAsk?.price?.amount?.decimal}
          textStyle="subtitle1"
          logoHeight={14}
        />
      </TableCell>
      <TableCell>
        <FormatCryptoCurrency
          amount={token?.collection?.floorAskPrice?.netAmount?.decimal}
          address={token?.collection?.floorAskPrice?.currency?.contract}
          decimals={token?.collection?.floorAskPrice?.currency?.decimals}
          textStyle="subtitle1"
          logoHeight={14}
        />
      </TableCell>
      <TableCell>
        <FormatCryptoCurrency
          amount={token?.topBid?.price?.netAmount?.native}
          address={token?.topBid?.price?.currency?.contract}
          decimals={token?.topBid?.price?.currency?.decimals}
          textStyle="subtitle1"
          logoHeight={14}
        />
      </TableCell>
      <TableCell>
        <Flex justify="end" css={{ gap: '$3' }}>
          {/* {token?.topBid?.price?.amount?.decimal && (
            <AcceptBid
              token={token as ReturnType<typeof useTokens>['data'][0]}
              collectionId={token?.collection?.id}
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
            />
          )} */}
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
