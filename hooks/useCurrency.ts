import currencyOptions from "components/@reservoir0x/reservoir-kit-ui/lib/defaultCurrencyOptions"

export default (address?: string) => {
  return currencyOptions.find(currency => currency.contract === address) || currencyOptions[0]
}