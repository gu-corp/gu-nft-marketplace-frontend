import { Token } from '__generated__/graphql'
import { Flex, FormatCryptoCurrency, Text } from 'components/primitives'
import { Console } from 'console'
import { BigNumber } from 'ethers'
import { useMarketplaceChain } from 'hooks'
import { FC } from 'react'
import { formatDollar } from 'utils/numbers'

type Props = {
  token: Token
}

export const PriceData: FC<Props> = ({ token }) => {
  const { reservoirBaseUrl } = useMarketplaceChain()
  // const listSourceName = token?.market?.floorAsk?.source?.name as
  //   | string
  //   | undefined
  // const listSourceDomain = token?.market?.floorAsk?.source?.domain as
  //   | string
  //   | undefined

  // const offerSourceName = token?.market?.topBid?.source?.name as
  //   | string
  //   | undefined
  // const offerSourceDomain = token?.market?.topBid?.source?.domain as
  //   | string
  //   | undefined

  // const listSourceLogo = `${reservoirBaseUrl}/redirect/sources/${
  //   listSourceDomain || listSourceName
  // }/logo/v2`

  // const offerSourceLogo = `${reservoirBaseUrl}/redirect/sources/${
  //   offerSourceDomain || offerSourceName
  // }/logo/v2`

  // const listSourceRedirect = `${reservoirBaseUrl}/redirect/sources/${
  //   listSourceDomain || listSourceName
  // }/tokens/${token?.token?.contract}:${token?.token?.tokenId}/link/v2`

  // const offerSourceRedirect = `${reservoirBaseUrl}/redirect/sources/${
  //   offerSourceDomain || offerSourceName
  // }/tokens/${token?.token?.contract}:${token?.token?.tokenId}/link/v2`

  const ask = token?.asks?.[0]
  const highestBid = [...token?.bids || []].sort((a, b) => BigNumber.from(a.price).gt(BigNumber.from(b.price)) ? -1 : 1)?.[0]

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
