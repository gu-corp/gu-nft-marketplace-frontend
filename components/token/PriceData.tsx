import { useQuery } from '@apollo/client'
import { Order, Token } from '__generated__/graphql'
import { Flex, FormatCryptoCurrency, Text } from 'components/primitives'
import { GET_HIGHEST_BID, GET_LISTED } from 'graphql/queries/orders'
import { FC } from 'react'

type Props = {
  ask?: Order | null
  highestBid?: Order | null
}

export const PriceData: FC<Props> = ({ ask, highestBid }) => {
  return (
    <Flex css={{ gap: '$6', pt: '$4', pb: '$5' }}>
      <Flex direction="column" align="start" css={{ gap: '$1' }}>
        <Text style="subtitle2">Price</Text>
        <Flex
          align="center"
          css={{
            flexDirection: 'column',
            '@bp400': { flexDirection: 'row', gap: '$2' },
          }}
        >
          <FormatCryptoCurrency
            amount={ask?.price}
            address={ask?.currencyAddress}
            textStyle="h4"
            logoHeight={20}
            maximumFractionDigits={4}
          />
        </Flex>
      </Flex>
      <Flex direction="column" align="start" css={{ gap: '$1' }}>
        <Text style="subtitle2">Top Offer</Text>
        <Flex
          align="center"
          css={{
            flexDirection: 'column',
            '@bp400': { flexDirection: 'row', gap: '$2' },
          }}
        >
          <FormatCryptoCurrency
            amount={highestBid?.price}
            address={highestBid?.currencyAddress}
            textStyle="h4"
            logoHeight={20}
            maximumFractionDigits={4}
          />

        </Flex>
      </Flex>
    </Flex>
  )
}
