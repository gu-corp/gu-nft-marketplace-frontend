import {
  faEllipsis,
  faRefresh,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { styled } from '../../stitches.config'
import { Box, Flex } from 'components/primitives'
import { ComponentPropsWithoutRef, FC, useContext, useState } from 'react'
import { useMounted } from 'hooks'
import { useTheme } from 'next-themes'
import { Dropdown } from 'components/primitives/Dropdown'
import { useMediaQuery } from 'react-responsive'
import { ToastContext } from 'context/ToastContextProvider'
import { spin } from 'components/common/LoadingSpinner'
import { Collection } from '__generated__/graphql'
import { useMutation } from '@apollo/client'
import { REFRESH_COLLECTION_METADATA } from 'graphql/queries/collections'
import { useNetwork } from 'wagmi'

type CollectionActionsProps = {
  collection: Collection
}

const CollectionAction = styled(Flex, {
  px: '$4',
  py: '$3',
  color: '$gray12',
  background: '$panelBg',
  cursor: 'pointer',
  transition: 'background 0.25s ease-in',
  height: 48,
  alignItems: 'center',
  '&:hover': {
    background: '$gray4',
  },
})

const CollectionActionDropdownItem = styled(Flex, {
  gap: '$3',
  cursor: 'pointer',
  alignItems: 'center',
  flexDirection: 'row',
  px: '$4',
  py: 20,
  transition: 'background 0.25s ease-in',
  '&:hover': {
    background: '$gray4',
  },
})

const CollectionActions: FC<CollectionActionsProps> = ({ collection }) => {
  const { addToast } = useContext(ToastContext)
  const isMounted = useMounted()
  const isMobile = useMediaQuery({ maxWidth: 600 }) && isMounted
  const { chain } = useNetwork()
  const { theme } = useTheme()
  const [refreshCollectionMetadata, { loading: isRefreshing }] = useMutation(REFRESH_COLLECTION_METADATA);
  const etherscanImage = (
    <img
      src={
        isMounted && theme === 'dark'
          ? '/icons/etherscan-logo-light-circle.svg'
          : '/icons/etherscan-logo-circle.svg'
      }
      alt={chain?.blockExplorers?.default.name || 'Etherscan'}
      style={{
        height: 16,
        width: 16,
      }}
    />
  )

  const blockExplorerUrl = `${
    chain?.blockExplorers?.default.url || 'https://etherscan.io'
  }/address/${collection?.id}`

  const containerCss: ComponentPropsWithoutRef<typeof Flex>['css'] = {
    borderRadius: 8,
    overflow: 'hidden',
    gap: 1,
    flexShrink: 0,
    mb: 'auto',
  }

  const dropdownContentProps: ComponentPropsWithoutRef<
    typeof Dropdown
  >['contentProps'] = {
    sideOffset: 4,
    style: { padding: 0, overflow: 'hidden' },
  }

  const collectionActionOverflowTrigger = (
    <CollectionAction>
      <FontAwesomeIcon icon={faEllipsis} width={16} height={16} />
    </CollectionAction>
  )

  const refreshMetadataItem = (
    <CollectionActionDropdownItem
      css={{
        cursor: isRefreshing ? 'not-allowed' : 'pointer',
      }}
      onClick={(e: any) => {
        if (isRefreshing) {
          e.preventDefault()
          return
        }
        refreshCollectionMetadata({
          variables: {
            args: {
              collection: collection.id
            }
          }
        }).then(() => {
          addToast?.({
            title: 'Refresh collection',
            description: 'Request to refresh collection was accepted.',
          })
        }).catch((e) => {
             addToast?.({
              title: 'Refresh collection failed',
              description: 'This collection was recently refreshed. Please try again later.',
            })
            throw e
        })
      }}
    >
      <Box
        css={{
          animation: isRefreshing
            ? `${spin} 1s cubic-bezier(0.76, 0.35, 0.2, 0.7) infinite`
            : 'none',
        }}
      >
        <FontAwesomeIcon icon={faRefresh} width={16} height={16} />
      </Box>
      Refresh Metadata
    </CollectionActionDropdownItem>
  )

  if (isMobile) {
    return (
      <Flex css={containerCss}>
        <Dropdown
          trigger={collectionActionOverflowTrigger}
          contentProps={dropdownContentProps}
        >
          <Flex direction="column">
            <a
              href={blockExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <CollectionActionDropdownItem>
                {etherscanImage}
                Etherscan
              </CollectionActionDropdownItem>
            </a>
            {refreshMetadataItem}
          </Flex>
        </Dropdown>
      </Flex>
    )
  }

  return (
    <Flex css={containerCss}>
      <a href={blockExplorerUrl} target="_blank" rel="noopener noreferrer">
        <CollectionAction>{etherscanImage}</CollectionAction>
      </a>
      <Dropdown
        trigger={collectionActionOverflowTrigger}
        contentProps={dropdownContentProps}
      >
        {refreshMetadataItem}
      </Dropdown>
    </Flex>
  )
}

export default CollectionActions
