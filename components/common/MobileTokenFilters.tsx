import { Dispatch, FC, SetStateAction, useRef, useState } from 'react'
import * as RadixDialog from '@radix-ui/react-dialog'
import { Button, Flex, Text } from 'components/primitives'
import Image from 'next/image'
import { FullscreenModal } from 'components/common/FullscreenModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { NAVBAR_HEIGHT_MOBILE } from 'components/navbar'
import { Collection } from '__generated__/graphql'
import useTrans from 'hooks/useTrans'

type Props = {
  collections?: Collection[]
  filterCollection: string | undefined
  setFilterCollection: Dispatch<SetStateAction<string | undefined>>
}

export const MobileTokenFilters: FC<Props> = ({
  collections,
  filterCollection,
  setFilterCollection,
}) => {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const trans = useTrans()

  const trigger = (
    <Flex
      justify="center"
      css={{
        position: 'fixed',
        left: 0,
        bottom: '70px',
        width: '100vw',
        zIndex: 99,
      }}
    >
      <Button
        ref={triggerRef}
        css={{
          justifyContent: 'center',
          alignItems: 'center',
          justifyItems: 'center',
          position: 'fixed',
          px: '$6',
          py: '$3',
        }}
        type="button"
        size="small"
        corners="pill"
        color="gray3"
      >
        <Text style="h6">{trans.portfolio.filter}</Text>
        {filterCollection && (
          <Flex
            justify="center"
            align="center"
            css={{
              height: '24px',
              width: '24px',
              backgroundColor: '$gray4',
              borderRadius: '100%',
              fontSize: 'medium',
              fontWeight: '500',
            }}
          >
            1
          </Flex>
        )}
      </Button>
    </Flex>
  )

  if (collections?.length === 0 || collections == null) {
    return null
  }

  return (
    <FullscreenModal trigger={trigger}>
      {' '}
      <Flex
        css={{
          flexDirection: 'column',
          height: '100%',
          overflow: 'scroll',
        }}
      >
        <Flex
          css={{
            py: '$4',
            px: '$4',
            width: '100%',
            borderBottom: '1px solid $gray4',
            height: NAVBAR_HEIGHT_MOBILE,
          }}
          align="center"
          justify="between"
        >
          <Flex align="center">
            <Text style="h5" css={{ mr: '$3' }}>
              {trans.portfolio.filter}
            </Text>
          </Flex>
          <RadixDialog.Close>
            <Flex
              css={{
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: '$gray3',
                color: '$gray12',
                '&:hover': {
                  backgroundColor: '$gray4',
                },
              }}
            >
              <FontAwesomeIcon icon={faXmark} width={16} height={16} />
            </Flex>
          </RadixDialog.Close>
        </Flex>
        <Flex
          direction="column"
          css={{
            pt: '$4',
            maxHeight: `calc(100vh - ${NAVBAR_HEIGHT_MOBILE}px)`,
            overflowY: 'auto',
            pb: '$5',
          }}
        >
          <Text style="subtitle1" css={{ mb: '$2', pl: '$4' }}>
            {trans.portfolio.collections}
          </Text>
          {collections?.map((collection) => {
            let selected = collection?.id == filterCollection
            return (
              <Flex
                key={collection?.id}
                css={{
                  py: '$2',
                  px: '$4',
                  gap: '$3',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: selected ? '$gray5' : '$gray4',
                  },
                  backgroundColor: selected ? '$gray5' : '',
                }}
                align="center"
                onClick={() => {
                  if (selected) {
                    setFilterCollection(undefined)
                  } else {
                    setFilterCollection(collection?.id)
                  }
                  triggerRef?.current?.click()
                }}
              >
                {collection?.image && (
                  <Image
                    style={{
                      borderRadius: '4px',
                      objectFit: 'cover',
                      aspectRatio: '1/1',
                    }}
                    loader={({ src }) => src}
                    src={collection?.image as string}
                    alt={collection?.name as string}
                    width={24}
                    height={24}
                  />
                )}
                <Text
                  style="body1"
                  css={{
                    flex: 1,
                  }}
                  ellipsify
                >
                  {collection?.name}
                </Text>
                <Text style="subtitle2" css={{ color: '$gray10' }}>
                  {/* TO-DO: this is total tokens of collection, must use total tokens of user owner */}
                  {collection?.totalTokens}
                </Text>
              </Flex>
            )
          })}
        </Flex>
      </Flex>
    </FullscreenModal>
  )
}
