import { Anchor, Box, Flex, Text } from 'components/primitives'
import React, { FC } from 'react'
import { AcceptBidStep } from './AcceptBidModalRenderer'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCube, faWallet } from '@fortawesome/free-solid-svg-icons'
import { useNetwork } from 'wagmi'
import TransactionProgress from '../TransactionProgress'
import useTrans from 'hooks/useTrans'

type Props = {
  acceptBidStep: AcceptBidStep
  etherscanBaseUrl?: string
  tokenImage?: string
}

export const Progress: FC<Props> = ({
  acceptBidStep,
  etherscanBaseUrl,
  tokenImage,
}) => {
  const trans = useTrans()
  const { chain: activeChain } = useNetwork()

  return (
    <Flex
      direction="column"
      css={{
        alignItems: 'center',
        gap: '$4',
        mt: '$5',
        mb: '$3',
      }}
    >
      {acceptBidStep == AcceptBidStep.ApproveMarketplace && (
        <>
          <Text style="h6" css={{ mb: 28 }}>
            {trans.token.approve_marketplace_to_access_item_in_your_wallet}
          </Text>
          <Flex
            css={{
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 22,
              mb: 24,
            }}
          >
            <TransactionProgress
              fromImg={tokenImage || ''}
            />
          </Flex>
          <Text style="subtitle2" css={{ mx: 56, textAlign: 'center' }}>
            {trans.token.we_ll_ask_your_approval_for_the_marketplace_exchange_to_access_your_token_this_is_a_one_time_only_operation_per_collection}
          </Text>
        </>
      )}
      {acceptBidStep == AcceptBidStep.Confirming && (
        <>
          <Text style="h6">{trans.token.confirm_cancelation_in_your_wallet}</Text>
          <Box css={{ color: '$neutralText' }}>
            <FontAwesomeIcon
              icon={faWallet}
              style={{
                width: '32px',
                height: '32px',
                margin: '12px 0px',
              }}
            />
          </Box>
        </>
      )}

      {acceptBidStep == AcceptBidStep.Finalizing && (
        <>
          <Text style="h6">{trans.token.finalizing_on_blockchain}</Text>
          <Box css={{ color: '$neutralText' }}>
            <FontAwesomeIcon
              icon={faCube}
              style={{
                width: '32px',
                height: '32px',
                margin: '12px 0px',
              }}
            />
          </Box>
          <Anchor
            color="primary"
            weight="medium"
            css={{
              fontSize: 12,
            }}
            href={etherscanBaseUrl}
            target="_blank"
          >
            {trans.token.view_on} {activeChain?.blockExplorers?.default.name || 'Etherscan'}
          </Anchor>
        </>
      )}
    </Flex>
  )
}
