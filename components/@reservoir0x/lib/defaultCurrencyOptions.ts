import { Addresses } from "constants/addresses"
import { Currency } from "types/currency"

const currencyOptions: Currency[] = [
  {
    contract: Addresses.WETH,
    symbol: "WETH",
    decimals: 18,
    logo: '/icons/currency/weth.png'
  },
]

export default currencyOptions
