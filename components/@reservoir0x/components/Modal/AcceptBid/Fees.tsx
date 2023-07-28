import React, { FC } from 'react'
import { Flex, Text } from 'components/primitives'
import InfoTooltip from 'components/primitives/InfoTooltip'
import useTrans from 'hooks/useTrans'

type Props = {
  fees: {
    feeBreakdown?: {
      kind?: string | undefined
      recipient?: string | undefined
      bps?: number | undefined
    }[]
  }
}

const Fees: FC<Props> = ({ fees: { feeBreakdown } }) => {


  const trans = useTrans()

  const parsedFeeBreakdown = feeBreakdown?.map(({ bps, kind }) => {
    const percentage = bps ? bps * 0.01 : 0
    let name: string = ''
    let tooltipMessage: string | null = null
    switch (kind) {
      case 'royalty':
        name = trans.token.creator_royalties
        tooltipMessage =
          trans.token.a_fee_on_every_order_that_goes_to_the_collection_creator
        break

      case 'marketplace':
        name = trans.token.marketplace_fee;
        tooltipMessage =
          trans.token.a_fee_included_in_the_order_from_the_marketplace_in_which_it_was_created
        break

      default:
        name = 'Misc. Fees'
        break
    }

    return {
      name,
      percentage,
      tooltipMessage,
    }
  })

  // Return null when there are no fees
  if (!(feeBreakdown && feeBreakdown?.length > 0)) {
    return null
  }

  return (
    <Flex
      css={{
        px: '$4',
        mt: '$4',
        flexDirection: 'column',
      }}
    >
      <Text style="subtitle2" color="subtle" css={{ mb: '$2' }}>
        {trans.token.fees}
      </Text>
      {parsedFeeBreakdown?.map(({ name, percentage, tooltipMessage }, i) => (
        <Flex key={i} css={{ justifyContent: 'space-between', mb: '$2' }}>
          <Flex css={{ alignItems: 'center', gap: 8 }}>
            <Text style="subtitle2" color="subtle">
              {name}
            </Text>
            {tooltipMessage && (
              <InfoTooltip side="right" width={200} content={tooltipMessage} />
            )}
          </Flex>
          <Text style="subtitle2">{percentage}%</Text>
        </Flex>
      ))}
    </Flex>
  )
}

export default Fees
