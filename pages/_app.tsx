import type { AppContext, AppProps } from 'next/app'
import { default as NextApp } from 'next/app'
import { ThemeProvider, useTheme } from 'next-themes'
import { darkTheme, globalReset, lightTheme } from 'stitches.config'
import '@rainbow-me/rainbowkit/styles.css'
import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme as rainbowDarkTheme,
  lightTheme as rainbowLightTheme,
} from '@rainbow-me/rainbowkit'
import { WagmiConfig, createClient, configureChains, useProvider, useSigner } from 'wagmi'
import * as Tooltip from '@radix-ui/react-tooltip'
import { publicProvider } from 'wagmi/providers/public'
import { FC, useEffect, useState } from 'react'
import { HotkeysProvider } from 'react-hotkeys-hook'
import ToastContextProvider from 'context/ToastContextProvider'
import supportedChains from 'utils/chains'
import { useDefaultChain } from 'hooks'
import { ApolloProvider } from "@apollo/client";
import { useApollo } from 'graphql/apollo-client'
import { SdkProvider } from 'context/SDKProvider'
import { Signer, SupportedNetworkId } from "@gulabs/gu-nft-marketplace-sdk"
import { CartProvider } from 'components/@reservoir0x/context/CartProvider'
import {
  metaMaskWallet,
} from '@rainbow-me/rainbowkit/wallets';

const { chains, provider } = configureChains(supportedChains, [
  publicProvider(),
])

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      metaMaskWallet({ chains }),
    ],
  }
]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

function AppWrapper(props: AppProps & { baseUrl: string }) {
  const client = useApollo(props)
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      value={{
        dark: darkTheme.className,
        light: lightTheme.className,
      }}
    >
      <WagmiConfig client={wagmiClient}>
        <ApolloProvider client={client}>
          <MyApp {...props} />
        </ApolloProvider>
      </WagmiConfig>
    </ThemeProvider>
  )
}

function MyApp({
  Component,
  pageProps,
}: AppProps & { baseUrl: string }) {
  globalReset()

  const { theme } = useTheme()
  const defaultChain = useDefaultChain()
  const provider = useProvider()
  const { data: signer } = useSigner<Signer>()
  

  const [rainbowKitTheme, setRainbowKitTheme] = useState<
    | ReturnType<typeof rainbowDarkTheme>
    | ReturnType<typeof rainbowLightTheme>
    | undefined
  >()

  useEffect(() => {
    if (theme == 'dark') {
      setRainbowKitTheme(
        rainbowDarkTheme({
          borderRadius: 'small',
        })
      )
    } else {
      setRainbowKitTheme(
        rainbowLightTheme({
          borderRadius: 'small',
        })
      )
    }
  }, [theme])

  const FunctionalComponent = Component as FC
  return (
    <HotkeysProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        value={{
          dark: darkTheme.className,
          light: 'light',
        }}
      >
          <CartProvider>
            <Tooltip.Provider>
              <RainbowKitProvider
                chains={chains}
                theme={rainbowKitTheme}
                modalSize="compact"
              >
                <ToastContextProvider>
                  <SdkProvider options={{
                    chainId: defaultChain.id,
                    networkId: process.env.NEXT_PUBLIC_NETWORK_ID as SupportedNetworkId,
                    provider,
                    signer
                  }}>
                    <FunctionalComponent {...pageProps} />
                  </SdkProvider>
                </ToastContextProvider>
              </RainbowKitProvider>
            </Tooltip.Provider>
          </CartProvider>
      </ThemeProvider>
    </HotkeysProvider>
  )
}

AppWrapper.getInitialProps = async (appContext: AppContext) => {
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await NextApp.getInitialProps(appContext)
  let baseUrl = ''

  if (appContext.ctx.req?.headers.host) {
    const host = appContext.ctx.req?.headers.host
    baseUrl = `${host.includes('localhost') ? 'http' : 'https'}://${host}`
  }
  baseUrl = baseUrl.replace(/\/$/, '')

  return { ...appProps, baseUrl }
}

export default AppWrapper
