import React, { FC, useEffect, useState } from 'react'
import { Flex, Box, FormatWrappedCurrency, Text } from 'components/primitives'
import TokenStatsHeader from './TokenStatsHeader'
import { BidData } from './BidModalRenderer'
import { formatEther } from 'ethers/lib/utils.js'
import { Collection, Token } from '__generated__/graphql'
import { useTimeSince } from 'hooks'
import useTrans from 'hooks/useTrans'

type Props = {
  token?: Token
  collection: Collection
  bidData: BidData | null
}

const TransactionBidDetails: FC<Props> = ({ token, collection, bidData }) => {
  const trans = useTrans()
  const [value, setValue] = useState('')
  const timeSince = useTimeSince(
    bidData?.endTime ? Number(bidData.endTime) : 0
  )

  useEffect(() => {
    setValue(bidData ? formatEther(bidData.price) : '')
  }, [bidData])

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

      <Box
        css={{
          flex: 1,
          mb: '$3',
        }}
      >
        <Flex
          direction="column"
          className="rk-stat-well"
          css={{
            backgroundColor: '$wellBackground',
            p: '$2',
            borderRadius: '$borderRadius',
            gap: '$1',
          }}
        >
          <Flex justify="between">
            <Text style="subtitle2">{trans.token.offer_price}</Text>
            <FormatWrappedCurrency
              amount={+value}
              textStyle="subtitle2"
              address={bidData?.currency}
            />
          </Flex>
          <Text style="subtitle2" color="subtle" as="p" css={{ flex: 1 }}>
            {bidData?.endTime ? `${trans.token.expires} ${timeSince}` : trans.token.no_expiration}
          </Text>
        </Flex>
      </Box>
    </Flex>
  )
}

export default TransactionBidDetails
