import { ETH, WETH } from "./useCurrencyOptions"

const useCurrency = (address?: string) => {
  return [WETH, ETH].find(currency => currency.contract.toLowerCase() === address?.toLowerCase()) || WETH
}

export default useCurrency