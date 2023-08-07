import { ETH, WETH } from "./useCurrencyOptions"

export default (address?: string) => {
  return [WETH, ETH].find(currency => currency.contract === address) || WETH
}