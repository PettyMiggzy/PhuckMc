'use client'

import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function WalletButton() {
  return (
    <div className="shrink-0">
      <ConnectButton
        accountStatus="avatar"
        chainStatus="icon"
        showBalance={false}
      />
    </div>
  )
}
