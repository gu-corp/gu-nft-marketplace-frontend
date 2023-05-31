import React, { FC, ComponentPropsWithoutRef, CSSProperties } from 'react'
import TokenMedia from './index'
import { Button, Flex, Text } from 'components/primitives'
import { useMutation } from '@apollo/client'
import { REFRESH_TOKEN_METADATA } from 'graphql/queries/tokens'

type TokenFallbackProps = {
  style?: CSSProperties
  className?: string
  token: ComponentPropsWithoutRef<typeof TokenMedia>['token']
  chainId?: number
  onRefreshClicked: () => void
}

const TokenFallback: FC<TokenFallbackProps> = ({
  style,
  className,
  token,
  chainId,
  onRefreshClicked,
}) => {
  const img = token?.image as string
  const [refreshTokenMetadata] = useMutation(REFRESH_TOKEN_METADATA);

  return (
    <Flex
      justify="center"
      align="center"
      direction="column"
      css={{ gap: '$2', aspectRatio: '1/1', p: '$2', ...style }}
      className={className}
    >
      {img && (
        <img
          style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }}
          src={img}
        />
      )}
      <Text style="body2" css={{ textAlign: 'center' }}>
        No Content Available
      </Text>
      <Button
        color="secondary"
        onClick={(e: any) => {
          e.preventDefault()
          onRefreshClicked()
          refreshTokenMetadata({
            variables: {
              args: {
                collection: token?.collection as string,
                tokenId: token?.tokenId as string
              }
            }
          }).then().catch(e => { throw e })
        }}
      >
        Refresh
      </Button>
    </Flex>
  )
}

export default TokenFallback
