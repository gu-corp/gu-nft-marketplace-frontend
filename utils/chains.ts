import { Chain } from 'wagmi/chains'

//CONFIGURABLE: The default export controls the supported chains for the marketplace. Removing
// or adding chains will result in adding more or less chains to the marketplace.
// They are an extension of the wagmi chain objects

type MarketChain = Chain & {
  lightIconUrl: string
  darkIconUrl: string
  routePrefix: string
}

export const gusanbox: MarketChain = {
  id: 99999,
  network: "G.U.Sandbox chain",
  name: "G.U.Sandbox chain",
  nativeCurrency: {
    name: "GU Ether",
    symbol: "STH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://sandbox1.japanopenchain.org:8545"],
    },
    public: {
      http: ["https://sandbox1.japanopenchain.org:8545"],
    }
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: "https://sandbox1.japanopenchain.org",
    },
  },
  testnet: true,
  lightIconUrl: '/icons/goerli-icon-dark.svg',
  darkIconUrl: '/icons/goerli-icon-light.svg',
  routePrefix: 'gusandbox',
};

export const DefaultChain = {
  ...gusanbox,
}
export default [
  DefaultChain,
] as MarketChain[]
