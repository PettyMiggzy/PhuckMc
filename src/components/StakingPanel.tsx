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

const S = {
  accent: '#c8ff00',
  purple: '#9945ff',
  card:   'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  text:   '#e8e6f0',
  muted:  'rgba(232,230,240,0.5)',
}

function formatCompact(n: number) {
  if (!Number.isFinite(n)) return '0'
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(n)
}

function formatSmart(n: number) {
  if (!Number.isFinite(n)) return '0'
  const maxFrac = n === 0 ? 0 : n < 0.0001 ? 10 : n < 0.01 ? 8 : n < 1 ? 6 : 4
  return Intl.NumberFormat('en-US', { maximumFractionDigits: maxFrac }).format(n)
}

function secondsToClock(sec: number) {
  const s = Math.max(0, Math.floor(sec))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${d}d ${h}h ${m}m`
}

function toNum(x: bigint | undefined, decimals: number) {
  try { return Number(formatUnits(x ?? 0n, decimals)) } catch { return 0 }
}

function calcSharePct(userWeight: bigint, totalWeight: bigint) {
  if (totalWeight <= 0n) return 0
  const bps = (userWeight * 10000n) / totalWeight
  return Number(bps) / 100
}

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div style={{padding:'16px 18px', borderRadius:14, border:`1px solid ${S.border}`, background:S.card}}>
      <div style={{fontSize:'.68rem', letterSpacing:'.14em', color:S.muted, fontWeight:600, marginBottom:6}}>{label}</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.6rem', letterSpacing:'.04em', color: accent || S.text, lineHeight:1}}>{value}</div>
      {sub && <div style={{fontSize:'.72rem', color:S.muted, marginTop:4}}>{sub}</div>}
    </div>
  )
}

export default function StakingPanel() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { address, isConnected } = useAccount()
  const d = useStakingData()
  const { poolNum, fundedNum, capacityNum, fillRatio, pulse } = useRewardsPool()

  const tokenDecimals = d.tokenDecimals ?? 18
  const tokenSymbol   = d.tokenSymbol ?? 'PHUCKMC'
  const nowSec = Math.floor(Date.now() / 1000)

  const unlockIn = useMemo(() => {
    if (!d.hasStake) return 0
    return Math.max(0, Number(d.position.unlockTime) - nowSec)
  }, [d.hasStake, d.position.unlockTime, nowSec])

  const isUnlocked = d.hasStake && unlockIn === 0

  const stakedUser  = toNum(d.position.amount, tokenDecimals)
  const pendingRaw  = toNum(d.pendingRewards, tokenDecimals)
  // ── FIX: never show more rewards than the pool actually holds ──────────────
  const pendingUser = Math.min(pendingRaw, poolNum)
  const rewardSharePct = calcSharePct(d.currentWeight ?? 0n, d.totalWeight ?? 0n)

  const totalStaked = toNum(d.totalStaked, tokenDecimals)
  const poolBalance = poolNum

  if (!mounted) {
    return (
      <div style={{padding:'2rem', borderRadius:16, border:`1px solid ${S.border}`, background:S.card, color:S.muted, fontSize:'.9rem'}}>
        Loading staking…
      </div>
    )
  }

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 360px', gap:'2rem', alignItems:'start'}}>

      {/* ── LEFT ─────────────────────────────────────────── */}
      <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>

        {/* Protocol header */}
        <div style={{padding:'20px 22px', borderRadius:16, border:`1px solid rgba(153,69,255,0.25)`, background:'rgba(153,69,255,0.06)'}}>
          <h2 style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.6rem', letterSpacing:'.04em', margin:'0 0 4px'}}>
            {tokenSymbol} <span style={{color:'#c084fc'}}>Staking</span>
          </h2>
          <p style={{color:S.muted, fontSize:'.85rem', margin:0}}>
            Time-weighted staking. Longer locks earn more. Early exits feed the reward pool.
          </p>
        </div>

        {/* Connect prompt */}
        {!isConnected ? (
          <div style={{padding:'22px', borderRadius:16, border:`1px solid ${S.border}`, background:S.card, textAlign:'center', color:S.muted, fontSize:'.9rem'}}>
            Connect wallet to stake
          </div>
        ) : (
          <>
            {/* Position stats */}
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px'}}>
              <StatCard label="STAKED" value={formatCompact(stakedUser) + ' ' + tokenSymbol} />
              <StatCard
                label="PENDING REWARDS"
                value={formatSmart(pendingUser) + ' ' + tokenSymbol}
                sub={pendingRaw > poolNum ? `Pool has ${formatCompact(poolBalance)} available` : undefined}
                accent={pendingUser > 0 ? S.accent : undefined}
              />
              <StatCard
                label="UNLOCKS IN"
                value={d.hasStake ? (isUnlocked ? 'NOW ✔' : secondsToClock(unlockIn)) : '—'}
                accent={isUnlocked ? S.accent : undefined}
              />
            </div>

            <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'10px'}}>
              <StatCard
                label="REWARD SHARE"
                value={rewardSharePct.toFixed(4) + '%'}
                sub="your share of total weight"
              />
              <StatCard
                label="MULTIPLIER"
                value={d.multiplier ? (Number(d.multiplier) / 100).toFixed(2) + '×' : '—'}
                sub="based on lock duration"
              />
            </div>

            {/* Early exit warning */}
            {d.hasStake && !isUnlocked && (
              <div style={{padding:'12px 16px', borderRadius:12, border:'1px solid rgba(251,146,60,0.2)', background:'rgba(251,146,60,0.05)', fontSize:'.82rem', color:'rgba(253,186,116,0.8)', lineHeight:1.5}}>
                <strong style={{color:'#fb923c'}}>Early unstake = 10% penalty.</strong> 60% goes back to the reward pool, 40% to buyback.
              </div>
            )}

            {/* Action buttons */}
            <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
              <StakeModal
               tokenAddress={d.tokenAddress}
                tokenDecimals={tokenDecimals}
                tokenSymbol={tokenSymbol}
              />
            </div>

            {/* Transparency note */}
            <div style={{padding:'14px 16px', borderRadius:12, border:`1px solid ${S.border}`, background:'rgba(255,255,255,0.02)', fontSize:'.78rem', color:S.muted, lineHeight:1.6}}>
              <strong style={{color:S.text}}>Transparency note:</strong> This staking contract includes an emergency withdrawal path that may allow
              withdrawal without rewards and can be handled case-by-case. This is <u>not guaranteed</u> and is
              processed manually — contact the team if you believe you qualify.
            </div>
          </>
        )}

        {/* Global stats */}
        <div style={{padding:'20px 22px', borderRadius:16, border:`1px solid ${S.border}`, background:S.card}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1rem', letterSpacing:'.1em', color:S.muted, marginBottom:14}}>PROTOCOL STATS</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px'}}>
            <div>
              <div style={{fontSize:'.68rem', letterSpacing:'.12em', color:S.muted, fontWeight:600}}>TOTAL STAKED</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.4rem', color:S.accent, marginTop:4}}>{formatCompact(totalStaked)}</div>
              <div style={{fontSize:'.72rem', color:S.muted}}>{tokenSymbol}</div>
            </div>
            <div>
              <div style={{fontSize:'.68rem', letterSpacing:'.12em', color:S.muted, fontWeight:600}}>REWARDS POOL</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.4rem', color:S.accent, marginTop:4}}>{formatCompact(poolBalance)}</div>
              <div style={{fontSize:'.72rem', color:S.muted}}>{tokenSymbol}</div>
            </div>
            <div>
              <div style={{fontSize:'.68rem', letterSpacing:'.12em', color:S.muted, fontWeight:600}}>LIFETIME FUNDED</div>
              <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.4rem', color:S.accent, marginTop:4}}>{formatCompact(fundedNum)}</div>
              <div style={{fontSize:'.72rem', color:S.muted}}>{tokenSymbol}</div>
            </div>
          </div>
          {d.buybackWallet && (
            <div style={{marginTop:14, paddingTop:14, borderTop:`1px solid ${S.border}`}}>
              <div style={{fontSize:'.68rem', letterSpacing:'.12em', color:S.muted, fontWeight:600, marginBottom:4}}>BUYBACK WALLET</div>
              <div style={{fontFamily:"'DM Mono',monospace", fontSize:'.75rem', color:S.muted, wordBreak:'break-all'}}>{d.buybackWallet}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: REWARD REACTOR ─────────────────────────── */}
      <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
        <div style={{padding:'22px', borderRadius:16, border:`1px solid rgba(153,69,255,0.2)`, background:'rgba(153,69,255,0.04)'}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1rem', letterSpacing:'.1em', color:'#c084fc', marginBottom:'1rem'}}>REWARD REACTOR</div>
          <RewardsCore fill={fillRatio} pulse={pulse} />
          <div style={{marginTop:'1rem', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
            {[
              {l:'POOL', v:formatCompact(poolBalance), u:tokenSymbol},
              {l:'CAPACITY', v:formatCompact(capacityNum), u:tokenSymbol, sub:'reactor target'},
              {l:'FUNDED', v:formatCompact(fundedNum), u:tokenSymbol, sub:'lifetime'},
            ].map(({l,v,u,sub}) => (
              <div key={l} style={{padding:'10px 12px', borderRadius:10, border:`1px solid ${S.border}`, background:S.card, textAlign:'center'}}>
                <div style={{fontSize:'.62rem', letterSpacing:'.1em', color:S.muted, fontWeight:600}}>{l}</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.2rem', color:S.accent, marginTop:2}}>{v}</div>
                <div style={{fontSize:'.68rem', color:S.muted}}>{sub || u}</div>
              </div>
            ))}
          </div>
          <div style={{marginTop:12, fontSize:'.75rem', color:'rgba(232,230,240,0.3)'}}>Funding uses {tokenSymbol} (not MON).</div>
        </div>
      </div>
    </div>
  )
}
