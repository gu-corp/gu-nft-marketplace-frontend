import {
  faArrowLeft,
  faChevronDown,
  faCircleExclamation,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as Tabs from '@radix-ui/react-tabs'
import { ActivityFilters } from 'components/token/ActivityFilters'
import { spin } from 'components/common/LoadingSpinner'
import { MobileActivityFilters } from 'components/common/MobileActivityFilters'
import { OpenSeaVerified } from 'components/common/OpenSeaVerified'
import Layout from 'components/Layout'
import {
  Anchor,
  Box,
  Button,
  Flex,
  Grid,
  Text,
  Tooltip,
} from 'components/primitives'
import { Dropdown } from 'components/primitives/Dropdown'
import { TabsContent, TabsList, TabsTrigger } from 'components/primitives/Tab'
import AttributeCard from 'components/token/AttributeCard'
import FullscreenMedia from 'components/token/FullscreenMedia'
import { PriceData } from 'components/token/PriceData'
import RarityRank from 'components/token/RarityRank'
import { TokenActions } from 'components/token/TokenActions'
import { TokenActivityTable } from 'components/token/ActivityTable'
import { TokenInfo } from 'components/token/TokenInfo'
import { ToastContext } from 'context/ToastContextProvider'
import { useENSResolver, useMarketplaceChain, useMounted } from 'hooks'
import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { NORMALIZE_ROYALTIES } from 'pages/_app'
import { useContext, useEffect, useState } from 'react'
import { jsNumberForAddress } from 'react-jazzicon'
import Jazzicon from 'react-jazzicon/dist/Jazzicon'
import { useMediaQuery } from 'react-responsive'
import supportedChains, { DefaultChain } from 'utils/chains'
import { DATE_REGEX, timeTill } from 'utils/till'
import titleCase from 'utils/titleCase'
import { useAccount } from 'wagmi'
import { Head } from 'components/Head'
import { gql } from '__generated__'
import { initializeApollo } from 'graphql/apollo-client'
import TokenMedia from 'components/@reservoir0x/components/TokenMedia'
import { ActivityType, Collection, Order, OrderDirection, Order_OrderBy, Token } from '__generated__/graphql'
import { GET_TOKEN, REFRESH_TOKEN_METADATA } from 'graphql/queries/tokens'
import { GET_COLLECTION } from 'graphql/queries/collections'
import { useMutation, useQuery } from '@apollo/client'
import { GET_ORDERS } from 'graphql/queries/orders'

type Props = InferGetStaticPropsType<typeof getStaticProps>

type ActivityTypes = ActivityType[]

const IndexPage: NextPage<Props> = ({ id, collectionId, ssr  }) => {
  const router = useRouter()
  const { addToast } = useContext(ToastContext)
  const account = useAccount()
  const isMounted = useMounted()
  const isSmallDevice = useMediaQuery({ maxWidth: 900 }) && isMounted
  const [tabValue, setTabValue] = useState('info')

  const [activityFiltersOpen, setActivityFiltersOpen] = useState(true)
  const [activityTypes, setActivityTypes] = useState<ActivityTypes>([])

  const contract = collectionId ? collectionId?.split(':')[0] : undefined
  
  const [refreshTokenMetadata, { loading: isRefreshing }] = useMutation(REFRESH_TOKEN_METADATA);

  const { data: tokenData, refetch: mutate } = useQuery(GET_TOKEN, {
    variables: { id: `${contract?.toLowerCase()}-${id}` }
  });

  const { data: collectionData } = useQuery(GET_COLLECTION, {
    variables: { id: contract as string }
  })

  const { data } = useQuery(GET_ORDERS, {
    variables: {
      skip: 0,
      first: 1,
      order_OrderBy: Order_OrderBy.Price,
      orderDirection: OrderDirection.Desc,
      where: {
        isOrderAsk: false,
        collectionAddress: contract?.toLowerCase(),
        tokenId: id as string
      }
    }
  })
  const token = (tokenData?.token || ssr.token) as Token
  const collection = (collectionData?.collection || ssr.collection) as Collection

  const offer = data?.orders?.[0] as Order

  const hasAttributes = token?.attributes && token?.attributes?.length > 0
  const is1155 = false
  const isOwner = account.address?.toLowerCase() === token?.owner?.toLowerCase()
  const owner = isOwner ? account.address?.toLowerCase() : token?.owner?.toLowerCase()
  const { displayName: ownerFormatted } = useENSResolver(token?.owner)

  const tokenName = `${`#${token?.tokenId}`}`
  
  const trigger = (
    <Button
      color="gray3"
      size="small"
      css={{
        justifyContent: 'space-between',
        width: '336px',
        px: '$2',
        py: '$2',
      }}
    >
      {isSmallDevice ? null : (
        <Text style="body1">
          {activityTypes.map(titleCase).join(', ') || 'All Events'}
        </Text>
      )}
      <Text css={{ color: '$slate10' }}>
        <FontAwesomeIcon icon={faChevronDown} width={16} height={16} />
      </Text>
    </Button>
  )

  useEffect(() => {
    let tab = tabValue
    const hasAttributesTab = isMounted && isSmallDevice && hasAttributes
    if (hasAttributesTab) {
      tab = 'attributes'
    } else {
      tab = 'info'
    }

    let deeplinkTab: string | null = null
    if (typeof window !== 'undefined') {
      const params = new URL(window.location.href).searchParams
      deeplinkTab = params.get('tab')
    }

    if (deeplinkTab) {
      switch (deeplinkTab) {
        case 'attributes':
          if (hasAttributesTab) {
            tab = 'attributes'
          }
          break
        case 'info':
          tab = 'info'
          break
        case 'activity':
          tab = 'activity'
          break
      }
    }
    setTabValue(tab)
  }, [isSmallDevice])

  useEffect(() => {
    router.query.tab = tabValue
    router.push(router, undefined, { shallow: true })
  }, [tabValue])

  // const pageTitle = token?.name
  //   ? token.collection.name
  //   : `${token?.tokenID} - ${token?.collection?.name}`
  const pageTitle = `${collection.symbol}-${token.tokenId}`

  return (
    <Layout>
      <Head
        ogImage={token?.image || collection?.image as string}
        title={pageTitle}
        description={collection?.description as string}
      />
      <Flex
        justify="center"
        css={{
          maxWidth: 1175,
          mt: 10,
          pb: 100,
          marginLeft: 'auto',
          marginRight: 'auto',
          px: '$1',
          gap: 20,
          flexDirection: 'column',
          alignItems: 'center',
          '@md': {
            mt: 48,
            px: '$3',
            flexDirection: 'row',
            gap: 40,
            alignItems: 'flex-start',
          },
          '@lg': {
            gap: 80,
          },
        }}
      >
        <Flex
          direction="column"
          css={{
            maxWidth: '100%',
            flex: 1,
            width: '100%',
            '@md': { maxWidth: 445 },
            position: 'relative',
            '@sm': {
              '>button': {
                height: 0,
                opacity: 0,
                transition: 'opacity .3s',
              },
            },
            ':hover >button': {
              opacity: 1,
              transition: 'opacity .3s',
            },
          }}
        >
          <Box
            css={{
              backgroundColor: '$gray3',
              borderRadius: 8,
              '@sm': {
                button: {
                  height: 0,
                  opacity: 0,
                  transition: 'opacity .3s',
                },
              },
              ':hover button': {
                opacity: 1,
                transition: 'opacity .3s',
              },
            }}
          >
            <TokenMedia
              token={token}
              videoOptions={{ autoPlay: true, muted: true }}
              style={{
                width: '100%',
                height: 'auto',
                minHeight: isMounted && isSmallDevice ? 300 : 445,
                borderRadius: 8,
                overflow: 'hidden',
              }}
              onRefreshToken={() => {
                mutate?.()
                addToast?.({
                  title: 'Refresh token',
                  description: 'Request to refresh this token was accepted.',
                })
              }}
            />
            <FullscreenMedia token={token} />
          </Box>

          {token?.attributes && !isSmallDevice && (
            <Grid
              css={{
                maxWidth: '100%',
                width: '100%',
                gridTemplateColumns: '1fr 1fr',
                gap: '$3',
                mt: 24,
              }}
            >
              {token?.attributes?.map((attribute: any) => (
                <AttributeCard
                  key={`${attribute.key}-${attribute.value}`}
                  attribute={attribute}
                  collectionTokenCount={collection?.totalTokens || 0}
                  collectionId={collection?.id}
                />
              ))}
            </Grid>
          )}
        </Flex>
        <Flex
          direction="column"
          css={{
            flex: 1,
            px: '$4',
            width: '100%',
            '@md': {
              px: 0,
              maxWidth: '60%',
              overflow: 'hidden',
            },
          }}
        >
          <Flex justify="between" align="center" css={{ mb: 20 }}>
            <Flex align="center" css={{ mr: '$2', gap: '$2' }}>
              <Link
                href={`/collection/${token?.collection}`}
                legacyBehavior={true}
              >
                <Anchor
                  color="primary"
                  css={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '$2',
                  }}
                >
                  <FontAwesomeIcon icon={faArrowLeft} height={16} />
                  <Text css={{ color: 'inherit' }} style="subtitle1" ellipsify>
                    {collection?.name}
                  </Text>
                </Anchor>
              </Link>
              {/* <OpenSeaVerified
                openseaVerificationStatus={
                  collection?.openseaVerificationStatus
                }
              /> */}
            </Flex>
            <Button
              onClick={(e) => {
                if (isRefreshing) {
                  e.preventDefault()
                  return
                }
                mutate?.()
                refreshTokenMetadata({
                  variables: {
                    args: {
                      collection: contract as string,
                      tokenId: id as string
                    }
                    }
                }).then(() => {
                  addToast?.({
                    title: 'Refresh token',
                    description:
                      'Request to refresh this token was accepted.',
                  })
                }).catch(e => {
                  addToast?.({
                    title: 'Refresh token failed',
                    description: 'This token was recently refreshed. Please try again later.',
                  })
                  throw e
                })
              }}
              disabled={isRefreshing}
              color="gray3"
              size="xs"
              css={{ cursor: isRefreshing ? 'not-allowed' : 'pointer' }}
            >
              <Box
                css={{
                  animation: isRefreshing
                    ? `${spin} 1s cubic-bezier(0.76, 0.35, 0.2, 0.7) infinite`
                    : 'none',
                }}
              >
                <FontAwesomeIcon icon={faRefresh} width={16} height={16} />
              </Box>
            </Button>
          </Flex>
          <Flex align="center" css={{ gap: '$2' }}>
            <Text style="h4" css={{ wordBreak: 'break-all' }}>
              {tokenName}
            </Text>
          </Flex>
          {token && (
            <>
              {!is1155 && (
                <Flex align="center" css={{ mt: '$2' }}>
                  <Text style="subtitle3" color="subtle" css={{ mr: '$2' }}>
                    Owner
                  </Text>
                  <Jazzicon
                    diameter={16}
                    seed={jsNumberForAddress(owner || '')}
                  />
                  <Link href={`/profile/${owner}`} legacyBehavior={true}>
                    <Anchor color="primary" weight="normal" css={{ ml: '$1' }}>
                      {isMounted ? ownerFormatted : ''}
                    </Anchor>
                  </Link>
                </Flex>
              )}
              {/* <RarityRank
                token={token}
                collection={collection}
                collectionAttributes={attributesData?.data}
              /> */}
              <PriceData token={token} />
              {isMounted && (
                <TokenActions
                  token={token}
                  offer={offer}
                  isOwner={isOwner}
                  mutate={mutate}
                  account={account}
                />
              )}
              <Tabs.Root
                defaultValue=""
                value={tabValue}
                onValueChange={(value) => setTabValue(value)}
                style={{
                  paddingRight: 15,
                }}
              >
                <TabsList>
                  {isMounted && isSmallDevice && hasAttributes && (
                    <TabsTrigger value="attributes">Attributes</TabsTrigger>
                  )}
                  <TabsTrigger value="info">Info</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="attributes">
                  {token?.attributes && (
                    <Grid
                      css={{
                        gap: '$3',
                        mt: 24,
                        gridTemplateColumns: '1fr',
                        '@sm': {
                          gridTemplateColumns: '1fr 1fr',
                        },
                      }}
                    >
                      {token?.attributes?.map((attribute) => (
                        <AttributeCard
                          key={`${attribute.key}-${attribute.value}`}
                          attribute={attribute}
                          collectionTokenCount={collection?.totalTokens || 0}
                          collectionId={collection?.id}
                        />
                      ))}
                    </Grid>
                  )}
                </TabsContent>
                <TabsContent value="info">
                  {collection && (
                    <TokenInfo token={token} collection={collection} />
                  )}
                </TabsContent>
                <TabsContent value="activity" css={{ mr: -15 }}>
                  {isSmallDevice ? (
                    <MobileActivityFilters
                      activityTypes={activityTypes}
                      setActivityTypes={setActivityTypes}
                    />
                  ) : (
                    <Dropdown
                      trigger={trigger}
                      contentProps={{
                        sideOffset: 8,
                      }}
                    >
                      <ActivityFilters
                        open={activityFiltersOpen}
                        setOpen={setActivityFiltersOpen}
                        activityTypes={activityTypes}
                        setActivityTypes={setActivityTypes}
                      />
                    </Dropdown>
                  )}
                  <TokenActivityTable
                    collection={contract as string}
                    tokenId={`${token?.tokenId}`}
                    activityTypes={activityTypes}
                  />
                </TabsContent>
              </Tabs.Root>
            </>
          )}
        </Flex>
      </Flex>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<{
  id?: string
  collectionId?: string
  ssr: {
    token: Token
    collection: Collection
  }
}> = async ({ params }) => {
  let collectionId = params?.contract?.toString()
  const id = params?.id?.toString()

  const contract = collectionId ? collectionId?.split(':')[0] : undefined
  const tokenIdQuery = `${contract?.toLocaleLowerCase()}-${id}`

  const apolloClient = initializeApollo()

  const { data: tokenData } = await apolloClient.query({
    query: GET_TOKEN,
    variables: {
      id: tokenIdQuery
    },
  })

  const { data: collectionData } = await apolloClient.query({
    query: GET_COLLECTION,
    variables: {
      id: contract as string
    },
  })

  return {
    props: {
      collectionId, id, ssr: {
        token: tokenData?.token as Token,
        collection: collectionData.collection
      }
    },
    revalidate: 20,
  }
}

export default IndexPage
