'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'

import RewardsCore from './RewardsCore'
import StakeModal from './StakeModal'
import { useRewardsPool } from '@/hooks/useRewardsPool'
import { useStakingData } from '@/hooks/useStakingData'
import { ERC20_ABI, STAKING_ABI, STAKING_ADDRESS } from '@/lib/contracts'
import { GAS } from '@/lib/gas'

// ─── helpers ────────────────────────────────────────────────────────────────
function fmtCompact(n: number) {
  if (!Number.isFinite(n) || n === 0) return '0'
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(n)
}
function fmtPrecise(n: number) {
  if (!Number.isFinite(n)) return '0'
  const d = n === 0 ? 0 : n < 0.0001 ? 10 : n < 0.01 ? 8 : n < 1 ? 6 : 4
  return Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(n)
}
function toClock(sec: number) {
  const s = Math.max(0, Math.floor(sec))
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60)
  if (d > 0) return `${d}d ${h}h`
  return `${h}h ${m}m`
}
function toNum(x: bigint | undefined, dec: number) {
  try { return Number(formatUnits(x ?? 0n, dec)) } catch { return 0 }
}
function sharePct(w: bigint, total: bigint) {
  if (total <= 0n) return 0
  return Number((w * 10000n) / total) / 100
}

// ─── sub-components ──────────────────────────────────────────────────────────
function GlassCard({ children, accent, style }: { children: React.ReactNode; accent?: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      borderRadius: 20,
      border: `1px solid ${accent ? accent + '30' : 'rgba(255,255,255,0.07)'}`,
      background: accent ? `linear-gradient(135deg,${accent}08 0%,rgba(8,6,18,0.7) 100%)` : 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      overflow: 'hidden',
      ...style
    }}>
      {children}
    </div>
  )
}

function CardHeader({ label, right }: { label: string; right?: React.ReactNode }) {
  return (
    <div style={{
      padding: '14px 20px',
      borderBottom: 'rgba(255,255,255,0.06) 1px solid',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(0,0,0,0.15)'
    }}>
      <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1rem', letterSpacing: '.12em', color: 'rgba(192,132,252,0.85)' }}>{label}</span>
      {right}
    </div>
  )
}

function Stat({ label, value, sub, big, green, purple }: {
  label: string; value: string; sub?: string; big?: boolean; green?: boolean; purple?: boolean
}) {
  const col = green ? '#c8ff00' : purple ? '#c084fc' : '#f0eeff'
  return (
    <div style={{
      padding: '16px 18px', borderRadius: 14,
      border: `1px solid ${green ? 'rgba(200,255,0,0.15)' : purple ? 'rgba(192,132,252,0.15)' : 'rgba(255,255,255,0.06)'}`,
      background: green ? 'rgba(200,255,0,0.04)' : purple ? 'rgba(192,132,252,0.04)' : 'rgba(255,255,255,0.025)',
      position: 'relative', overflow: 'hidden'
    }}>
      {(green || purple) && <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${col}50,transparent)` }}/>}
      <div style={{ fontSize: '.62rem', letterSpacing: '.16em', color: 'rgba(240,238,255,0.4)', fontWeight: 700, marginBottom: 7 }}>{label}</div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: big ? '2rem' : '1.6rem', color: col, lineHeight: 1, letterSpacing: '.03em' }}>{value}</div>
      {sub && <div style={{ fontSize: '.7rem', color: 'rgba(240,238,255,0.35)', marginTop: 5 }}>{sub}</div>}
    </div>
  )
}

function Dot({ on }: { on: boolean }) {
  return <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background: on?'#c8ff00':'rgba(255,255,255,0.2)', boxShadow: on?'0 0 8px #c8ff00':'none', flexShrink:0 }}/>
}

// ─── main component ──────────────────────────────────────────────────────────
export default function StakingPanel() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { address, isConnected } = useAccount()
  const d = useStakingData()
  const { poolNum, fundedNum, capacityNum, fillRatio, pulse } = useRewardsPool()

  const dec = d.tokenDecimals ?? 18
  const sym = d.tokenSymbol  ?? 'PHUCKMC'
  const now = Math.floor(Date.now() / 1000)

  const unlockIn = useMemo(() => {
    if (!d.hasStake) return 0
    return Math.max(0, Number(d.position.unlockTime) - now)
  }, [d.hasStake, d.position.unlockTime, now])

  const unlocked    = d.hasStake && unlockIn === 0
  const staked      = toNum(d.position.amount, dec)
  const pendingRaw  = toNum(d.pendingRewards, dec)
  const pending     = Math.min(pendingRaw, poolNum) // cap at pool balance
  const share       = sharePct(d.currentWeight ?? 0n, d.totalWeight ?? 0n)
  const mult        = d.multiplier ? (Number(d.multiplier) / 100).toFixed(2) : null
  const totalStaked = toNum(d.totalStaked, dec)

  if (!mounted) return (
    <div style={{ padding:'3rem', textAlign:'center', color:'rgba(240,238,255,0.3)', fontSize:'.9rem' }}>Loading…</div>
  )

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:'1.5rem', alignItems:'start' }}>

      {/* ════ LEFT ════════════════════════════════════════ */}
      <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

        {/* YOUR POSITION */}
        <GlassCard accent="rgba(153,69,255,1)">
          <CardHeader
            label="YOUR POSITION"
            right={
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <Dot on={d.hasStake} />
                <span style={{ fontSize:'.72rem', fontWeight:700, letterSpacing:'.1em', color: d.hasStake ? '#c8ff00' : 'rgba(240,238,255,0.3)' }}>
                  {d.hasStake ? 'ACTIVE' : 'NO STAKE'}
                </span>
              </div>
            }
          />

          {!isConnected ? (
            <div style={{ padding:'3rem 2rem', textAlign:'center' }}>
              <div style={{ fontSize:'2.5rem', marginBottom:'1rem' }}>🔐</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.4rem', letterSpacing:'.08em', marginBottom:8 }}>Connect Your Wallet</div>
              <p style={{ color:'rgba(240,238,255,0.4)', fontSize:'.88rem', marginBottom:'1.5rem', lineHeight:1.6 }}>
                Connect to view your position and stake PHUCKMC
              </p>
              <StakeModal tokenAddress={d.tokenAddress} tokenDecimals={dec} tokenSymbol={sym} />
            </div>
          ) : (
            <>
              <div style={{ padding:'20px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
                <Stat label="STAKED" value={fmtCompact(staked)} sub={sym} />
                <Stat
                  label="PENDING REWARDS"
                  value={fmtPrecise(pending)}
                  sub={pendingRaw > poolNum ? `Pool: ${fmtCompact(poolNum)} avail.` : sym}
                  green={pending > 0}
                />
                <Stat
                  label="UNLOCKS IN"
                  value={d.hasStake ? (unlocked ? 'READY ✓' : toClock(unlockIn)) : '—'}
                  green={unlocked}
                  purple={d.hasStake && !unlocked}
                />
              </div>
              <div style={{ padding:'0 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
                <Stat label="REWARD SHARE" value={share.toFixed(4) + '%'} sub="of total weight" />
                <Stat label="MULTIPLIER" value={mult ? mult + '×' : '—'} sub="based on lock" purple={!!mult} />
              </div>

              {d.hasStake && !unlocked && (
                <div style={{ margin:'0 20px 20px', padding:'12px 16px', borderRadius:12, border:'1px solid rgba(251,146,60,0.2)', background:'rgba(251,146,60,0.05)', fontSize:'.8rem', color:'rgba(253,186,116,0.75)', lineHeight:1.6 }}>
                  ⚡ <strong style={{ color:'#fb923c' }}>Early exit penalty: 10%</strong> — 60% back to pool, 40% to buyback
                </div>
              )}

              <div style={{ padding:'0 20px 20px' }}>
                <StakeModal tokenAddress={d.tokenAddress} tokenDecimals={dec} tokenSymbol={sym} />
              </div>
            </>
          )}
        </GlassCard>

        {/* PROTOCOL STATS */}
        <GlassCard>
          <CardHeader label="PROTOCOL STATS" right={<span style={{ fontSize:'.7rem', color:'rgba(240,238,255,0.25)', letterSpacing:'.06em' }}>ON-CHAIN</span>} />
          <div style={{ padding:'20px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            <Stat label="TOTAL STAKED"    value={fmtCompact(totalStaked)} sub={sym} green />
            <Stat label="REWARDS POOL"    value={fmtCompact(poolNum)}     sub={sym} green />
            <Stat label="LIFETIME FUNDED" value={fmtCompact(fundedNum)}   sub={sym} green />
          </div>
          {d.buybackWallet && (
            <div style={{ padding:'0 20px 20px' }}>
              <div style={{ padding:'12px 16px', borderRadius:12, border:'1px solid rgba(255,255,255,0.05)', background:'rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize:'.6rem', letterSpacing:'.16em', color:'rgba(240,238,255,0.3)', fontWeight:700, marginBottom:5 }}>BUYBACK WALLET</div>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'.73rem', color:'rgba(240,238,255,0.4)', wordBreak:'break-all' }}>{d.buybackWallet}</div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* TRANSPARENCY NOTE */}
        <div style={{ padding:'14px 18px', borderRadius:14, border:'1px solid rgba(255,255,255,0.05)', background:'rgba(255,255,255,0.02)', fontSize:'.76rem', color:'rgba(240,238,255,0.35)', lineHeight:1.7 }}>
          <strong style={{ color:'rgba(200,255,0,0.5)' }}>Note: </strong>
          This contract has an emergency withdrawal path — processed case-by-case, not guaranteed. Contact the team if needed.
        </div>
      </div>

      {/* ════ RIGHT ═══════════════════════════════════════ */}
      <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem', position:'sticky', top:80 }}>

        {/* REWARD REACTOR */}
        <GlassCard accent="rgba(153,69,255,1)">
          <CardHeader
            label="REWARD REACTOR"
            right={
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <Dot on={pulse} />
                <span style={{ fontSize:'.7rem', fontWeight:700, letterSpacing:'.1em', color: pulse ? '#c8ff00' : 'rgba(240,238,255,0.3)' }}>
                  {pulse ? 'FUNDED' : 'EMPTY'}
                </span>
              </div>
            }
          />
          <div style={{ padding:'20px 22px' }}>
            <RewardsCore fill={fillRatio} pulse={pulse} />
          </div>
          <div style={{ padding:'0 20px 20px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
            {[
              { l:'POOL',    v:fmtCompact(poolNum) },
              { l:'TARGET',  v:fmtCompact(capacityNum) },
              { l:'FUNDED',  v:fmtCompact(fundedNum) },
            ].map(({ l, v }) => (
              <div key={l} style={{ padding:'10px 8px', borderRadius:10, border:'1px solid rgba(255,255,255,0.06)', background:'rgba(0,0,0,0.2)', textAlign:'center' }}>
                <div style={{ fontSize:'.58rem', letterSpacing:'.14em', color:'rgba(240,238,255,0.35)', fontWeight:700 }}>{l}</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.15rem', color:'#c8ff00', marginTop:3 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ padding:'0 20px 16px', fontSize:'.7rem', color:'rgba(240,238,255,0.2)', textAlign:'center' }}>Funded with {sym} (not MON)</div>
        </GlassCard>

        {/* HOW IT WORKS */}
        <GlassCard>
          <CardHeader label="HOW IT WORKS" />
          <div style={{ padding:'18px 20px' }}>
            {[
              { n:'01', t:'Choose your lock',     d:'30 / 60 / 90 / 365 days. Longer = higher multiplier.' },
              { n:'02', t:'Earn weighted rewards', d:'Your share grows with your time-weight multiplier.' },
              { n:'03', t:'Claim anytime',         d:'Withdraw rewards at any time. Principal unlocks after lock.' },
              { n:'04', t:'Early exit',            d:'10% penalty: 60% to pool, 40% to buyback wallet.' },
            ].map(({ n, t, d }) => (
              <div key={n} style={{ display:'flex', gap:14, marginBottom:16, alignItems:'flex-start' }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontSize:'.75rem', color:'rgba(200,255,0,0.5)', fontWeight:500, flexShrink:0, paddingTop:2, minWidth:24 }}>{n}</div>
                <div>
                  <div style={{ fontSize:'.85rem', fontWeight:600, color:'#f0eeff', marginBottom:3 }}>{t}</div>
                  <div style={{ fontSize:'.76rem', color:'rgba(240,238,255,0.4)', lineHeight:1.55 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
