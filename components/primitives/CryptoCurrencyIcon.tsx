import React, { FC } from 'react'
import { constants } from 'ethers'
import { styled } from '../../stitches.config'
import { StyledComponent } from '@stitches/react/types/styled-component'
import { useTheme } from 'next-themes'
import { useCurrency } from 'hooks'

type Props = {
  address: string
  chainId?: number
} & Parameters<StyledComponent>['0']

const StyledImg = styled('img', {})

const CryptoCurrencyIcon: FC<Props> = ({
  address = constants.AddressZero,
  chainId,
  css,
}) => {
  const { theme } = useTheme()
  const currency = useCurrency(address)
  const ethLogo = theme === 'dark' ? `/icons/eth-icon-light.svg`: `/icons/eth-icon-dark.svg`
  return (
    <StyledImg
      src={currency.logo ? currency.logo : ethLogo }
      css={css}
    />
  )
}

export default CryptoCurrencyIcon
