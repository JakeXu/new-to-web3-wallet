'use client'
import { type ReactNode, useState, useEffect } from 'react'
import { CacheProvider } from '@chakra-ui/next-js'
import { extendTheme, ChakraProvider } from '@chakra-ui/react'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { WagmiConfig } from '@/contants/Wagmi'

export function Provider({ children }: Readonly<{ children: ReactNode }>) {
  const [mounted, setMounted] = useState(false)

  const queryClient = new QueryClient()

  const theme = extendTheme({ useSystemColorMode: true })

  const appInfo = {
    appName: 'New-To-Web3-Wallet'
  }

  useEffect(() => setMounted(true), [])

  return (
    <WagmiProvider config={WagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <CacheProvider>
          <ChakraProvider resetCSS theme={theme}>
            <RainbowKitProvider coolMode appInfo={appInfo}>
              {mounted && children}
            </RainbowKitProvider>
          </ChakraProvider>
        </CacheProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
