'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  usePublicClient,
} from 'wagmi'
import { formatUnits, parseUnits } from 'viem'

import RewardsCore from './RewardsCore'
import StakeModal from './StakeModal'
import { useRewardsPool } from '@/hooks/useRewardsPool'
import { useStakingData } from '@/hooks/useStakingData'
import { STAKING_ABI, STAKING_ADDRESS } from '@/lib/contracts'
import { GAS } from '@/lib/gas'

type Address = `0x${string}`

function formatCompact(n: number) {
  if (!Number.isFinite(n)) return '0'
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(n)
}

function formatSmart(n: number) {
  if (!Number.isFinite(n)) return '0'
  const maxFrac =
    n === 0 ? 0 : n < 0.0001 ? 10 : n < 0.01 ? 8 : n < 1 ? 6 : 4
  return Intl.NumberFormat('en-US', { maximumFractionDigits: maxFrac }).format(n)
}

function secondsToClock(sec: number) {
  const s = Math.max(0, Math.floor(sec))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${d}d ${h}h ${m}m`
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md p-4">
      <div className="text-[11px] tracking-[0.22em] text-white/55">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
      {sub ? <div className="mt-1 text-xs text-white/50">{sub}</div> : null}
    </div>
  )
}

const ERC20_ABI = [
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint8' }],
  },
  {
    type: 'function',
    name: 'symbol',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    type: 'function',
    name: 'allowance',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
] as const

function toNum(x: bigint, decimals: number) {
  return Number(formatUnits(x ?? 0n, decimals))
}

export default function StakingPanel() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { address, isConnected } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync, isPending } = useWriteContract()

  // Your user-level staking data hook (position, pending, etc.)
  const d = useStakingData()

  // Reactor visuals hook (pool, funded, capacity, fill, pulse)
  const { poolNum, fundedNum, capacityNum, fillRatio, pulse } = useRewardsPool()

  // Read token + buyback from staking contract (source of truth)
  const { data: tokenFromStaking } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'TOKEN',
    query: { staleTime: 60_000, refetchInterval: 60_000 },
  })

  const { data: buybackWalletOnchain } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'BUYBACK_WALLET',
    query: { staleTime: 60_000, refetchInterval: 60_000 },
  })

  const tokenAddress = (tokenFromStaking as Address | undefined) ?? d.tokenAddress
  const buybackWallet =
    (buybackWalletOnchain as Address | undefined) ??
    ('0x0000000000000000000000000000000000000000' as Address)

  // Read GLOBAL staking values directly here (no guessing fields on d)
  const { data: globalReads } = useReadContracts({
    contracts: [
      { address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: 'totalStaked' },
      { address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: 'rewardsPoolBalance' },
      { address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: 'rewardsFundedTotal' },
      { address: STAKING_ADDRESS, abi: STAKING_ABI, functionName: 'totalWeight' },
    ],
    query: { staleTime: 10_000, refetchInterval: 15_000 },
  })

  const totalStaked = (globalReads?.[0]?.result as bigint | undefined) ?? 0n
  const rewardsPoolBalance = (globalReads?.[1]?.result as bigint | undefined) ?? 0n
  const rewardsFundedTotal = (globalReads?.[2]?.result as bigint | undefined) ?? 0n
  const totalWeight = (globalReads?.[3]?.result as bigint | undefined) ?? 0n

  // Token metadata
  const { data: tokenMeta } = useReadContracts({
    contracts: tokenAddress
      ? [
          { address: tokenAddress as Address, abi: ERC20_ABI, functionName: 'decimals' },
          { address: tokenAddress as Address, abi: ERC20_ABI, functionName: 'symbol' },
        ]
      : [],
    query: { enabled: !!tokenAddress, staleTime: 60_000, refetchInterval: 60_000 },
  })

  const tokenDecimals = Number((tokenMeta?.[0]?.result as number | undefined) ?? 18)
  const tokenSymbol = String((tokenMeta?.[1]?.result as string | undefined) ?? 'PHUCKMC')

  // Stake exists if amount > 0 (more reliable than exists flag)
  const hasStake = (d.position?.amount ?? 0n) > 0n

  const nowSec = Math.floor(Date.now() / 1000)
  const unlockIn = useMemo(() => {
    if (!hasStake) return 0
    return Math.max(0, Number(d.position.unlockTime) - nowSec)
  }, [hasStake, d.position?.unlockTime, nowSec])

  const isUnlocked = hasStake && unlockIn === 0

  const stakedUserNum = toNum(d.position.amount ?? 0n, tokenDecimals)
  const pendingUserNum = toNum(d.pendingRewards ?? 0n, tokenDecimals)

  // Reward share %
  const rewardSharePct = useMemo(() => {
    const userW = d.currentWeight ?? 0n
    if (!totalWeight || totalWeight === 0n) return 0
    const pct = (Number(userW) / Number(totalWeight)) * 100
    return Number.isFinite(pct) ? pct : 0
  }, [d.currentWeight, totalWeight])

  // Funding card allowance
  const [amt, setAmt] = useState('')
  const amtWei = useMemo(() => {
    try {
      return amt ? parseUnits(amt, tokenDecimals) : 0n
    } catch {
      return 0n
    }
  }, [amt, tokenDecimals])

  const { data: allowance } = useReadContract({
    address: tokenAddress as Address,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && tokenAddress ? [address as Address, STAKING_ADDRESS] : undefined,
    query: {
      enabled: !!address && !!tokenAddress,
      staleTime: 5_000,
      refetchInterval: 10_000,
    },
  })

  const needsApprove = !!tokenAddress && (allowance ?? 0n) < amtWei && amtWei > 0n

  async function approve() {
    if (!tokenAddress) return
    const max = 2n ** 256n - 1n
    const hash = await writeContractAsync({
      address: tokenAddress as Address,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [STAKING_ADDRESS, max],
      gas: GAS.APPROVE,
    })
    if (publicClient) await publicClient.waitForTransactionReceipt({ hash })
  }

  async function fund() {
    if (amtWei <= 0n) return
    const hash = await writeContractAsync({
      address: STAKING_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'fundRewards',
      args: [amtWei],
      gas: GAS.FUND,
    })
    if (publicClient) await publicClient.waitForTransactionReceipt({ hash })
  }

  if (!mounted) {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/30 p-8 text-white/70">
        Loading staking…
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
      {/* LEFT */}
      <div className="xl:col-span-3 space-y-6">
        <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md p-8 shadow-[0_0_60px_rgba(168,85,247,0.12)]">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {tokenSymbol} <span className="text-purple-300">Staking</span>
          </h2>
          <p className="mt-2 text-white/75 max-w-xl">
            Time-weighted staking. Longer locks earn more. Early exits feed the reward pool.
          </p>

          <div className="mt-8">
            <StakeModal
              tokenAddress={tokenAddress as Address}
              tokenDecimals={tokenDecimals}
              tokenSymbol={tokenSymbol}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-xs text-white/65">
            <span className="font-semibold text-white/80">Emergency withdrawal:</span> In rare, case-by-case situations,
            the team may assist with an emergency withdrawal path that can bypass the early-unstake penalty.
            This is <span className="font-semibold text-white/80">not guaranteed</span> and is handled manually —
            contact the team if you believe you qualify.
          </div>
        </div>

        {/* YOUR POSITION */}
        <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md p-8">
          <div className="flex items-center justify-between">
            <div className="text-sm tracking-[0.22em] text-white/60">YOUR POSITION</div>
            <div
              className={`text-xs px-3 py-1 rounded-full border ${
                !hasStake
                  ? 'border-white/10 text-white/50'
                  : isUnlocked
                  ? 'border-emerald-400/30 text-emerald-200 bg-emerald-500/10'
                  : 'border-purple-400/30 text-purple-200 bg-purple-500/10'
              }`}
            >
              {!hasStake ? 'No active stake' : isUnlocked ? 'Unlocked' : 'Locked'}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="STAKED" value={`${formatSmart(stakedUserNum)} ${tokenSymbol}`} />
            <StatCard label="PENDING REWARDS" value={`${formatSmart(pendingUserNum)} ${tokenSymbol}`} />
            <StatCard
              label="UNLOCKS IN"
              value={hasStake ? (isUnlocked ? '0d 0h 0m' : secondsToClock(unlockIn)) : '—'}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard
              label="MULTIPLIER"
              value={hasStake ? `${(Number(d.multiplier ?? 0n) / 1e18).toFixed(2)}x` : '—'}
              sub="scaled correctly"
            />
            <StatCard
              label="REWARD SHARE"
              value={`${rewardSharePct.toFixed(2)}%`}
              sub="your % of total weight"
            />
          </div>

          <div className="mt-5 text-xs text-white/50">
            Early unstake = 10% penalty, no rewards. 60% → pool, 40% → buyback.
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="xl:col-span-2 space-y-6">
        {/* REACTOR */}
        <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md p-8 flex flex-col items-center">
          <RewardsCore fill={fillRatio} pulse={pulse} labelTop="REWARD REACTOR" labelBottom="on-chain rewards pool" />

          <div className="mt-6 grid grid-cols-3 gap-4 w-full">
            <StatCard label="POOL" value={`${formatSmart(poolNum)} ${tokenSymbol}`} />
            <StatCard label="CAPACITY" value={`${formatSmart(capacityNum)} ${tokenSymbol}`} sub="reactor target" />
            <StatCard label="FUNDED" value={`${formatSmart(fundedNum)} ${tokenSymbol}`} sub="lifetime" />
          </div>

          <div className="mt-3 text-xs text-white/50 text-center">
            Funding uses <span className="text-white/80 font-semibold">{tokenSymbol}</span> (not MON).
          </div>
        </div>

        {/* GLOBAL */}
        <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md p-8">
          <div className="text-sm tracking-[0.22em] text-white/60">GLOBAL</div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard label="TOTAL STAKED" value={`${formatCompact(toNum(totalStaked, tokenDecimals))} ${tokenSymbol}`} />
            <StatCard label="REWARDS POOL" value={`${formatCompact(toNum(rewardsPoolBalance, tokenDecimals))} ${tokenSymbol}`} />
            <StatCard label="FUNDED (LIFETIME)" value={`${formatCompact(toNum(rewardsFundedTotal, tokenDecimals))} ${tokenSymbol}`} />
            <StatCard label="BUYBACK WALLET" value={`${buybackWallet.slice(0, 6)}…${buybackWallet.slice(-4)}`} sub="on-chain address" />
          </div>
        </div>

        {/* COMMUNITY FUND */}
        <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md p-8">
          <div className="text-sm tracking-[0.22em] text-white/60">COMMUNITY FUND</div>
          <div className="mt-2 text-sm text-white/75">
            Fund with <span className="font-semibold text-white">{tokenSymbol}</span>.
          </div>

          {!isConnected ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-white/65">
              Connect wallet to fund rewards.
            </div>
          ) : (
            <div className="mt-5 flex gap-2">
              <input
                value={amt}
                onChange={(e) => setAmt(e.target.value)}
                placeholder={`Amount (${tokenSymbol})`}
                inputMode="decimal"
                className="flex-1 rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white outline-none"
              />
              {needsApprove ? (
                <button
                  disabled={isPending || !tokenAddress || amtWei === 0n}
                  onClick={approve}
                  className="rounded-xl bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-500 disabled:opacity-50"
                >
                  {isPending ? 'Pending…' : 'Approve'}
                </button>
              ) : (
                <button
                  disabled={isPending || amtWei === 0n}
                  onClick={fund}
                  className="rounded-xl bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-500 disabled:opacity-50"
                >
                  {isPending ? 'Pending…' : 'Fund'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
