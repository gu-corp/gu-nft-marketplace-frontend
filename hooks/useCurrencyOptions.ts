import { Order } from "__generated__/graphql"
import { Addresses } from "constants/addresses"
import { constants } from "ethers"
import { Currency } from "types/currency"

export const WETH: Currency =   {
  contract: Addresses.WETH,
  symbol: "WETH",
  decimals: 18,
  logo: '/icons/currency/weth.png'
}

export const ETH: Currency =   {
  contract: constants.AddressZero,
  symbol: "ETH",
  decimals: 18,
  logo: '/icons/currency/eth.png'
}

const useCurrencyOptions = (order?: Order) => {
  if (!order) {
    return [WETH]
  }

  if (order.isOrderAsk && order.currencyAddress.toLowerCase() === WETH.contract.toLowerCase()) {
    return [
      WETH,
      ETH
    ]
  }

  return [WETH, ETH].filter(currency => currency.contract.toLowerCase() !== order.currencyAddress.toLowerCase()) || [WETH]
}

export default useCurrencyOptions
