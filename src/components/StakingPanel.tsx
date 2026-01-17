'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAccount, useReadContract, useWriteContract, usePublicClient } from 'wagmi'
import { parseUnits } from 'viem'

import RewardsCore from './RewardsCore'
import StakeModal from './StakeModal'
import { useRewardsPool } from '@/hooks/useRewardsPool'
import { useStakingData } from '@/hooks/useStakingData'
import { STAKING_ABI, STAKING_ADDRESS } from '@/lib/contracts'
import { GAS } from '@/lib/gas'

function formatCompact(n: number) {
  if (!Number.isFinite(n)) return '0'
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(n)
}

// smarter formatting so small values don’t look like 0.0000
function formatSmart(n: number) {
  if (!Number.isFinite(n)) return '0'
  const maxFrac =
    n === 0 ? 0 :
    n < 0.0001 ? 10 :
    n < 0.01 ? 8 :
    n < 1 ? 6 : 4

  return Intl.NumberFormat('en-US', { maximumFractionDigits: maxFrac }).format(n)
}

function secondsToClock(sec: number) {
  const s = Math.max(0, Math.floor(sec))
  const d = Math.floor(s / 86400)
  const h = Math.floor((s % 86400) / 3600)
  const m = Math.floor((s % 3600) / 60)
  return `${d}d ${h}h ${m}m`
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-md p-4">
      <div className="text-[11px] tracking-[0.22em] text-white/55">{label}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
      {sub ? <div className="mt-1 text-xs text-white/50">{sub}</div> : null}
    </div>
  )
}

export default function StakingPanel() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { address, isConnected } = useAccount()
  const d = useStakingData()

  // ✅ now includes capacityNum
  const { poolNum, fundedNum, capacityNum, fillRatio, pulse } = useRewardsPool()

  const nowSec = Math.floor(Date.now() / 1000)

  const unlockIn = useMemo(() => {
    if (!d.position.exists) return 0
    return Math.max(0, Number(d.position.unlockTime) - nowSec)
  }, [d.position.exists, d.position.unlockTime, nowSec])

  const isUnlocked = d.position.exists && unlockIn === 0

  const stakedUser = d.fmt(d.position.amount)
  const pendingUser = d.fmt(d.pendingRewards)
  const weightUser = d.fmt(d.currentWeight)

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
            PHUCKMC <span className="text-purple-300">Staking</span>
          </h2>
          <p className="mt-2 text-white/75 max-w-xl">
            Time-weighted staking. Longer locks earn more. Early exits feed the reward pool.
          </p>

          <div className="mt-8">
            <StakeModal tokenAddress={d.tokenAddress} tokenDecimals={d.tokenDecimals} tokenSymbol={d.tokenSymbol} />
          </div>
        </div>

        {/* YOUR POSITION */}
        <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md p-8">
          <div className="flex items-center justify-between">
            <div className="text-sm tracking-[0.22em] text-white/60">YOUR POSITION</div>
            <div
              className={`text-xs px-3 py-1 rounded-full border ${
                !d.position.exists
                  ? 'border-white/10 text-white/50'
                  : isUnlocked
                  ? 'border-emerald-400/30 text-emerald-200 bg-emerald-500/10'
                  : 'border-purple-400/30 text-purple-200 bg-purple-500/10'
              }`}
            >
              {!d.position.exists ? 'No active stake' : isUnlocked ? 'Unlocked' : 'Locked'}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="STAKED" value={`${formatSmart(stakedUser)} ${d.tokenSymbol}`} />
            <StatCard label="PENDING REWARDS" value={`${formatSmart(pendingUser)} ${d.tokenSymbol}`} />
            <StatCard
              label="UNLOCKS IN"
              value={d.position.exists ? (isUnlocked ? '0d 0h 0m' : secondsToClock(unlockIn)) : '—'}
            />
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatCard label="MULTIPLIER" value={d.position.exists ? d.multiplierX : '—'} sub="scaled correctly" />
            <StatCard label="CURRENT WEIGHT" value={formatCompact(weightUser)} sub="drives rewards" />
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

          {/* ✅ THIS IS WHERE CAPACITY GOES */}
          <div className="mt-6 grid grid-cols-3 gap-4 w-full">
            <StatCard label="POOL" value={`${formatSmart(poolNum)} ${d.tokenSymbol}`} />
            <StatCard label="CAPACITY" value={`${formatSmart(capacityNum)} ${d.tokenSymbol}`} sub="reactor target" />
            <StatCard label="FUNDED" value={`${formatSmart(fundedNum)} ${d.tokenSymbol}`} sub="lifetime" />
          </div>

          <div className="mt-3 text-xs text-white/50 text-center">
            Funding uses <span className="text-white/80 font-semibold">{d.tokenSymbol}</span> (not MON).
          </div>
        </div>

        {/* GLOBAL */}
        <div className="rounded-3xl border border-white/10 bg-black/30 backdrop-blur-md p-8">
          <div className="text-sm tracking-[0.22em] text-white/60">GLOBAL</div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard label="TOTAL STAKED" value={`${formatCompact(d.fmt(d.totalStaked))} ${d.tokenSymbol}`} />
            <StatCard label="TOTAL WEIGHT" value={formatCompact(d.fmt(d.totalWeight))} />
            <StatCard label="REWARDS POOL" value={`${formatCompact(d.fmt(d.rewardsPoolBalance))} ${d.tokenSymbol}`} />
            <StatCard label="FUNDED (LIFETIME)" value={`${formatCompact(d.fmt(d.rewardsFundedTotal))} ${d.tokenSymbol}`} />
          </div>
        </div>

        {/* COMMUNITY FUND */}
        <FundRewardsCard
          isConnected={isConnected}
          userAddress={address}
          tokenAddress={d.tokenAddress}
          tokenDecimals={d.tokenDecimals}
          tokenSymbol={d.tokenSymbol}
        />
      </div>
    </div>
  )
}

const ERC20_ABI = [
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

function FundRewardsCard({
  isConnected,
  userAddress,
  tokenAddress,
  tokenDecimals,
  tokenSymbol,
}: {
  isConnected: boolean
  userAddress?: `0x${string}`
  tokenAddress?: `0x${string}`
  tokenDecimals: number
  tokenSymbol: string
}) {
  const publicClient = usePublicClient()
  const { writeContractAsync, isPending } = useWriteContract()
  const [amt, setAmt] = useState('')

  const amtWei = useMemo(() => {
    try {
      return amt ? parseUnits(amt, tokenDecimals) : 0n
    } catch {
      return 0n
    }
  }, [amt, tokenDecimals])

  const { data: allowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: userAddress && tokenAddress ? [userAddress, STAKING_ADDRESS] : undefined,
    query: { enabled: !!userAddress && !!tokenAddress },
    watch: true,
  })

  const needsApprove = !!tokenAddress && (allowance ?? 0n) < amtWei && amtWei > 0n

  async function approve() {
    if (!tokenAddress) return
    const max = 2n ** 256n - 1n
    const hash = await writeContractAsync({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [STAKING_ADDRESS, max],
      gas: GAS.APPROVE,
    })
    await publicClient.waitForTransactionReceipt({ hash })
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
    await publicClient.waitForTransactionReceipt({ hash })
  }

  return (
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
        <>
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
        </>
      )}
    </div>
  )
}
