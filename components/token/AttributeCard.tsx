import { Flex, FormatCryptoCurrency, Text } from 'components/primitives'
import { formatNumber } from 'utils/numbers'
import Link from 'next/link'
import { TokenAttribute } from '__generated__/graphql'
import useTrans from 'hooks/useTrans'

type Props = {
  attribute: TokenAttribute
  collectionTokenCount: number | string
  collectionId?: string
}

export default function AttributeCard({ attribute, collectionTokenCount, collectionId }: Props) {
  const trans = useTrans()
  const attributeTokenCount = attribute?.tokenCount || 0
  const totalTokens = collectionTokenCount ? Number(collectionTokenCount) : 0
  const attributeRarity = formatNumber(
    (attributeTokenCount / totalTokens) * 100,
    1
  )
  const attributeHref = `/collection/${collectionId}?attributes[${attribute.key}]=${attribute.value}`
  return (
    <Link href={attributeHref} style={{ minWidth: 0 }}>
      <Flex
        direction="column"
        css={{
          background: '$gray2',
          mr: 'auto',
          px: '$4',
          py: '$3',
          borderRadius: 8,
          gap: '$1',
          width: '100%',
          height: '100%',
        }}
      >
        <Text style="subtitle3" color="subtle" ellipsify>
          {attribute.key}
        </Text>
        <Flex justify="between" css={{ gap: '$2' }}>
          <Text style="subtitle2" ellipsify>
            {attribute.value}
          </Text>
          <FormatCryptoCurrency
            amount={attribute.floorPrice}
            logoHeight={16}
            textStyle="subtitle2"
            maximumFractionDigits={2}
          />
        </Flex>
        <Flex justify="between">
          <Text style="body2" css={{ color: '$gray11' }}>
            {formatNumber(attribute.tokenCount)} ({attributeRarity}%) {trans.token.have_this}
          </Text>
          <Text style="body2" css={{ color: '$gray11' }}>
            {trans.token.floor}
          </Text>
        </Flex>
      </Flex>
    </Link>
  )
}
