import { Anchor, Button, Flex, Text, Tooltip } from 'components/primitives'
import { ComponentPropsWithoutRef, FC, useRef, useState } from 'react'
import {
  faExternalLink,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { styled } from '../../stitches.config'
import { useTheme } from 'next-themes'
import { useMounted } from 'hooks'
import { truncateAddress } from 'utils/truncate'
import ReactMarkdown from 'react-markdown'
import { useRouter } from 'next/router'
import { Token, Collection } from '__generated__/graphql'
import { useNetwork } from 'wagmi'


type Props = {
  token: Token
  collection: Collection
}

export const TokenInfo: FC<Props> = ({ token, collection }) => {
  const { chain } = useNetwork()
  const { theme } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const descriptionRef = useRef<HTMLParagraphElement | null>(null)
  const isMounted = useMounted()
  const router = useRouter()

  const CollectionAction = styled(Flex, {
    px: '$4',
    py: '$3',
    color: '$gray12',
    background: '$gray3',
    cursor: 'pointer',
    transition: 'background 0.25s ease-in',
    height: 40,
    alignItems: 'center',
    '&:hover': {
      background: '$gray4',
    },
  })

  const etherscanImage = (
    <img
      src={
        isMounted && theme === 'dark'
          ? '/icons/etherscan-logo-light-circle.svg'
          : '/icons/etherscan-logo-circle.svg'
      }
      alt={`${
        chain?.blockExplorers?.default.name || 'Ethereum'
      } Icon`}
      height={16}
      width={16}
    />
  )

  const blockExplorerUrl = `${
    chain?.blockExplorers?.default.url || 'https://etherscan.io'
  }/token/${token?.collection}?a=${token?.tokenId}`

  const expandedCss: ComponentPropsWithoutRef<typeof Flex>['css'] = {
    maxWidth: '100%',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    verticalAlign: 'top',
    '*': {
      justifyContent: 'center',
    },
  }

  let isLongDescription = false

  if (descriptionRef.current) {
    isLongDescription = descriptionRef.current.offsetHeight > 50
  }

  return (
    <>
      <Flex direction="column" css={{ gap: '$3', maxWidth: '100%' }}>
        <Flex css={{ gap: '$2', flex: 1 }} align="center">
          <img
            src={collection?.image as string}
            style={{ width: 36, height: 36, borderRadius: 4 }}
            alt=''
          />
          <Text style="h6" ellipsify>
            {collection?.name}
          </Text>
          {/* <OpenSeaVerified
            openseaVerificationStatus={collection?.openseaVerificationStatus}
          /> */}
        </Flex>
        <Flex
          direction="column"
          css={{
            fontSize: '16px',
            fontFamily: 400,
            overflow: 'hidden',
            a: { textDecoration: 'underline' },
          }}
        >
          <Flex direction="column" css={isExpanded ? undefined : expandedCss}>
            <Text ref={descriptionRef}>
              <ReactMarkdown linkTarget="_blank">
                {collection?.description as string}
              </ReactMarkdown>
            </Text>
          </Flex>
          {isLongDescription && (
            <Button
              color="ghost"
              size="xs"
              css={{
                width: 'max-content',
                color: '$primary11',
                fontWeight: 500,
                height: 28,
                minHeight: 28,
                px: 0,
              }}
              onClick={() => {
                setIsExpanded(!isExpanded)
              }}
            >
              {isExpanded ? 'read less' : 'read more'}
            </Button>
          )}
        </Flex>
        <Flex
          css={{
            borderRadius: 8,
            overflow: 'hidden',
            gap: 1,
            flexShrink: 0,
            mb: '$3',
            width: 'max-content',
          }}
        >
          <a href={blockExplorerUrl} target="_blank" rel="noopener noreferrer">
            <CollectionAction>{etherscanImage}</CollectionAction>
          </a>
        </Flex>
        <Flex direction="column" css={{ width: '100%', gap: '$2' }}>
          <Flex justify="between" css={{ width: '100%' }}>
            <Text
              style="subtitle1"
              css={{ color: '$gray11', fontWeight: 'normal' }}
            >
              Contract Address
            </Text>
            <Anchor
              href={blockExplorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              color="primary"
              weight="medium"
            >
              <Flex align="center" css={{ gap: '$2' }}>
                {truncateAddress(token?.collection as string)}
                <FontAwesomeIcon icon={faExternalLink} width={12} height={15} />
              </Flex>
            </Anchor>
          </Flex>
          <Flex justify="between" css={{ width: '100%' }}>
            <Text
              style="subtitle1"
              css={{ color: '$gray11', fontWeight: 'normal' }}
            >
              Chain
            </Text>
            <Text style="subtitle1">G.U Sandbox chain</Text>
          </Flex>
          <Flex justify="between" css={{ width: '100%' }}>
            <Text
              style="subtitle1"
              css={{
                color: '$gray11',
                fontWeight: 'normal',
                whiteSpace: 'nowrap',
                mr: '$2',
              }}
            >
              Token ID
            </Text>
            <Text style="subtitle1" ellipsify css={{ maxWidth: '100%' }}>
              {token?.tokenId}
            </Text>
          </Flex>
          <Flex justify="between" css={{ width: '100%' }}>
            <Text
              style="subtitle1"
              css={{ color: '$gray11', fontWeight: 'normal' }}
            >
              Token Standard
            </Text>
            <Text style="subtitle1" css={{ textTransform: 'uppercase' }}>
              ERC721
            </Text>
          </Flex>
          <Flex justify="between" css={{ width: '100%' }}>
            <Flex align="center" css={{ gap: '$2' }}>
              <Text
                style="subtitle1"
                css={{ color: '$gray11', fontWeight: 'normal' }}
              >
                Creator Royalties
              </Text>
              <Tooltip
                content={
                  <Text style="body2" as="p">
                    A fee on every order that goes to the collection creator.
                  </Text>
                }
                style={{ maxWidth: '210px' }}
              >
                <Text css={{ color: '$gray11' }}>
                  <FontAwesomeIcon icon={faInfoCircle} width={16} height={16} />
                </Text>
              </Tooltip>
            </Flex>
            <Text style="subtitle1">
              0%
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </>
  )
}
