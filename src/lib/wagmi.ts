import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'viem'

// Monad chain (custom)
export const monad = {
  id: 143, // <-- if you have the real Monad chainId, replace this
  name: 'Monad',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.monad.xyz'] },
    public: { http: ['https://rpc.monad.xyz'] },
  },
} as const

export const wagmiConfig = getDefaultConfig({
  appName: 'PHUCKMC',
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'YOUR_WALLETCONNECT_PROJECT_ID',
  chains: [monad],
  transports: {
    [monad.id]: http('https://rpc.monad.xyz'),
  },
  ssr: true,
})
export const config = wagmiConfig
