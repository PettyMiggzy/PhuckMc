'use client'

import Image from 'next/image'
import Link from 'next/link'
import WalletButton from '@/components/WalletButton'
import StakingPanel from '@/components/StakingPanel'

export default function StakingPage() {
  const missingWC = !process.env.NEXT_PUBLIC_WC_PROJECT_ID

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero.png"
          alt="PHUCKMC"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/70" />
      </div>

      {/* Top Nav */}
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

          <nav className="hidden md:flex items-center gap-2">
            <Link href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
              Home
            </Link>
            <Link href="/swap" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
              Swap
            </Link>
            <Link href="/staking" className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm">
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

          <WalletButton />
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-16 relative z-10">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
          Stake <span className="text-purple-300">PHUCKMC</span>
        </h1>
        <p className="mt-3 text-white/80 max-w-2xl">
          Time-weighted staking. Longer locks earn more. Early exits feed the reward pool.
        </p>

        {missingWC ? (
          <div className="mt-8 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
            Missing <span className="font-semibold">NEXT_PUBLIC_WC_PROJECT_ID</span> on Vercel.
            <div className="mt-1 text-sm text-red-200/80">
              Add it in Vercel → Project → Settings → Environment Variables, then redeploy.
            </div>
          </div>
        ) : null}

        <div className="mt-10">
          <StakingPanel />
        </div>
      </section>
    </main>
  )
}
