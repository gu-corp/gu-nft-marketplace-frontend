import FormatCrypto from './FormatCrypto'
import React, { FC, ComponentProps } from 'react'
import CryptoCurrencyIcon from './CryptoCurrencyIcon'
import { Addresses } from 'constants/addresses'

type FormatCryptoCurrencyProps = {
  logoHeight?: number
  address?: string
}

type Props = ComponentProps<typeof FormatCrypto> & FormatCryptoCurrencyProps

const FormatCryptoCurrency: FC<Props> = ({
  amount,
  address = Addresses.WETH,
  maximumFractionDigits,
  logoHeight = 8,
  textStyle,
  css,
  decimals,
  textColor
}) => {
  return (
    <FormatCrypto
      css={css}
      textStyle={textStyle}
      amount={amount}
      maximumFractionDigits={maximumFractionDigits}
      decimals={decimals}
      textColor={textColor}
    >
      <CryptoCurrencyIcon css={{ height: logoHeight }} address={address} />
    </FormatCrypto>
  )
}

export default FormatCryptoCurrency
