import React, { FC } from 'react'
import { Box } from 'components/primitives'
import TokenPrimitive from './TokenPrimitive'
import { CSSProperties } from '@stitches/react'
import { Collection, Token } from 'types/workaround'

type TokenLineItemProps = {
  tokenDetails?: Token
  collection?: Collection
  usdConversion?: number
  isUnavailable?: boolean
  warning?: string
  price: number
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

  const usdPrice = price * usdConversion

  const name = tokenDetails?.name || `#${tokenDetails?.tokenID}`
  const collectionName =
    tokenDetails?.collection?.name || collection?.name || ''

  const img = tokenDetails?.image
    ? tokenDetails.image
    : (collection?.image as string)

  const royaltiesBps =
    showRoyalties && collection?.royalties
      ? collection.royalties.bps
      : undefined

  return (
    <Box css={{ p: '$4', borderBottom: '1px solid $borderColor', ...css }}>
      <TokenPrimitive
        img={img}
        name={name}
        price={price}
        usdPrice={usdPrice}
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
