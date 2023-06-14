import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import { Text, Flex, Box } from '../../components/primitives'
import Layout from 'components/Layout'
import { useEffect, useMemo, useRef, useState } from 'react'
import { truncateAddress } from 'utils/truncate'
import StatHeader from 'components/collections/StatHeader'
import CollectionActions from 'components/collections/CollectionActions'
import TokenCard from 'components/collections/TokenCard'
import { AttributeFilters } from 'components/collections/filters/AttributeFilters'
import { FilterButton } from 'components/common/FilterButton'
import SelectedAttributes from 'components/collections/filters/SelectedAttributes'
import { CollectionOffer } from 'components/buttons'
import { Grid } from 'components/primitives/Grid'
import { useIntersectionObserver } from 'usehooks-ts'
import { useRouter } from 'next/router'
import { SortTokens } from 'components/collections/SortTokens'
import { useMediaQuery } from 'react-responsive'
import { TabsList, TabsTrigger, TabsContent } from 'components/primitives/Tab'
import * as Tabs from '@radix-ui/react-tabs'
import { NAVBAR_HEIGHT } from 'components/navbar'
import { CollectionActivityTable } from 'components/collections/CollectionActivityTable'
import { ActivityFilters } from 'components/common/ActivityFilters'
import { MobileAttributeFilters } from 'components/collections/filters/MobileAttributeFilters'
import { MobileActivityFilters } from 'components/common/MobileActivityFilters'
import LoadingCard from 'components/common/LoadingCard'
import { useMounted } from 'hooks'
import { NORMALIZE_ROYALTIES } from 'pages/_app'
import { faCopy, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import supportedChains, { DefaultChain } from 'utils/chains'
import { Head } from 'components/Head'
import CopyText from 'components/common/CopyText'
import { OpenSeaVerified } from 'components/common/OpenSeaVerified'
import { Address, useAccount } from 'wagmi'
import titleCase from 'utils/titleCase'
import Link from 'next/link'
import Img from 'components/primitives/Img'
import { addApolloState, initializeApollo } from 'graphql/apollo-client'
import { useQuery } from '@apollo/client'
import { ActivityType, AttributeKind, Collection, OrderDirection, Order_OrderBy, Token, Token_OrderBy } from '__generated__/graphql'
import { GET_COLLECTION } from 'graphql/queries/collections'
import { GET_TOKENS } from 'graphql/queries/tokens'
import { GET_ATTRIBUTES } from 'graphql/queries/attributes'

type ActivityTypes = ActivityType[]

type Props = InferGetStaticPropsType<typeof getStaticProps>

const CollectionPage: NextPage<Props> = ({ id, ssr: { collection } }) => {
  const router = useRouter()
  const { address } = useAccount()
  const [attributeFiltersOpen, setAttributeFiltersOpen] = useState(false)
  const [activityFiltersOpen, setActivityFiltersOpen] = useState(true)
  const [activityTypes, setActivityTypes] = useState<ActivityTypes>([ActivityType.SaleEvent])
  const [initialTokenFallbackData, setInitialTokenFallbackData] = useState(true)
  const isMounted = useMounted()
  const isSmallDevice = useMediaQuery({ maxWidth: 905 }) && isMounted
  const smallSubtitle = useMediaQuery({ maxWidth: 1150 }) && isMounted
  const [playingElement, setPlayingElement] = useState<
    HTMLAudioElement | HTMLVideoElement | null
  >()
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadMoreObserver = useIntersectionObserver(loadMoreRef, {})

  const scrollRef = useRef<HTMLDivElement | null>(null)

  const scrollToTop = () => {
    let top = (scrollRef.current?.offsetTop || 0) - (NAVBAR_HEIGHT + 16)
    window.scrollTo({ top: top })
  }

  const orderDirection = router.query['orderDirection']?.toString() || OrderDirection.Asc
  const orderBy = router.query['orderBy']?.toString() || Order_OrderBy.Price
  
  // Extract all queries of attribute type
  const attributesQueryMap = new Map()
  Object.keys({ ...router.query }).forEach((key) => {
    if (
      key.startsWith('attributes[') &&
      key.endsWith(']') &&
      router.query[key] !== ''
    ) {
      const attributeKey = /attributes\[(.*?)\]/.exec(key)?.[1]
      const attributeValue = router.query[key];
      attributesQueryMap.set(attributeKey, attributeValue)
    }
  })

  const attributesQuery = Array.from(attributesQueryMap.keys()).map((key) => ({
    key,
    values: attributesQueryMap.get(key)
  }))
  
  const { data, loading, fetchMore, refetch: mutate } = useQuery(GET_TOKENS, {
    variables: {
      first: 10,
      skip: 0,
      where: {
        collection: collection?.id,
        attributes: attributesQuery.length ? attributesQuery : undefined
      },
      orderDirection: orderDirection as OrderDirection,
      token_OrderBy: orderBy as Token_OrderBy
    }
  })

  const tokens = (data?.tokens || []) as Token[]

  const { data: attributesData } = useQuery(GET_ATTRIBUTES, {
    variables: {
      where: { collection: collection?.id } 
    }
  })


  const attributes = useMemo(() => {
    if (!attributesData?.attributes) {
      return []
    }
    return attributesData.attributes
      ?.filter(
        (attribute) => attribute.kind != AttributeKind.Number
      )
      .sort((a, b) => a.key.localeCompare(b.key))
  }, [attributesData?.attributes])

  if (attributeFiltersOpen && attributesData?.attributes && !attributes.length) {
    setAttributeFiltersOpen(false)
  }

  // const rarityEnabledCollection = Boolean(
  //   collection?.tokenCount &&
  //     +collection.tokenCount >= 2 &&
  //     attributes &&
  //     attributes?.length >= 2
  // )

  useEffect(() => {
    const isVisible = !!loadMoreObserver?.isIntersecting
    if (isVisible) {
      fetchMore({ variables: { skip: tokens.length }})
    }
  }, [loadMoreObserver?.isIntersecting])

  useEffect(() => {
    if (isMounted && initialTokenFallbackData) {
      setInitialTokenFallbackData(false)
    }
  }, [router.query])

  useEffect(() => {
    mutate()
  }, [orderBy, orderDirection])
  return (
    <Layout>
      <Head
        ogImage={collection?.image as string}
        title={collection?.name|| ""}
        description={collection?.description as string}
      />

      {collection ? (
        <Flex
          direction="column"
          css={{
            px: '$4',
            pt: '$5',
            pb: 0,
            '@sm': {
              px: '$5',
            },
          }}
        >
          <Flex justify="between" css={{ mb: '$4' }}>
            <Flex direction="column" css={{ gap: '$4', minWidth: 0 }}>
              <Flex css={{ gap: '$4', flex: 1 }} align="center">
                <Img
                  src={collection.image!}
                  width={64}
                  height={64}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    objectFit: 'cover',
                  }}
                  alt="Collection Page Image"
                />
                <Box css={{ minWidth: 0 }}>
                  <Flex align="center" css={{ gap: '$2' }}>
                    <Text style="h5" as="h6" ellipsify>
                      {collection.name}
                    </Text>
                  </Flex>

                  {!smallSubtitle && (
                    <Flex align="end" css={{ gap: 24 }}>
                      <CopyText
                        text={collection.id as string}
                        css={{ width: 'max-content' }}
                      >
                        <Flex css={{ gap: '$2', width: 'max-content' }}>
                          {!isSmallDevice && (
                            <Text style="body1" color="subtle">
                              Collection
                            </Text>
                          )}
                          <Text
                            style="body1"
                            color={isSmallDevice ? 'subtle' : undefined}
                            as="p"
                          >
                            {truncateAddress(collection.id as string)}
                          </Text>
                          <Box css={{ color: '$gray10' }}>
                            <FontAwesomeIcon
                              icon={faCopy}
                              width={16}
                              height={16}
                            />
                          </Box>
                        </Flex>
                      </CopyText>
                      <Box>
                        <Text style="body1" color="subtle">
                          Token Standard{' '}
                        </Text>
                        {/* TO-DO: support ERC1155 later */}
                        <Text style="body1">ERC721</Text>
                      </Box>
                      <Box>
                        <Text style="body1" color="subtle">
                          Chain{' '}
                        </Text>
                        <Link
                          href={`/collection-rankings`}
                        >
                          <Text style="body1">G.U Sandbox Chain</Text>
                        </Link>
                      </Box>
                      <Box>
                        <Text style="body1" color="subtle">
                          Creator Earnings
                        </Text>
                        {/* TO-DO: query royalty fee */}
                        <Text style="body1"> 0%</Text>
                      </Box>
                    </Flex>
                  )}
                </Box>
              </Flex>
            </Flex>
            <CollectionActions collection={collection} />
          </Flex>
          {smallSubtitle && (
            <Grid
              css={{
                gap: 12,
                mb: 24,
                gridTemplateColumns: '1fr 1fr',
                maxWidth: 550,
              }}
            >
              <CopyText
                text={collection.id as string}
                css={{ width: 'max-content' }}
              >
                <Flex css={{ width: 'max-content' }} direction="column">
                  <Text style="body1" color="subtle">
                    Collection
                  </Text>
                  <Flex css={{ gap: '$2' }}>
                    <Text style="body1" as="p">
                      {truncateAddress(collection.id as string)}
                    </Text>
                    <Box css={{ color: '$gray10' }}>
                      <FontAwesomeIcon icon={faCopy} width={16} height={16} />
                    </Box>
                  </Flex>
                </Flex>
              </CopyText>
              <Flex direction="column">
                <Text style="body1" color="subtle">
                  Token Standard{' '}
                </Text>
                {/* TO-DO: support ERC1155 later */}
                <Text style="body1">ERC721</Text>
              </Flex>
              <Flex direction="column">
                <Text style="body1" color="subtle">
                  Chain{' '}
                </Text>
                <Text style="body1">G.U Sandbox Chain</Text>
              </Flex>
              <Flex direction="column">
                <Text style="body1" color="subtle">
                  Creator Earnings
                </Text>
                  {/* TO-DO: query royalty fee */}
                <Text style="body1"> 0%</Text>
              </Flex>
            </Grid>
          )}
          <StatHeader collection={collection} tokens={tokens} />
          <Tabs.Root
            defaultValue="items"
            onValueChange={(value) => {
              if (value === 'items') {
                mutate()
              }
            }}
          >
            <TabsList>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="items">
              <Flex
                css={{
                  gap: attributeFiltersOpen ? '$5' : '',
                  position: 'relative',
                }}
                ref={scrollRef}
              >
                {isSmallDevice ? (
                  <MobileAttributeFilters
                    attributes={attributes}
                    scrollToTop={scrollToTop}
                  />
                ) : (
                  <AttributeFilters
                    attributes={attributes}
                    open={attributeFiltersOpen}
                    setOpen={setAttributeFiltersOpen}
                    scrollToTop={scrollToTop}
                  />
                )}
                <Box
                  css={{
                    flex: 1,
                    width: '100%',
                  }}
                >
                  <Flex justify="between" css={{ marginBottom: '$4' }}>
                    {attributes && attributes.length > 0 && !isSmallDevice && (
                      <FilterButton
                        open={attributeFiltersOpen}
                        setOpen={setAttributeFiltersOpen}
                      />
                    )}
                    <Flex
                      css={{
                        ml: 'auto',
                        width: '100%',
                        flexDirection: 'row-reverse',
                        gap: '$3',
                        '@md': {
                          flexDirection: 'row',
                          width: 'max-content',
                          gap: '$4',
                        },
                      }}
                    >
                      <SortTokens />
                      {/* <CollectionOffer
                        collection={collection}
                        buttonCss={{
                          width: '100%',
                          justifyContent: 'center',
                          '@sm': {
                            maxWidth: '220px',
                          },
                        }}
                      /> */}
                    </Flex>
                  </Flex>
                  {!isSmallDevice && <SelectedAttributes />}
                  <Grid
                    css={{
                      gap: '$4',
                      pb: '$6',
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(200px, 1fr))',
                      '@md': {
                        gridTemplateColumns:
                          'repeat(auto-fill, minmax(240px, 1fr))',
                      },
                    }}
                  >
                    {loading
                      ? Array(10)
                          .fill(null)
                          .map((_, index) => (
                            <LoadingCard key={`loading-card-${index}`} />
                          ))
                      : tokens.map((token, i) => (
                          <TokenCard
                            key={i}
                            token={token}
                            collection={collection}
                            orderQuantity={1}
                            address={address as Address}
                            mutate={mutate}
                            rarityEnabled={false}
                            onMediaPlayed={(e) => {
                              if (
                                playingElement &&
                                playingElement !== e.nativeEvent.target
                              ) {
                                playingElement.pause()
                              }
                              const element =
                                (e.nativeEvent.target as HTMLAudioElement) ||
                                (e.nativeEvent.target as HTMLVideoElement)
                              if (element) {
                                setPlayingElement(element)
                              }
                            }}
                          />
                        ))}
                    {/* <Box
                      ref={loadMoreRef}
                      css={{
                        display: loading ? 'none' : 'block',
                      }}
                    >
                      {!loading && <LoadingCard />}
                    </Box> */}
                    {/* TO-DOs: has more update later */}
                    {/* {
                      !loading && (
                        <>
                          {Array(6)
                            .fill(null)
                            .map((_, index) => (
                              <LoadingCard key={`loading-card-${index}`} />
                            ))}
                        </>
                      )} */}
                  </Grid>
                  {tokens.length == 0 && !loading && (
                    <Flex
                      direction="column"
                      align="center"
                      css={{ py: '$6', gap: '$4' }}
                    >
                      <Text css={{ color: '$gray11' }}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} size="2xl" />
                      </Text>
                      <Text css={{ color: '$gray11' }}>No items found</Text>
                    </Flex>
                  )}
                </Box>
              </Flex>
            </TabsContent>
            <TabsContent value="activity">
              <Flex
                css={{
                  gap: activityFiltersOpen ? '$5' : '',
                  position: 'relative',
                }}
              >
                {isSmallDevice ? (
                  <MobileActivityFilters
                    activityTypes={activityTypes}
                    setActivityTypes={setActivityTypes}
                  />
                ) : (
                  <ActivityFilters
                    open={activityFiltersOpen}
                    setOpen={setActivityFiltersOpen}
                    activityTypes={activityTypes}
                    setActivityTypes={setActivityTypes}
                  />
                )}
                <Box
                  css={{
                    flex: 1,
                    gap: '$4',
                    pb: '$5',
                  }}
                >
                  {!isSmallDevice && (
                    <FilterButton
                      open={activityFiltersOpen}
                      setOpen={setActivityFiltersOpen}
                    />
                  )}
                  <CollectionActivityTable
                    id={id}
                    activityTypes={activityTypes}
                  />
                </Box>
              </Flex>
            </TabsContent>
          </Tabs.Root>
        </Flex>
      ) : (
        <Box />
      )}
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
  ssr: { collection: Collection }
  id: string | undefined
}> = async ({ params }) => {
  const id = params?.contract?.toString()

  const apolloClient = initializeApollo()

  const { data } = await apolloClient.query({
    query: GET_COLLECTION,
    variables: {
      id: id?.toLocaleLowerCase() as string
    },
  })

  return addApolloState(apolloClient, {
    props: {
      ssr: { collection: data.collection },
      id 
    },
    revalidate: 30
  })
}

export default CollectionPage
