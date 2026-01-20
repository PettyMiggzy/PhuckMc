import Link from 'next/link'
import WalletButton from './WalletButton'

function NavPill({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-sm"
    >
      {label}
    </Link>
  )
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-black/30 border-b border-white/5">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="font-bold tracking-wide text-white">PHUCKMC</div>
          <div className="text-white/50 text-sm">Router + Staking</div>
        </div>

        <nav className="flex items-center gap-2">
          <NavPill href="/" label="Home" />
          <NavPill href="/swap" label="Swap" />
          <NavPill href="/staking" label="Stake" />
          {/* removed Fees */}
          <WalletButton />
        </nav>
      </div>
    </header>
  )
}
