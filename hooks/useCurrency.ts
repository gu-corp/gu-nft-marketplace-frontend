import currencyOptions from "components/@reservoir0x/lib/defaultCurrencyOptions"

export default (address?: string) => {
  return currencyOptions.find(currency => currency.contract === address) || currencyOptions[0]
}