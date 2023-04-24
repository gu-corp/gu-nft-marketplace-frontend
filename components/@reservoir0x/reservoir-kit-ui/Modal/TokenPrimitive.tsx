import React, { FC } from 'react'
import {
  Box,
  Flex,
  Text,
  Grid,
  FormatCurrency,
  FormatCryptoCurrency,
} from 'components/primitives'
import InfoTooltip from 'components/primitives/InfoTooltip'
import { styled } from 'stitches.config'

type Props = {
  img?: string
  name?: string
  collection: string
  currencyContract?: string
  currencyDecimals?: number
  price?: number
  usdPrice?: number | string
  expires?: string
  warning?: string
  isOffer?: boolean
  isUnavailable?: boolean
  priceSubtitle?: string
  royaltiesBps?: number
  quantity?: number
}

const Img = styled('img', {
  height: 56,
  width: 56,
})

const TokenPrimitive: FC<Props> = ({
  img,
  name,
  collection,
  currencyContract,
  currencyDecimals,
  expires,
  warning,
  usdPrice,
  price,
  isUnavailable,
  priceSubtitle,
  royaltiesBps,
  quantity,
}) => {
  const royaltyPercent = royaltiesBps ? royaltiesBps / 100 : royaltiesBps

  return (
    <Box>
      <Flex css={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          style="subtitle2"
          color="subtle"
          css={{ mb: 10, display: 'block' }}
        >
          {name ? 'Item' : 'Collection'}
        </Text>
        {priceSubtitle && (
          <Text
            style="subtitle2"
            color="subtle"
            css={{ mb: 10, display: 'block' }}
          >
            {priceSubtitle}
          </Text>
        )}
      </Flex>
      <Flex justify="between">
        <Flex css={{ alignItems: 'center', gap: 8 }}>
          <Img
            src={img}
            alt={name}
            css={{
              borderRadius: 4,
              overflow: 'hidden',
              visibility: !img || img.length === 0 ? 'hidden' : 'visible',
              flexShrink: 0,
              objectFit: 'cover',
            }}
          />
          <Grid css={{ rowGap: 2 }}>
            <Flex
              align="center"
              css={{ gap: '$2', mr: '$4', overflow: 'hidden' }}
            >
              <Text
                style="h6"
                ellipsify
                color={isUnavailable ? 'subtle' : 'base'}
              >
                {name ? name : collection}
              </Text>
              {expires && quantity && quantity > 1 ? (
                <Flex
                  css={{
                    p: '$1 ',
                    background: '$neutralBgHover',
                    borderRadius: 4,
                    mr: 'auto',
                  }}
                >
                  <Text
                    style="tiny"
                    color="base"
                    css={{ minWidth: 'max-content' }}
                  >
                    {quantity} items
                  </Text>
                </Flex>
              ) : null}
            </Flex>
            {name && (
              <Text style="body2" color={isUnavailable ? 'subtle' : 'base'}>
                {collection}
              </Text>
            )}
            {!!expires && <Text style="tiny">Expires {expires}</Text>}
            {!expires && quantity && quantity > 1 ? (
              <Flex
                css={{
                  p: '$1 ',
                  background: '$neutralBgHover',
                  borderRadius: 4,
                  mr: 'auto',
                }}
              >
                <Text style="tiny" color="base">
                  {quantity} {quantity > 1 ? 'items' : 'item'}
                </Text>
              </Flex>
            ) : null}
            {!expires && !quantity && royaltiesBps ? (
              <Text
                style="body2"
                color="subtle"
                css={{ display: 'flex', gap: '$1' }}
              >
                Creator Royalties: {royaltyPercent}%
                <InfoTooltip
                  side="right"
                  width={200}
                  content="A fee on every order that goes to the collection creator."
                />
              </Text>
            ) : null}
          </Grid>
        </Flex>
        <Grid css={{ justifyItems: 'end', alignContent: 'start', rowGap: 4 }}>
          {price ? (
            <FormatCryptoCurrency
              amount={price}
              textColor={isUnavailable ? 'subtle' : 'base'}
              address={currencyContract}
              decimals={currencyDecimals}
            />
          ) : (
            <Text style="subtitle2" color={isUnavailable ? 'subtle' : 'base'}>
              --
            </Text>
          )}
          {usdPrice ? (
            <FormatCurrency amount={usdPrice} style="tiny" color="subtle" />
          ) : null}
          {warning && (
            <Text style="subtitle2" color="error">
              {warning}
            </Text>
          )}
        </Grid>
      </Flex>
    </Box>
  )
}

export default TokenPrimitive
