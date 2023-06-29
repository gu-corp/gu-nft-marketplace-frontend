import React, { FC } from 'react'
import { Box } from 'components/primitives'
import TokenPrimitive from './TokenPrimitive'
import { CSSProperties } from '@stitches/react'
import { Collection, Token } from '__generated__/graphql'

type TokenLineItemProps = {
  tokenDetails?: Token
  collection?: Collection
  usdConversion?: number
  isUnavailable?: boolean
  warning?: string
  price?: string
  priceSubtitle?: string
  currency?: {
    contract?: string
    decimals?: number
  }
  expires?: string
  css?: CSSProperties
  showRoyalties?: boolean
  quantity?: number
}

const TokenLineItem: FC<TokenLineItemProps> = ({
  tokenDetails,
  collection,
  usdConversion = 0,
  isUnavailable,
  price,
  priceSubtitle,
  warning,
  currency,
  expires,
  css,
  showRoyalties,
  quantity,
}) => {
  if (!tokenDetails) {
    return null
  }

  const name = `#${tokenDetails?.tokenId}`
  const collectionName = collection?.name || ""

  const royaltiesBps = undefined

  return (
    <Box css={{ p: '$4', borderBottom: '1px solid $borderColor', ...css }}>
      <TokenPrimitive
        img={tokenDetails?.image as string}
        name={name}
        price={price}
        usdPrice={0}
        collection={collectionName}
        currencyContract={currency?.contract}
        currencyDecimals={currency?.decimals}
        expires={expires}
        warning={warning}
        isUnavailable={isUnavailable}
        priceSubtitle={priceSubtitle}
        royaltiesBps={royaltiesBps}
        quantity={quantity}
      />
    </Box>
  )
}

export default TokenLineItem
