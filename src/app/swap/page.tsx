'use client'

import StakingPanel from '@/components/StakingPanel'
import Image from 'next/image'
import Link from 'next/link'

export default function StakingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero.png"
          alt="PHUCKMC staking"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
        <div className="absolute inset-0 bg-black/65" />
      </div>

      <header className="mx-auto max-w-7xl px-6 pt-6">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 backdrop-blur-md px-4 py-3">
          <div className="font-semibold">PHUCKMC</div>
          <nav className="flex gap-2">
            <Link href="/" className="px-4 py-2 rounded-full bg-white/5">
              Home
            </Link>
            <Link href="/staking" className="px-4 py-2 rounded-full bg-purple-500/20">
              Staking
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pt-16 pb-24">
        <StakingPanel />
      </section>
    </main>
  )
}
