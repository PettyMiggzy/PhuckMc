'use client'

import * as React from 'react'
import { useAccount } from 'wagmi'

const PHUCKMC = '0x148a3a811979e5BF8366FC279B2d67742Fe17777'
const FEE_ROUTER = '0x60832a12f12a971Aa530beb671baB2991d4afB7f'
const CHAIN_ID = 143

type FeeStats = {
  totalEvents: number
  buybackMon: string
  buybackMonRaw: string
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      {children}
    </div>
  )
}

export default function SwapPage() {
  const { isConnected } = useAccount()
  const [monIn, setMonIn] = React.useState('0.1')
  const [slippage, setSlippage] = React.useState('2')
  const [loading, setLoading] = React.useState(false)

  const [stats, setStats] = React.useState<FeeStats | null>(null)
  const [statsErr, setStatsErr] = React.useState<string | null>(null)

  async function loadStats() {
    try {
      setStatsErr(null)
      const r = await fetch('/api/fees/stats', { cache: 'no-store' })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'Failed to load stats')
      setStats(j)
    } catch (e: any) {
      setStatsErr(e?.message || 'Failed to load stats')
    }
  }

  React.useEffect(() => {
    loadStats()
    const t = setInterval(loadStats, 8000)
    return () => clearInterval(t)
  }, [])

  async function onBuy() {
    // NOTE:
    // Your previous buy logic that builds routerCalldata + calls buyVia belongs here.
    // I’m not changing your swap mechanics in this pass—this is UI + stats + connect fix.
    // If your current Buy already works, paste your working buy function right here.
    alert('Paste your working buyVia transaction code here (the one you tested on server).')
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Swap</h1>
        <p className="text-white/60 mt-2">
          Routes through your fee router ({FEE_ROUTER.slice(0, 6)}…{FEE_ROUTER.slice(-4)}).{' '}
          <span className="text-white/80">1% buy + 1% sell fee.</span>
        </p>
        <p className="text-white/40 mt-1 text-sm">
          Chain: Monad ({CHAIN_ID}) • Token: PHUCKMC ({PHUCKMC.slice(0, 6)}…{PHUCKMC.slice(-4)})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Swap box */}
        <div className="md:col-span-3">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="text-white/80 text-sm">Token out</div>
              <div className="text-white/60 text-xs">Default: PHUCKMC</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white/90 break-all">
              {PHUCKMC}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div>
                <div className="text-white/70 text-sm mb-2">MON in</div>
                <input
                  value={monIn}
                  onChange={(e) => setMonIn(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white outline-none"
                  placeholder="0.1"
                  inputMode="decimal"
                />
              </div>
              <div>
                <div className="text-white/70 text-sm mb-2">Slippage %</div>
                <input
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white outline-none"
                  placeholder="2"
                  inputMode="decimal"
                />
              </div>
            </div>

            <button
              onClick={onBuy}
              disabled={!isConnected || loading}
              className="mt-6 w-full rounded-xl py-3 font-semibold bg-white text-black hover:opacity-90 disabled:opacity-40"
            >
              {!isConnected ? 'Connect wallet to buy' : loading ? 'Buying…' : 'Buy'}
            </button>

            <div className="mt-3 text-xs text-white/40">
              Fee router takes 1% in MON and forwards the rest to Nad.
            </div>
          </Card>
        </div>

        {/* Stats box */}
        <div className="md:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="text-white font-semibold">Revenue</div>
              <button
                onClick={loadStats}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white/80 text-xs"
              >
                Refresh
              </button>
            </div>

            {statsErr && (
              <div className="text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                {statsErr}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-white/60 text-sm">Total swaps tracked</div>
                <div className="text-3xl font-bold text-white mt-1">{stats?.totalEvents ?? '—'}</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-white/60 text-sm">Total MON collected</div>
                <div className="text-3xl font-bold text-white mt-1">{stats?.buybackMon ?? '—'}</div>
                <div className="text-white/35 text-xs mt-1">to your buyback wallet</div>
              </div>
            </div>

            <div className="mt-4 text-xs text-white/35">
              This reads your server indexer (FeePaid events). People can verify on-chain anytime.
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}
