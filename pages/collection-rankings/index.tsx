import { GetStaticProps, InferGetStaticPropsType, NextPage } from 'next'
import { Text, Flex, Box } from 'components/primitives'
import Layout from 'components/Layout'
import {
  ComponentPropsWithoutRef,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useMediaQuery } from 'react-responsive'
import { useMounted } from 'hooks'
import supportedChains from 'utils/chains'
import { CollectionRankingsTable } from 'components/rankings/CollectionRankingsTable'
import { useIntersectionObserver } from 'usehooks-ts'
import LoadingSpinner from 'components/common/LoadingSpinner'
import CollectionsTimeDropdown, {
  CollectionsSortingOption,
} from 'components/common/CollectionsTimeDropdown'
import ChainToggle from 'components/common/ChainToggle'
import { Head } from 'components/Head'
import { ChainContext } from 'context/ChainContextProvider'
import { useRouter } from 'next/router'
import { useQuery } from '@apollo/client'
import { GET_COLLECTIONS } from 'graphql/queries/collections'
import { Collection, Collection_OrderBy, OrderDirection } from '__generated__/graphql'
import { initializeApollo } from 'graphql/apollo-client'

type Props = InferGetStaticPropsType<typeof getStaticProps>

const IndexPage: NextPage<Props> = ({ ssr }) => {
  const router = useRouter()
  const isSSR = typeof window === 'undefined'
  const isMounted = useMounted()
  const compactToggleNames = useMediaQuery({ query: '(max-width: 800px)' })
  const [sortByTime, setSortByTime] =
    useState<CollectionsSortingOption>(Collection_OrderBy.Volume1d)

  const { chain, switchCurrentChain } = useContext(ChainContext)

  useEffect(() => {
    if (router.query.chain) {
      let chainIndex: number | undefined
      for (let i = 0; i < supportedChains.length; i++) {
        if (supportedChains[i].routePrefix == router.query.chain) {
          chainIndex = supportedChains[i].id
        }
      }
      if (chainIndex !== -1 && chainIndex) {
        switchCurrentChain(chainIndex)
      }
    }
  }, [router.query])


  const { data, loading, fetchMore } = useQuery(GET_COLLECTIONS, {
    variables: {
      skip: 0,
      first: 10,
      collection_OrderBy: sortByTime,
      orderDirection: OrderDirection.Desc
    }
  })

  let collections = data?.collections || ssr.collections

  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadMoreObserver = useIntersectionObserver(loadMoreRef, {})

  useEffect(() => {
    let isVisible = !!loadMoreObserver?.isIntersecting
    if (isVisible) {
      fetchMore({ variables: { skip: data?.collections.length || 0 }})
    }
  }, [loadMoreObserver?.isIntersecting])

  let volumeKey: ComponentPropsWithoutRef<
    typeof CollectionRankingsTable
  >['volumeKey'] = 'totalVolume'

  switch (sortByTime) {
    case Collection_OrderBy.Volume1d:
      volumeKey = 'day1Volume'
      break
    case Collection_OrderBy.Volume7d:
      volumeKey = 'day7Volume'
      break
    case Collection_OrderBy.Volume1m:
      volumeKey = 'monthVolume'
      break
    case Collection_OrderBy.VolumeMax:
      volumeKey = 'totalVolume'
      break
  }

  return (
    <Layout>
      <Head />
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            p: '$6',
          },
        }}
      >
        <Flex css={{ my: '$6', gap: 65 }} direction="column">
          <Flex
            justify="between"
            align="start"
            css={{
              flexDirection: 'column',
              gap: 24,
              '@bp800': {
                alignItems: 'center',
                flexDirection: 'row',
              },
            }}
          >
            <Text style="h4" as="h4">
              Collection Rankings
            </Text>
            <Flex align="center" css={{ gap: '$4' }}>
              <CollectionsTimeDropdown
                compact={compactToggleNames && isMounted}
                option={sortByTime}
                onOptionSelected={(option) => {
                  setSortByTime(option)
                }}
              />
              <ChainToggle />
            </Flex>
          </Flex>
          {isSSR || !isMounted ? null : (
            <CollectionRankingsTable
              collections={collections}
              volumeKey={volumeKey}
              loading={loading}
            />
          )}
          <Box
            ref={loadMoreRef}
            css={{
              display: loading ? 'none' : 'block',
            }}
          ></Box>
        </Flex>
        {(loading) && (
          <Flex align="center" justify="center" css={{ py: '$4' }}>
            <LoadingSpinner />
          </Flex>
        )}
      </Box>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps<{
  ssr: {
    collections: Collection[]
  }
}> = async () => {
  const apolloClient = initializeApollo()

  const { data } = await apolloClient.query({
    query: GET_COLLECTIONS,
    variables: {
      first: 10,
      skip: 0,
      collection_OrderBy: Collection_OrderBy.Volume1d,
      orderDirection: OrderDirection.Desc
    }
  })

  return {
    props: { ssr: { collections: data.collections || [] } },
    revalidate: 5,
  }
}

export default IndexPage
