'use client'

import * as React from 'react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { injected, walletConnect } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Monad mainnet-ish chain config (you already use 143)
const monad = {
  id: 143,
  name: 'Monad',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.monad.xyz'] },
    public: { http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.monad.xyz'] },
  },
} as const

const config = createConfig({
  chains: [monad],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || '',
      showQrModal: true,
    }),
  ],
  transports: {
    [monad.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.monad.xyz'),
  },
  ssr: true,
})

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
