import { FC, createContext, ReactNode, useContext, useEffect, useState } from "react";
import { GUNftMarketplaceSdk, Signer, SupportedChainId, SupportedNetworkId } from "@gulabs/gu-nft-marketplace-sdk"
import { providers } from "ethers";


const createSdk = (opts: SdkOptions) => {
  return new GUNftMarketplaceSdk(opts.chainId, opts.networkId, opts.provider, opts.signer || undefined)
}


export interface SdkOptions {
  chainId: SupportedChainId;
  networkId: SupportedNetworkId;
  provider: providers.Provider;
  signer?: Signer | null;
}

export interface SdkProviderProps {
  children: ReactNode
  options: SdkOptions
}

export const SdkContext = createContext<GUNftMarketplaceSdk|null>(
  null
)

export const SdkProvider: FC<SdkProviderProps> = ({ children, options }) => {
  const [Sdk, setSdk] = useState<GUNftMarketplaceSdk|null>(null)

  useEffect(() => {
    setSdk(createSdk(options))
  }, [options])

  return (
    <SdkContext.Provider value={Sdk}>
      {children}
    </SdkContext.Provider>
  )
}
export const useSdk = () => {
  const sdk = useContext(SdkContext);
  if (!sdk) {
    throw Error("Sdk is not initialize!")
  }
  return sdk
}
