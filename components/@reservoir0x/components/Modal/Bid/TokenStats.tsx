import React, { ComponentPropsWithoutRef, FC } from 'react'
import { Flex, Box, Grid, Text } from 'components/primitives'
import TokenStatsHeader from './TokenStatsHeader'
import InfoTooltip from 'components/primitives/InfoTooltip'
import { Collection, Token } from 'types/workaround'
import Stat from '../Stat'

type Props = {
  token?: Token
  collection: Collection
}

const TokenStats: FC<Props> = ({ token, collection }) => {
  let stats: (ComponentPropsWithoutRef<typeof Stat> & { id: number })[] = []

  stats.push(
    {
      id: 0,
      label: (
        <>
          <Text
            style="subtitle2"
            color="subtle"
            css={{ minWidth: '0' }}
            ellipsify
          >
            Creator Royalties
          </Text>
          <InfoTooltip
            side="right"
            width={200}
            content={
              'A fee on every order that goes to the collection creator.'
            }
          />
        </>
      ),
      value: (collection?.royalties?.bps || 0) * 0.01 + '%',
    },
    {
      id: 1,
      label: (
        <Text
          style="subtitle2"
          color="subtle"
          css={{ minWidth: '0' }}
          ellipsify
        >
          Highest Offer
        </Text>
      ),
      value: token
        ? token.market?.topBid?.price?.amount?.decimal || null
        : collection?.topBid?.price?.amount?.decimal || null,
      address: token?.market?.topBid?.price?.currency?.contract,
      asWrapped: true,
    }
  )

  if (token) {
    stats.push({
      id: 2,
      label: (
        <Text
          style="subtitle2"
          color="subtle"
          css={{ minWidth: '0' }}
          ellipsify
        >
          List Price
        </Text>
      ),
      value: token.market?.floorAsk?.price?.amount?.decimal || null,
      address: token?.market?.floorAsk?.price?.currency?.contract,
      asNative: true,
    })
  } else if (!token && collection) {
    stats.push({
      id: 2,
      label: (
        <Text
          style="subtitle2"
          color="subtle"
          css={{ minWidth: '0' }}
          ellipsify
        >
          Floor
        </Text>
      ),
      value: collection?.floorAsk?.price?.amount?.decimal || null,
      address: collection?.floorAsk?.price?.currency?.contract,
      asNative: true,
    })
  }

  return (
    <Flex
      css={{
        width: '100%',
        flexDirection: 'row',
        '@bp600': {
          width: 220,
          flexDirection: 'column',
        },
        p: '$4',
      }}
    >
      <TokenStatsHeader collection={collection} token={token} />
      <Grid
        css={{
          flex: 1,
          alignContent: 'start',
          width: '100%',
          gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
        }}
      >
        <Box
          css={{
            flex: 1,
            [`& ${Stat}:not(:last-child)`]: {
              mb: '$1',
            },
          }}
        >
          {stats.map((stat) => (
            <Stat key={stat.id} {...stat} />
          ))}
        </Box>
      </Grid>
    </Flex>
  )
}

export default TokenStats
