'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useReadContract, useReadContracts } from 'wagmi'
import { formatUnits } from 'viem'
import { ConnectButton } from '@rainbow-me/rainbowkit'

import { STAKING_ABI, STAKING_ADDRESS } from '@/lib/contracts'

type Address = `0x${string}`

const TOKEN_CA = '0x148a3a811979e5BF8366FC279B2d67742Fe17777' as const

const ERC20_ABI = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'a', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
] as const

function compact(n: number) {
  if (!Number.isFinite(n)) return '—'
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(n)
}

export default function HomePage() {
  const [copied, setCopied] = useState(false)

  async function copyCA() {
    try {
      await navigator.clipboard.writeText(TOKEN_CA)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // ignore
    }
  }

  // staking contract addresses
  const { data: buybackWallet } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'BUYBACK_WALLET',
    query: { staleTime: 60_000, refetchInterval: 60_000 },
  })

  const { data: tokenFromStaking } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'TOKEN',
    query: { staleTime: 60_000, refetchInterval: 60_000 },
  })

  const tokenAddr = (tokenFromStaking as Address | undefined) ?? (TOKEN_CA as Address)
  const buyback = (buybackWallet as Address | undefined) ?? ('0x0000000000000000000000000000000000000000' as Address)

  // read core stats
  const { data: core } = useReadContracts({
    contracts: [
      { address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: 'totalStaked' },
      { address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: 'rewardsFundedTotal' },
      { address: tokenAddr, abi: ERC20_ABI, functionName: 'totalSupply' },
      { address: tokenAddr, abi: ERC20_ABI, functionName: 'decimals' },
      { address: tokenAddr, abi: ERC20_ABI, functionName: 'symbol' },
      { address: tokenAddr, abi: ERC20_ABI, functionName: 'balanceOf', args: [buyback] },
    ],
    query: { enabled: !!tokenAddr, staleTime: 15_000, refetchInterval: 15_000 },
  })

  const totalStaked = (core?.[0]?.result as bigint | undefined) ?? 0n
  const rewardsPaid = (core?.[1]?.result as bigint | undefined) ?? 0n
  const totalSupply = (core?.[2]?.result as bigint | undefined) ?? 0n
  const decimals = Number((core?.[3]?.result as number | undefined) ?? 18)
  const symbol = String((core?.[4]?.result as string | undefined) ?? 'PHUCKMC')
  const buybackBal = (core?.[5]?.result as bigint | undefined) ?? 0n

  const totalStakedNum = Number(formatUnits(totalStaked, decimals))
  const rewardsPaidNum = Number(formatUnits(rewardsPaid, decimals))
  const buybackBalNum = Number(formatUnits(buybackBal, decimals))

  const supplyLockedPct = useMemo(() => {
    if (!totalSupply || totalSupply === 0n) return 0
    const pct = (Number(totalStaked) / Number(totalSupply)) * 100
    if (!Number.isFinite(pct)) return 0
    return pct
  }, [totalStaked, totalSupply])

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      {/* BG */}
      <div className="absolute inset-0 -z-10">
        <Image src="/hero.png" alt="PHUCKMC hero" fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/60" />
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
              <div className="text-xs text-white/70">calm money • loud memes</div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Link href="/" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
              PHUCK
            </Link>
            <Link href="/swap" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
              Swap
            </Link>
            <Link href="/staking" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
              Staking
            </Link>

            {/* ✅ WALLET CONNECT */}
            <div className="ml-2">
              <ConnectButton />
            </div>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              PHUCK<span className="text-purple-300">MC</span>
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-xl">
              Calm money. Loud memes.
              <br />
              <span className="font-semibold text-white">Phuck what the chart says.</span>
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={`https://nad.fun/tokens/${TOKEN_CA}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:bg-purple-500"
              >
                Buy on Nad.fun
              </a>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/15 bg-black/25 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                Join Telegram →
              </a>
            </div>

            {/* CA ROW */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md p-4">
              <div className="text-xs tracking-widest text-white/60">CONTRACT</div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <code className="text-sm md:text-base text-white/90 break-all">{TOKEN_CA}</code>
                <button
                  onClick={copyCA}
                  className="shrink-0 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="rounded-3xl border border-white/10 bg-black/25 backdrop-blur-md p-6">
            <div className="text-sm tracking-widest text-white/70">PROJECT PULSE</div>

            <div className="mt-6 border-t border-white/10 pt-4 text-center text-sm text-white/70">
              NO PRESSURE. JUST PRESENCE.
              <div className="mt-1 text-xs text-white/50">{symbol} runs. You hold. Rewards flow.</div>
            </div>

            {/* bottom stats (REAL) */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-center">
                <div className="text-xs tracking-widest text-white/60">BUYBACK WALLET</div>
                <div className="mt-1 font-semibold">{compact(buybackBalNum)} {symbol}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-center">
                <div className="text-xs tracking-widest text-white/60">TOTAL REWARDS PAID</div>
                <div className="mt-1 font-semibold">{compact(rewardsPaidNum)} {symbol}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-center">
                <div className="text-xs tracking-widest text-white/60">SUPPLY LOCKED</div>
                <div className="mt-1 font-semibold">{supplyLockedPct.toFixed(2)}%</div>
              </div>
            </div>

            <div className="mt-3 text-center text-[11px] text-white/45">
              “Buyback wallet” reflects the token balance of the on-chain buyback address. “Total rewards paid” reflects lifetime funded rewards from the staking contract.
              “Supply locked” is total staked / total supply.
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
