import { SupportedNetworkId, addressesByNetwork } from "@gulabs/gu-nft-marketplace-sdk"

export const networkId = process.env.NEXT_PUBLIC_NETWORK_ID as SupportedNetworkId

export const Addresses = {
  WETH: addressesByNetwork[networkId]?.WETH?.toLowerCase()
}