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

function StatCard({ label, value, sub, accent, glow }: { label: string; value: string; sub?: string; accent?: string; glow?: boolean }) {
  return (
    <div style={{
      padding:'18px 20px', borderRadius:16,
      border:`1px solid ${glow ? 'rgba(200,255,0,0.2)' : S.border}`,
      background: glow ? 'rgba(200,255,0,0.04)' : S.card,
      position:'relative', overflow:'hidden'
    }}>
      {glow && <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#c8ff00,transparent)'}}/>}
      <div style={{fontSize:'.65rem', letterSpacing:'.14em', color:S.muted, fontWeight:700, marginBottom:8}}>{label}</div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', letterSpacing:'.04em', color: accent || S.text, lineHeight:1}}>{value}</div>
      {sub && <div style={{fontSize:'.72rem', color:S.muted, marginTop:5}}>{sub}</div>}
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
  // FIX: cap displayed rewards at pool balance — never show more than actually available
  const pendingUser = Math.min(pendingRaw, poolNum)
  const rewardSharePct = calcSharePct(d.currentWeight ?? 0n, d.totalWeight ?? 0n)
  const totalStaked = toNum(d.totalStaked, tokenDecimals)

  if (!mounted) {
    return (
      <div style={{padding:'2rem', borderRadius:20, border:`1px solid ${S.border}`, background:S.card, color:S.muted, fontSize:'.9rem', textAlign:'center'}}>
        Loading staking…
      </div>
    )
  }

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 380px', gap:'2rem', alignItems:'start'}}>

      {/* ── LEFT PANEL ─────────────────────────────────── */}
      <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>

        {/* Position stats — only show when connected */}
        {!isConnected ? (
          <div style={{
            padding:'3rem 2rem', borderRadius:20,
            border:'1px solid rgba(153,69,255,0.2)',
            background:'linear-gradient(135deg, rgba(153,69,255,0.06), rgba(6,5,14,0.8))',
            textAlign:'center', backdropFilter:'blur(20px)'
          }}>
            <div style={{fontSize:'2rem', marginBottom:'1rem'}}>🔐</div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.5rem', letterSpacing:'.06em', marginBottom:'0.5rem'}}>Connect Your Wallet</div>
            <div style={{color:S.muted, fontSize:'.9rem', marginBottom:'1.5rem'}}>Connect to view your position and start staking</div>
            <StakeModal
              tokenAddress={d.tokenAddress}
              tokenDecimals={tokenDecimals}
              tokenSymbol={tokenSymbol}
            />
          </div>
        ) : (
          <>
            {/* YOUR POSITION */}
            <div style={{
              borderRadius:20, overflow:'hidden',
              border:'1px solid rgba(153,69,255,0.2)',
              background:'linear-gradient(135deg, rgba(153,69,255,0.06) 0%, rgba(6,5,14,0.6) 100%)',
              backdropFilter:'blur(20px)'
            }}>
              {/* Header bar */}
              <div style={{
                padding:'16px 22px', borderBottom:'1px solid rgba(255,255,255,0.06)',
                display:'flex', alignItems:'center', justifyContent:'space-between'
              }}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.1rem', letterSpacing:'.1em', color:'#c084fc'}}>YOUR POSITION</div>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <span style={{
                    width:8, height:8, borderRadius:'50%',
                    background: d.hasStake ? '#c8ff00' : 'rgba(255,255,255,0.2)',
                    boxShadow: d.hasStake ? '0 0 8px #c8ff00' : 'none',
                    display:'inline-block'
                  }}/>
                  <span style={{fontSize:'.75rem', color:d.hasStake ? S.accent : S.muted, fontWeight:600}}>
                    {d.hasStake ? 'ACTIVE STAKE' : 'NO ACTIVE STAKE'}
                  </span>
                </div>
              </div>

              <div style={{padding:'20px 22px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
                <StatCard
                  label="STAKED"
                  value={formatCompact(stakedUser)}
                  sub={tokenSymbol}
                  accent={stakedUser > 0 ? '#e8e6f0' : S.muted}
                />
                <StatCard
                  label="PENDING REWARDS"
                  value={formatSmart(pendingUser)}
                  sub={pendingRaw > poolNum ? `Pool: ${formatCompact(poolNum)} available` : tokenSymbol}
                  accent={pendingUser > 0 ? S.accent : S.muted}
                  glow={pendingUser > 0}
                />
                <StatCard
                  label="UNLOCKS IN"
                  value={d.hasStake ? (isUnlocked ? 'READY ✓' : secondsToClock(unlockIn)) : '—'}
                  accent={isUnlocked ? S.accent : d.hasStake ? '#c084fc' : S.muted}
                  glow={isUnlocked}
                />
              </div>

              <div style={{padding:'0 22px 20px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                <StatCard
                  label="REWARD SHARE"
                  value={rewardSharePct.toFixed(4) + '%'}
                  sub="your share of total weight"
                />
                <StatCard
                  label="MULTIPLIER"
                  value={d.multiplier ? (Number(d.multiplier) / 100).toFixed(2) + '×' : '—'}
                  sub="based on lock duration"
                  accent={d.multiplier ? '#c084fc' : S.muted}
                />
              </div>

              {/* Early exit warning */}
              {d.hasStake && !isUnlocked && (
                <div style={{
                  margin:'0 22px 20px', padding:'12px 16px', borderRadius:12,
                  border:'1px solid rgba(251,146,60,0.2)', background:'rgba(251,146,60,0.05)',
                  fontSize:'.82rem', color:'rgba(253,186,116,0.8)', lineHeight:1.5
                }}>
                  ⚡ <strong style={{color:'#fb923c'}}>Early unstake = 10% penalty</strong> — 60% returns to the reward pool, 40% to buyback
                </div>
              )}

              {/* Actions */}
              <div style={{padding:'0 22px 22px'}}>
                <StakeModal
                  tokenAddress={d.tokenAddress}
                  tokenDecimals={tokenDecimals}
                  tokenSymbol={tokenSymbol}
                />
              </div>
            </div>
          </>
        )}

        {/* PROTOCOL STATS */}
        <div style={{
          borderRadius:20, border:`1px solid ${S.border}`,
          background:S.card, overflow:'hidden', backdropFilter:'blur(20px)'
        }}>
          <div style={{
            padding:'16px 22px', borderBottom:`1px solid ${S.border}`,
            display:'flex', alignItems:'center', justifyContent:'space-between'
          }}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1rem', letterSpacing:'.1em', color:S.muted}}>PROTOCOL STATS</div>
            <div style={{fontSize:'.72rem', color:S.muted}}>Live on-chain data</div>
          </div>
          <div style={{padding:'20px 22px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px'}}>
            {[
              {l:'TOTAL STAKED', v:formatCompact(totalStaked), u:tokenSymbol, c:S.accent},
              {l:'REWARDS POOL', v:formatCompact(poolNum), u:tokenSymbol, c:S.accent},
              {l:'LIFETIME FUNDED', v:formatCompact(fundedNum), u:tokenSymbol, c:S.accent},
            ].map(({l,v,u,c}) => (
              <div key={l} style={{padding:'14px 16px', borderRadius:12, border:`1px solid ${S.border}`, background:'rgba(255,255,255,0.02)'}}>
                <div style={{fontSize:'.63rem', letterSpacing:'.12em', color:S.muted, fontWeight:700, marginBottom:6}}>{l}</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.6rem', color:c, letterSpacing:'.04em', lineHeight:1}}>{v}</div>
                <div style={{fontSize:'.7rem', color:S.muted, marginTop:3}}>{u}</div>
              </div>
            ))}
          </div>
          {d.buybackWallet && (
            <div style={{padding:'0 22px 20px', paddingTop:0}}>
              <div style={{padding:'12px 16px', borderRadius:12, border:`1px solid ${S.border}`, background:'rgba(255,255,255,0.02)'}}>
                <div style={{fontSize:'.63rem', letterSpacing:'.12em', color:S.muted, fontWeight:700, marginBottom:4}}>BUYBACK WALLET</div>
                <div style={{fontFamily:"'DM Mono',monospace", fontSize:'.75rem', color:S.muted, wordBreak:'break-all'}}>{d.buybackWallet}</div>
              </div>
            </div>
          )}
        </div>

        {/* TRANSPARENCY NOTE */}
        <div style={{
          padding:'16px 20px', borderRadius:16,
          border:'1px solid rgba(255,255,255,0.05)',
          background:'rgba(255,255,255,0.02)',
          fontSize:'.78rem', color:S.muted, lineHeight:1.7
        }}>
          <span style={{color:'rgba(200,255,0,0.6)', fontWeight:700}}>Transparency: </span>
          This contract includes an emergency withdrawal path that may allow withdrawal without rewards — handled case-by-case. Not guaranteed. Contact the team if you believe you qualify.
        </div>
      </div>

      {/* ── RIGHT: REWARD REACTOR ─────────────────────── */}
      <div style={{display:'flex', flexDirection:'column', gap:'1.5rem', position:'sticky', top:'84px'}}>
        <div style={{
          borderRadius:20, overflow:'hidden',
          border:'1px solid rgba(153,69,255,0.2)',
          background:'linear-gradient(160deg, rgba(153,69,255,0.1) 0%, rgba(6,5,14,0.8) 100%)',
          backdropFilter:'blur(24px)'
        }}>
          <div style={{
            padding:'16px 22px', borderBottom:'1px solid rgba(153,69,255,0.15)',
            display:'flex', alignItems:'center', justifyContent:'space-between'
          }}>
            <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.1rem', letterSpacing:'.1em', color:'#c084fc'}}>REWARD REACTOR</div>
            <div style={{display:'flex', alignItems:'center', gap:6}}>
              <span style={{
                width:8, height:8, borderRadius:'50%',
                background: pulse ? '#c8ff00' : 'rgba(255,255,255,0.2)',
                boxShadow: pulse ? '0 0 8px #c8ff00' : 'none',
                display:'inline-block'
              }}/>
              <span style={{fontSize:'.72rem', color: pulse ? S.accent : S.muted, fontWeight:600}}>{pulse ? 'LIVE' : 'EMPTY'}</span>
            </div>
          </div>
          <div style={{padding:'24px 22px'}}>
            <RewardsCore fill={fillRatio} pulse={pulse} />
          </div>
          <div style={{padding:'0 22px 22px', display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8}}>
            {[
              {l:'POOL', v:formatCompact(poolNum), s:tokenSymbol},
              {l:'TARGET', v:formatCompact(capacityNum), s:'capacity'},
              {l:'FUNDED', v:formatCompact(fundedNum), s:'lifetime'},
            ].map(({l,v,s}) => (
              <div key={l} style={{padding:'10px 12px', borderRadius:10, border:`1px solid ${S.border}`, background:'rgba(255,255,255,0.03)', textAlign:'center'}}>
                <div style={{fontSize:'.6rem', letterSpacing:'.12em', color:S.muted, fontWeight:700}}>{l}</div>
                <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.2rem', color:S.accent, marginTop:3}}>{v}</div>
                <div style={{fontSize:'.67rem', color:S.muted}}>{s}</div>
              </div>
            ))}
          </div>
          <div style={{padding:'0 22px 18px', fontSize:'.72rem', color:'rgba(232,230,240,0.25)', textAlign:'center'}}>
            Funded with {tokenSymbol} (not MON)
          </div>
        </div>

        {/* HOW STAKING WORKS */}
        <div style={{
          borderRadius:20, border:`1px solid ${S.border}`,
          background:S.card, padding:'20px 22px', backdropFilter:'blur(20px)'
        }}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:'1rem', letterSpacing:'.1em', color:S.accent, marginBottom:16}}>HOW IT WORKS</div>
          {[
            {n:'1', title:'Choose lock duration', desc:'30, 60, 90, or 365 days. Longer = higher multiplier.'},
            {n:'2', title:'Earn time-weighted rewards', desc:'Your share grows as your multiplier increases.'},
            {n:'3', title:'Claim or compound', desc:'Claim rewards anytime. Unlock after lock period ends.'},
            {n:'4', title:'Early exit penalty', desc:'10% fee split between pool (60%) and buyback (40%).'},
          ].map(({n,title,desc}) => (
            <div key={n} style={{display:'flex', gap:12, marginBottom:14, alignItems:'flex-start'}}>
              <div style={{
                width:24, height:24, borderRadius:999, flexShrink:0,
                background:'rgba(200,255,0,0.15)', border:'1px solid rgba(200,255,0,0.3)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontFamily:"'Bebas Neue',sans-serif", fontSize:'.85rem', color:S.accent
              }}>{n}</div>
              <div>
                <div style={{fontSize:'.85rem', fontWeight:600, color:S.text, marginBottom:2}}>{title}</div>
                <div style={{fontSize:'.78rem', color:S.muted, lineHeight:1.5}}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
