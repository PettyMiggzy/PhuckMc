'use client'

import * as React from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

function shortAddr(a?: string) {
  if (!a) return ''
  return `${a.slice(0, 6)}...${a.slice(-4)}`
}

export default function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connectors, connectAsync, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  async function onConnect() {
    // Prefer WalletConnect if available, otherwise injected
    const wc = connectors.find((c) => c.id === 'walletConnect')
    const inj = connectors.find((c) => c.id === 'injected')
    const pick = wc ?? inj ?? connectors[0]
    if (!pick) return
    await connectAsync({ connector: pick })
  }

  return (
    <button
      onClick={isConnected ? () => disconnect() : onConnect}
      disabled={isPending}
      className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white/90 text-sm"
      title={isConnected ? address : 'Connect wallet'}
    >
      {isConnected ? shortAddr(address) : isPending ? 'Connecting…' : 'Connect'}
    </button>
  )
}
