import { SupportedNetworkId, addressesByNetwork } from "@gulabs/gu-nft-marketplace-sdk"
import { Currency } from "types/currency"

const currencyOptions: Currency[] = [
  {
    contract: addressesByNetwork[process.env.NEXT_PUBLIC_NETWORK_ID as SupportedNetworkId].WETH,
    symbol: "WETH",
    decimals: 18,
    logo: '/icons/currency/weth.png'
  },
]

export default currencyOptions
