'use client'
import type { AppProps } from 'next/app'
import { Analytics } from '@vercel/analytics/react'

import RootLayout from './layout'

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <RootLayout>
      <Component {...pageProps} />
      <Analytics />
    </RootLayout>
  )
}

export default CustomApp
