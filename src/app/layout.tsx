import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Provider as WagmiProvider } from '@/providers/WagmiProvider'

import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'New-To-Web3-Wallet',
  applicationName: 'New To Web3 Wallet',
  description: 'Next.js Web3 Wallet built on Viem, Wagmi, RainbowKit and Chakra UI',
  authors: {
    name: 'Jake Xu',
    url: 'https://github.com/JakeXu/new-to-web3-wallet'
  },
  icons: 'favicon.ico'
}

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProvider>{children}</WagmiProvider>
      </body>
    </html>
  )
}
