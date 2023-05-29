import React, { FC } from 'react'
import { Box, Text } from 'components/primitives'
import optimizeImage from '../../../lib/optimizeImage'
import { styled } from 'stitches.config'
import { Collection, Token } from '__generated__/graphql'

const Img = styled('img', {
  width: '100%',
  '@bp600': {
    height: 150,
    width: 150,
  },
  borderRadius: '$borderRadius',
})

type Props = {
  token?: Token
  collection?: Collection
}

const Token: FC<Props> = ({ token, collection }) => {

  const img = optimizeImage(
    token?.image as string,
    600
  )
  return (
    <Box
      css={{
        mr: '$4',
        width: 120,
        '@bp600': {
          mr: 0,
          width: '100%',
        },
      }}
    >
      <Text
        style="subtitle2"
        color="subtle"
        css={{ mb: '$1', display: 'block' }}
      >
        Item
      </Text>
      <Img
        src={img}
        css={{
          mb: '$2',
          visibility: !img || img.length === 0 ? 'hidden' : 'visible',
          objectFit: 'cover',
        }}
      />
      <Text style="h6" css={{ flex: 1 }} as="h6" ellipsify>
        {collection?.name || `#${token?.tokenId}`}
      </Text>
      <Box>
        <Text style="subtitle2" color="subtle" as="p" ellipsify>
          {collection?.name}
        </Text>
      </Box>
    </Box>
  )
}

export default Token
