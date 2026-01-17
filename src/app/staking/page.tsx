'use client'

import Image from 'next/image'
import Link from 'next/link'
import StakingPanel from '@/components/StakingPanel'
import WalletButton from '@/components/WalletButton'

export default function StakingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      {/* BG */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero.png"
          alt="PHUCKMC staking"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-black/70" />
      </div>

      {/* TOP NAV */}
      <header className="mx-auto max-w-7xl px-6 pt-6">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 backdrop-blur-md px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <Image src="/logo.png" alt="PHUCKMC" fill sizes="36px" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold tracking-wide">PHUCKMC</div>
              <div className="text-xs text-white/70">staking</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-2">
              <Link
                href="/"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                Home
              </Link>
              <Link
                href="/swap"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                Swap
              </Link>
              <Link
                href="/staking"
                className="rounded-full border border-purple-400/40 bg-purple-500/15 px-4 py-2 text-sm"
              >
                Staking
              </Link>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              >
                Telegram
              </a>
            </nav>

            {/* Wallet connect */}
            <div className="hidden sm:block">
              <WalletButton />
            </div>
          </div>
        </div>

        {/* Mobile wallet */}
        <div className="mt-3 sm:hidden">
          <div className="rounded-2xl border border-white/10 bg-black/25 backdrop-blur-md px-4 py-3">
            <WalletButton />
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-24">
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Stake <span className="text-purple-300">PHUCKMC</span>
          </h1>
          <p className="mt-3 text-white/75 max-w-2xl">
            Time-weighted staking. Longer locks earn more. Early exits feed the reward pool.
          </p>
        </div>

        <StakingPanel />
      </section>
    </main>
  )
}
