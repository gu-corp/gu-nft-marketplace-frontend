import { Collection, Token } from '__generated__/graphql'
import { Text, Box, FormatCryptoCurrency, Grid } from 'components/primitives'
import { useMounted } from 'hooks'
import { FC, ReactNode } from 'react'
import { useMediaQuery } from 'react-responsive'
import { formatNumber } from 'utils/numbers'
import * as _ from "lodash"
import { Order } from '__generated__/graphql'
import { BigNumber } from 'ethers'

type Props = {
  label: string
  children: ReactNode
}

const StatBox: FC<Props> = ({ label, children }) => (
  <Box
    css={{
      p: '$4',
      minWidth: 120,
      background: '$panelBg',
    }}
  >
    <Text style="subtitle3" css={{ color: '$gray12' }} as="p">
      {label}
    </Text>
    {children}
  </Box>
)

type StatHeaderProps = {
  collection: Collection,
  tokens?: Token[]
}

const StatHeader: FC<StatHeaderProps> = ({ collection, tokens }) => {
  const isMounted = useMounted()
  const isSmallDevice = useMediaQuery({ maxWidth: 600 }) && isMounted

  const onSaleCount = tokens?.filter(token => token.asks).length
  const listedPercentage =
    ((onSaleCount ? +onSaleCount : 0) /
      (collection?.totalTokens ? +collection.totalTokens : 0)) *
    100

  const topBid = _
    .reduce(tokens?.map(token => token.bids),
      (prev, curr) => [...prev, ...(curr || [])], [] as Order[])
    .sort(
      (a, b) => BigNumber.from(a.price).gt(BigNumber.from(b.price)) ? -1 : 1)
    ?.[0]

  return (
    <Grid
      css={{
        borderRadius: 8,
        overflow: 'hidden',
        gap: 1,
        gridTemplateColumns: '1fr 1fr',
        '@sm': {
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
          marginRight: 'auto',
        },
      }}
    >
      <StatBox label="Floor">
        <FormatCryptoCurrency
          amount={collection?.floor?.floorPrice}
          logoHeight={18}
          textStyle={'h6'}
          maximumFractionDigits={4}
        />
      </StatBox>

      <StatBox label="Top Offer">
        <FormatCryptoCurrency
          amount={topBid?.price}
          logoHeight={18}
          textStyle={'h6'}
          maximumFractionDigits={4}
        />
      </StatBox>

      {!isSmallDevice && (
        <StatBox label="Listed">
          <Text style="h6">{formatNumber(listedPercentage)}%</Text>
        </StatBox>
      )}

      <StatBox label="Total Volume">
        <FormatCryptoCurrency
          amount={collection.volume?.totalVolume}
          logoHeight={18}
          textStyle={'h6'}
          maximumFractionDigits={4}
        />
      </StatBox>

      <StatBox label="Count">
        <Text style="h6">{formatNumber(collection?.totalTokens)}</Text>
      </StatBox>
    </Grid>
  )
}

export default StatHeader
