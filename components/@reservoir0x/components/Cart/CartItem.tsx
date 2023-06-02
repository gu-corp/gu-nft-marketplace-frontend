import React, { FC } from 'react'
import {
  Button,
  Flex,
  FormatCryptoCurrency,
  FormatCurrency,
  Text,
} from 'components/primitives'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClose,
} from '@fortawesome/free-solid-svg-icons'
import { Cart } from '../../context/CartProvider'
import { styled } from 'stitches.config'
import useCart from 'components/@reservoir0x/hooks/useCart'

type Props = {
  item: Cart['items'][0]
  usdConversion: number
}

const CartItemImage = styled('img', {
  width: 56,
  height: 56,
  borderRadius: 4,
  objectFit: 'cover',
})

const CloseButton = styled(Button, {
  position: 'absolute',
  width: 24,
  height: 24,
  top: -8,
  right: -8,
  flexShrink: 0,
  defaultVariants: {
    size: 'none',
    corners: 'circle',
  },
})

const CartItem: FC<Props> = ({ item }) => {
  const { token } = item
  const contract = token.collection.split(':')[0]
  const {
    remove,
    data: cartCurrency,
  } = useCart((cart) => cart.currency)

  let usdPrice = 0

  return (
    <Flex
      direction="column"
      css={{
        transition: 'background-color 0.25s ease-in-out',
        '&:hover': {
          backgroundColor: '$neutralBgHover',
        },
      }}
    >
      <Flex
        css={{
          width: '100%',
          px: 24,
          py: 8,
          cursor: 'pointer',
        }}
      >
        <Flex css={{ position: 'relative', minWidth: 0, flexShrink: 0 }}>
          <CartItemImage
            src={token?.image}
            css={!item.price ? { filter: 'grayscale(1)' } : {}}
          />
          <CloseButton
            css={{
              '&:hover': {
                background: '$errorAccent',
              },
            }}
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              remove([`${token.collection}:${token.id}`])
            }}
          >
            <FontAwesomeIcon icon={faClose} width="16" height="16" />
          </CloseButton>
        </Flex>
        <Flex
          direction="column"
          justify="center"
          css={{ gap: 2, ml: '$2', minWidth: 0 }}
        >
          <Flex align="center" css={{ gap: '$1' }}>
            <Text style="h6" color={item.price ? undefined : 'subtle'} ellipsify>
              {token.name ? token.name : `#${token.id}`}
            </Text>
          </Flex>
          <Text style="body2" color="subtle" ellipsify>
            {token.name}
          </Text>
          {!item.price && (
            <Text style="body2" color="error">
              Item no longer available
            </Text>
          )}
        </Flex>
        {item.price ? (
          <Flex
            direction="column"
            justify="center"
            css={{
              ml: 'auto',
              flexShrink: 0,
              gap: '$1',
              '> div': { ml: 'auto' },
            }}
          >
            <FormatCryptoCurrency
              textStyle="subtitle2"
              amount={item.price}
              address={cartCurrency?.contract}
              decimals={cartCurrency?.decimals}
              logoHeight={12}
            />
            {usdPrice && usdPrice > 0 ? (
              <FormatCurrency
                amount={usdPrice}
                style="tiny"
                color="subtle"
                css={{ textAlign: 'end' }}
              />
            ) : null}
          </Flex>
        ) : null}
      </Flex>
    </Flex>
  )
}

export default CartItem
