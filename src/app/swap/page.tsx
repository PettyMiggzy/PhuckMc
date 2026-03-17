'use client'

import * as React from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { parseEther } from 'viem'
import { FEE_ROUTER, TOKEN_ADDRESS } from '@/lib/contracts'

const FEE_ROUTER_ABI = [
  { type: 'function', name: 'buy', stateMutability: 'payable', inputs: [{ name: 'token', type: 'address' }, { name: 'minOut', type: 'uint256' }], outputs: [] },
] as const

const CHAIN_ID = 143
type TxStatus = 'idle' | 'pending' | 'success' | 'error'
type FeeStats = { totalEvents: number; buybackMon: string }

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">{children}</div>
}

export default function SwapPage() {
  const { isConnected, chainId } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const [monIn, setMonIn] = React.useState('0.1')
  const [slippage, setSlippage] = React.useState('2')
  const [status, setStatus] = React.useState<TxStatus>('idle')
  const [txHash, setTxHash] = React.useState<string | null>(null)
  const [txError, setTxError] = React.useState<string | null>(null)
  const [stats, setStats] = React.useState<FeeStats | null>(null)
  const [statsErr, setStatsErr] = React.useState<string | null>(null)

  async function loadStats() {
    try {
      setStatsErr(null)
      const r = await fetch('/api/fees/stats', { cache: 'no-store' })
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || `HTTP ${r.status}`)
      setStats(await r.json())
    } catch (e: any) {
      setStatsErr(e?.message || 'Stats server not connected')
    }
  }

  React.useEffect(() => { loadStats(); const t = setInterval(loadStats, 15_000); return () => clearInterval(t) }, [])

  const wrongNetwork = isConnected && chainId !== CHAIN_ID

  async function onBuy() {
    if (!walletClient || !publicClient) return
    if (wrongNetwork) { setTxError('Switch to Monad Mainnet (chain 143) in your wallet.'); return }
    const monWei = (() => { try { return parseEther(monIn || '0') } catch { return 0n } })()
    if (monWei <= 0n) { setTxError('Enter a valid MON amount.'); return }
    setStatus('pending'); setTxHash(null); setTxError(null)
    try {
      const hash = await walletClient.writeContract({
        address: FEE_ROUTER, abi: FEE_ROUTER_ABI, functionName: 'buy',
        args: [TOKEN_ADDRESS, 0n], value: monWei,
      })
      setTxHash(hash)
      await publicClient.waitForTransactionReceipt({ hash })
      setStatus('success')
      setTimeout(loadStats, 3000)
    } catch (e: any) {
      setTxError(e?.shortMessage || e?.message?.split('\n')[0] || 'Transaction failed')
      setStatus('error')
    }
  }

  const loading = status === 'pending'

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Swap</h1>
        <p className="text-white/60 mt-2">Routes through fee router ({FEE_ROUTER.slice(0,6)}…{FEE_ROUTER.slice(-4)}). <span className="text-white/80">1% buy fee → buyback wallet.</span></p>
      </div>
      {wrongNetwork && (
        <div className="mb-6 rounded-xl border border-yellow-400/30 bg-yellow-500/10 px-4 py-3 text-yellow-200 text-sm">
          ⚠️ You’re on chain {chainId}. Switch to <strong>Monad Mainnet (143)</strong> in your wallet.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3">
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="text-white/80 text-sm font-semibold">Buy PHUCKMC</div>
              <div className="text-white/40 text-xs">via fee router → nad.fun</div>
            </div>
            <div className="mb-4">
              <div className="text-white/60 text-xs mb-1">Token out</div>
              <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white/90 break-all text-sm font-mono">{TOKEN_ADDRESS}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div>
                <div className="text-white/70 text-sm mb-2">MON in</div>
                <input value={monIn} onChange={e => setMonIn(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white outline-none" placeholder="0.1" inputMode="decimal" disabled={loading} />
              </div>
              <div>
                <div className="text-white/70 text-sm mb-2">Slippage %</div>
                <input value={slippage} onChange={e => setSlippage(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white outline-none" placeholder="2" inputMode="decimal" disabled={loading} />
              </div>
            </div>
            <button onClick={onBuy} disabled={!isConnected || loading || wrongNetwork} className="mt-6 w-full rounded-xl py-3 font-semibold bg-white text-black hover:opacity-90 disabled:opacity-40 transition">
              {!isConnected ? 'Connect wallet to buy' : loading ? 'Buying…' : wrongNetwork ? 'Switch to Monad' : `Buy PHUCKMC with ${monIn || '0'} MON`}
            </button>
            <div className="mt-3 text-xs text-white/40">Fee router takes 1% in MON and forwards the rest to nad.fun DEX.</div>
            {status === 'success' && txHash && (
              <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-emerald-200 text-sm">
                ✅ Confirmed! <a href={`https://monad-mainnet.blockscout.com/tx/${txHash}`} target="_blank" rel="noreferrer" className="underline">View on explorer →</a>
              </div>
            )}
            {txError && <div className="mt-4 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">❌ {txError}</div>}
            {status === 'pending' && txHash && (
              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white/60 text-sm">
                ⏳ Waiting… <a href={`https://monad-mainnet.blockscout.com/tx/${txHash}`} target="_blank" rel="noreferrer" className="underline text-white/80">{txHash.slice(0,16)}…</a>
              </div>
            )}
            <div className="mt-5 pt-5 border-t border-white/10">
              <div className="text-white/50 text-xs mb-2">Or buy directly:</div>
              <div className="flex gap-3">
                <a href={`https://nad.fun/tokens/${TOKEN_ADDRESS}`} target="_blank" rel="noreferrer" className="flex-1 rounded-xl border border-white/10 bg-black/30 py-2 text-center text-sm text-white/80 hover:bg-white/10 transition">⬡ Nad.fun</a>
                <a href="https://join.pump.fun/HSag/5uk0701t" target="_blank" rel="noreferrer" className="flex-1 rounded-xl border border-white/10 bg-black/30 py-2 text-center text-sm text-white/80 hover:bg-white/10 transition">◎ Pump.fun</a>
              </div>
            </div>
          </Card>
        </div>
        <div className="md:col-span-2 space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="text-white font-semibold">Fee Revenue</div>
              <button onClick={loadStats} className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-white/80 text-xs">Refresh</button>
            </div>
            {statsErr ? (
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-white/50 text-sm">
                <div className="font-semibold text-white/70 mb-1">Stats server offline</div>
                <div className="text-xs">{statsErr}</div>
                <div className="mt-2 text-xs text-white/35">Set <code className="text-white/50">FEE_API_BASE</code> in Vercel env vars.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="text-white/60 text-sm">Total swaps</div><div className="text-3xl font-bold text-white mt-1">{stats?.totalEvents ?? '—'}</div></div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-4"><div className="text-white/60 text-sm">MON collected</div><div className="text-3xl font-bold text-white mt-1">{stats?.buybackMon ?? '—'}</div><div className="text-white/35 text-xs mt-1">to buyback wallet</div></div>
              </div>
            )}
          </Card>
          <Card>
            <div className="text-white/70 text-sm font-semibold mb-3">Contracts</div>
            {[{ label: 'PHUCKMC', addr: TOKEN_ADDRESS }, { label: 'Fee Router', addr: FEE_ROUTER }].map(({ label, addr }) => (
              <div key={addr} className="mb-3 last:mb-0">
                <div className="text-white/50 text-xs mb-1">{label}</div>
                <div className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-white/70 text-xs font-mono break-all cursor-pointer hover:bg-white/5" onClick={() => navigator.clipboard.writeText(addr)} title="Click to copy">{addr}</div>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </main>
  )
}
