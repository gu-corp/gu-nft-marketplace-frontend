import { Order, Token } from '__generated__/graphql'
import { Flex, FormatCryptoCurrency, Text } from 'components/primitives'
import useTrans from 'hooks/useTrans'
import { FC } from 'react'

type Props = {
  ask?: Order | null
  highestBid?: Order | null
}

export const PriceData: FC<Props> = ({ ask, highestBid }) => {
  const trans = useTrans()
  return (
    <Flex css={{ gap: '$6', pt: '$4', pb: '$5' }}>
      <Flex direction="column" align="start" css={{ gap: '$1' }}>
        <Text style="subtitle2">{trans.token.price}</Text>
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
        <Text style="subtitle2">{trans.token.top_offer}</Text>
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
