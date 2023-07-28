import {
  faExternalLink,
  faHand,
  faRightLeft,
  faSeedling,
  faShoppingCart,
  faTag,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import LoadingSpinner from 'components/common/LoadingSpinner'
import { constants } from 'ethers'
import { useENSResolver, useTimeSince } from 'hooks'
import Link from 'next/link'
import { FC, useEffect, useRef } from 'react'
import { useMediaQuery } from 'react-responsive'
import { useIntersectionObserver } from 'usehooks-ts'
import {
  Anchor,
  Box,
  Flex,
  FormatCryptoCurrency,
  TableCell,
  TableRow,
  Text,
} from '../primitives'
import { QueryResult, useQuery } from '@apollo/client'
import { Activity, ActivityType, Activity_FilterArgs, Exact, GetActivitiesQuery, InputMaybe } from '__generated__/graphql'
import { GET_ACTIVITIES } from 'graphql/queries/activities'
import { useNetwork } from 'wagmi'

type Props = {
  query: QueryResult<GetActivitiesQuery, Exact<{
    first?: InputMaybe<number> | undefined;
    skip?: InputMaybe<number> | undefined;
    where?: InputMaybe<Activity_FilterArgs> | undefined;
  }>>
}

type TokenActivityTableProps = {
  collection: string
  tokenId: string
  activityTypes: ActivityType[]
}

export const TokenActivityTable: FC<TokenActivityTableProps> = ({
  collection,
  tokenId,
  activityTypes,
}) => {
  const query = useQuery(GET_ACTIVITIES, {
    variables: {
      skip: 0,
      first: 10,
      where: {
        collection,
        tokenId,
        types: !activityTypes.length ? undefined: activityTypes,
      },      
    },
    skip: !collection || !tokenId
  })
  
  useEffect(() => {
    query.refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <ActivityTable query={query} />
}

export const ActivityTable: FC<Props> = ({ query }) => {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadMoreObserver = useIntersectionObserver(loadMoreRef, {})

  const activities = query.data?.activities || []

  useEffect(() => {
    const isVisible = !!loadMoreObserver?.isIntersecting
    if (isVisible) {
      query.fetchMore({
        variables: { skip: activities.length }
      })
    }
  }, [activities.length, loadMoreObserver?.isIntersecting, query])

  return (
    <>
      {!query.loading && activities.length === 0 ? (
        <Flex direction="column" align="center" css={{ py: '$6', gap: '$4' }}>
          <img
            src="/icons/activity-icon.svg"
            width={40}
            height={40}
            alt=''
          />
          <Text>No activity yet</Text>
        </Flex>
      ) : (
        <Flex
          direction="column"
          css={{
            height: query.loading ? '225px' : '450px',
            overflowY: 'auto',
            width: '100%',
            pb: '$2',
            pr: 15,
          }}
        >
          {activities.map((activity, i) => {
            if (!activity) return null

            return (
              <ActivityTableRow
                key={`${activity?.txHash}-${i}`}
                activity={activity}
              />
            )
          })}
          <Box ref={loadMoreRef} css={{ height: 20 }}></Box>
        </Flex>
      )}
      {query.loading && (
        <Flex
          align="center"
          justify="center"
          css={{
            py: '$5',
          }}
        >
          <LoadingSpinner />
        </Flex>
      )}
    </>
  )
}

type ActivityTableRowProps = {
  activity: Activity
}

type Logos = {
  [key: string]: JSX.Element
}

const logos: Logos = {
  transfer: <FontAwesomeIcon icon={faRightLeft} width={16} height={16} />,
  sale: <FontAwesomeIcon icon={faShoppingCart} width={16} height={16} />,
  mint: <FontAwesomeIcon icon={faSeedling} width={16} height={16} />,
  burned: <FontAwesomeIcon icon={faTrash} width={16} height={16} />,
  listing_canceled: <FontAwesomeIcon icon={faXmark} width={16} height={16} />,
  ask_cancel: <FontAwesomeIcon icon={faXmark} width={16} height={16} />,
  offer_canceled: <FontAwesomeIcon icon={faXmark} width={16} height={16} />,
  ask: <FontAwesomeIcon icon={faTag} width={16} height={16} />,
  bid: <FontAwesomeIcon icon={faHand} width={16} height={16} />,
}

type ActivityDescription = {
  [key: string]: string
}

const activityTypeToDesciptionMap: ActivityDescription = {
  [ActivityType.CancelListingEvent]: 'Listing Canceled',
  [ActivityType.CancelOfferEvent]: 'Offer Canceled',
  [ActivityType.MintEvent]: 'Mint',
  [ActivityType.ListingEvent]: 'List',
  [ActivityType.OfferEvent]: 'Offer',
  [ActivityType.NftTransferEvent]: 'Transfer',
  [ActivityType.SaleEvent]: 'Sale',
}

const activityTypeToDesciption = (activityType: string) => {
  return activityTypeToDesciptionMap[activityType] || activityType
}

const ActivityTableRow: FC<ActivityTableRowProps> = ({ activity }) => {
  const timeSince = useTimeSince(activity?.timestamp as number)
  const isSmallDevice = useMediaQuery({ maxWidth: 700 })
  const { chain } = useNetwork()
  const blockExplorerBaseUrl =
    chain?.blockExplorers?.default?.url || 'https://etherscan.io'

  let activityDescription = activityTypeToDesciption(activity?.type || '')

  const { displayName: toDisplayName } = useENSResolver(activity?.to as string)
  const { displayName: fromDisplayName } = useENSResolver(activity?.from as string)

  if (!activity) {
    return null
  }
  
  if (isSmallDevice) {
    return (
      <TableRow
        key={activity.txHash}
        css={{
          gridTemplateColumns: '0.75fr 1fr',
        }}
      >
        <TableCell css={{ color: '$gray11' }}>
          <Flex align="center">
            {activity.type && logos[activity.type]}
            <Text
              style="subtitle1"
              css={{ ml: '$2', color: '$gray11', fontSize: '14px' }}
            >
              {activityDescription}
            </Text>
          </Flex>
          {activity.order?.price ? (
            <Flex align="center">
              <FormatCryptoCurrency
                amount={activity.order?.price}
                logoHeight={16}
                textStyle="subtitle1"
                css={{ mr: '$2', fontSize: '14px' }}
              />
            </Flex>
          ) : (
            <span>-</span>
          )}
        </TableCell>
        <TableCell>
          <Flex
            align="center"
            justify="end"
            css={{
              gap: '$3',
            }}
          >
            <Text style="subtitle3" color="subtle">
              {timeSince}
            </Text>
            {activity.txHash && (
              <Anchor
                href={`${blockExplorerBaseUrl}/tx/${activity.txHash}`}
                color="primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FontAwesomeIcon icon={faExternalLink} width={12} height={15} />
              </Anchor>
            )}
          </Flex>
          <Flex
            align="baseline"
            justify="end"
            css={{
              gap: '$3',
            }}
          >
            {activity.from &&
            activity.from !== constants.AddressZero ? (
              <Link href={`/profile/${activity.from}`}>
                <Text
                  style="subtitle3"
                  css={{
                    color: '$primary11',
                    '&:hover': {
                      color: '$primary10',
                    },
                  }}
                >
                  {fromDisplayName}
                </Text>
              </Link>
            ) : (
              <span>-</span>
            )}
            <Text
              style="subtitle3"
              css={{ fontSize: '12px', color: '$gray11' }}
            >
              to
            </Text>
            {activity.to &&
            activity.to !== constants.AddressZero ? (
              <Link href={`/profile/${activity.to}`}>
                <Text
                  style="subtitle3"
                  css={{
                    color: '$primary11',
                    '&:hover': {
                      color: '$primary10',
                    },
                  }}
                >
                  {toDisplayName}
                </Text>
              </Link>
            ) : (
              <span>-</span>
            )}
          </Flex>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow
      key={activity.txHash}
      css={{
        gridTemplateColumns: '1fr 1fr',
      }}
    >
      <TableCell css={{ color: '$gray11' }}>
        <Flex align="center">
          {activity.type && logos[activity.type]}
          <Text
            style="subtitle1"
            css={{ ml: '$2', color: '$gray11', fontSize: '14px' }}
          >
            {activityDescription}
          </Text>
        </Flex>
        {activity.order?.price ? (
          <Flex align="center">
            <FormatCryptoCurrency
              amount={activity.order?.price}
              logoHeight={16}
              textStyle="subtitle1"
              css={{ mr: '$2', fontSize: '14px' }}
            />
          </Flex>
        ) : (
          <span>-</span>
        )}
      </TableCell>
      <TableCell>
        <Flex
          align="center"
          justify="end"
          css={{
            gap: '$3',
          }}
        >
          <Text style="subtitle3" color="subtle">
            {timeSince}
          </Text>
          {activity.txHash && (
            <Anchor
              href={`${blockExplorerBaseUrl}/tx/${activity.txHash}`}
              color="primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faExternalLink} width={12} height={15} />
            </Anchor>
          )}
        </Flex>
        <Flex
          justify="end"
          css={{
            gap: '$3',
          }}
        >
          {activity.from &&
          activity.from !== constants.AddressZero ? (
            <Link
              style={{
                display: 'flex',
              }}
              href={`/profile/${activity.from}`}
            >
              <Text
                style="subtitle3"
                css={{
                  color: '$primary11',
                  '&:hover': {
                    color: '$primary10',
                  },
                }}
              >
                {fromDisplayName}
              </Text>
            </Link>
          ) : (
            <span>-</span>
          )}
          <Text style="subtitle3" css={{ fontSize: '12px', color: '$gray11' }}>
            to
          </Text>
          {activity.to &&
          activity.to !== constants.AddressZero ? (
            <Link
              style={{
                display: 'flex',
              }}
              href={`/profile/${activity.to}`}
            >
              <Text
                style="subtitle3"
                css={{
                  color: '$primary11',
                  '&:hover': {
                    color: '$primary10',
                  },
                }}
              >
                {toDisplayName}
              </Text>
            </Link>
          ) : (
            <span>-</span>
          )}
        </Flex>
      </TableCell>
    </TableRow>
  )
}
