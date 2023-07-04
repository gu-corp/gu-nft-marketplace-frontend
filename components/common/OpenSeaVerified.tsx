import { FC } from 'react'
import { Tooltip, Text } from 'components/primitives'
import Image from 'next/image'

type Props = {
  openseaVerificationStatus: string
}

export const OpenSeaVerified: FC<Props> = ({ openseaVerificationStatus }) => {
  if (openseaVerificationStatus === 'verified')
    return (
      <Tooltip
        sideOffset={4}
        content={
          <Text style="body2" css={{ display: 'block' }}>
            Verified by OpenSea
          </Text>
        }
      >
        <Image src="/icons/opensea-verified.svg" alt={''} />
      </Tooltip>
    )
  else return null
}
