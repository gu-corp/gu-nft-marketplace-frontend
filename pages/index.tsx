import { InferGetStaticPropsType, NextPage } from 'next'
import { Text, Flex, Box, Button } from 'components/primitives'
import Layout from 'components/Layout'
import { ComponentPropsWithoutRef, useEffect, useState } from 'react'
import { Footer } from 'components/home/Footer'
import { useMediaQuery } from 'react-responsive'
import { useMounted } from 'hooks'
import Link from 'next/link'
import ChainToggle from 'components/common/ChainToggle'
import CollectionsTimeDropdown, {
  CollectionsSortingOption,
} from 'components/common/CollectionsTimeDropdown'
import { Head } from 'components/Head'
import { CollectionRankingsTable } from 'components/rankings/CollectionRankingsTable'
import { GET_COLLECTIONS } from 'graphql/queries/collections'
import { initializeApollo } from 'graphql/apollo-client'
import { Collection_OrderBy, OrderDirection } from '__generated__/graphql'
import { useQuery } from '@apollo/client'

type Props = InferGetStaticPropsType<typeof getServerSideProps>

const IndexPage: NextPage<Props> = ({ ssr }) => {
  const isSSR = typeof window === 'undefined'
  const isMounted = useMounted()
  const compactToggleNames = useMediaQuery({ query: '(max-width: 800px)' })
  const [sortByTime, setSortByTime] =
    useState<CollectionsSortingOption>(Collection_OrderBy.Volume1d)

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

  const { data, loading } = useQuery(GET_COLLECTIONS, {
    variables: {
      skip: 0,
      first: 10, 
      collection_OrderBy: sortByTime,
      orderDirection: OrderDirection.Desc
    }
  })

  const collections = data?.collections || ssr.collections
  
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
              Popular Collections
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
              loading={loading}
              volumeKey={volumeKey}
            />
          )}
          <Box css={{ alignSelf: 'center' }}>
            <Link href="/collection-rankings">
              <Button
                css={{
                  minWidth: 224,
                  justifyContent: 'center',
                }}
                size="large"
              >
                View All
              </Button>
            </Link>
          </Box>
        </Flex>
        <Footer />
      </Box>
    </Layout>
  )
}
export default IndexPage

export async function getServerSideProps() {
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
    props: {
      ssr: { collections: data?.collections || [] },
    }
  };
}
