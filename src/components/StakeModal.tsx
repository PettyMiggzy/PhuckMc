'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { parseUnits } from 'viem'
import { STAKING_ABI, STAKING_ADDRESS } from '@/lib/contracts'
import { GAS } from '@/lib/gas'

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

const LOCKS = [
  { label: '30 Days', value: 0, sub: 'Standard' },
  { label: '60 Days', value: 1, sub: 'Stronger' },
  { label: '90 Days', value: 2, sub: 'Serious' },
  { label: '365 Days', value: 3, sub: 'Diamond' },
]

export default function StakeModal({
  tokenAddress,
  tokenDecimals,
  tokenSymbol,
}: {
  tokenAddress?: `0x${string}`
  tokenDecimals: number
  tokenSymbol: string
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { address, isConnected } = useAccount()
  const { writeContract, isPending } = useWriteContract()

  const [amount, setAmount] = useState('')
  const [lock, setLock] = useState(0)

  const amountWei = useMemo(() => {
    try {
      return amount ? parseUnits(amount, tokenDecimals) : 0n
    } catch {
      return 0n
    }
  }, [amount, tokenDecimals])

  const { data: allowance } = useReadContract({
  address: tokenAddress,
  abi: ERC20_ABI,
  functionName: 'allowance',
  args: address && tokenAddress ? [address, STAKING_ADDRESS] : undefined,
  query: {
    enabled: !!address && !!tokenAddress,
    staleTime: 5_000,
    refetchInterval: 10_000,
  },
})


  const needsApprove =
    !!tokenAddress && (allowance ?? 0n) < amountWei && amountWei > 0n

  function approve() {
    if (!tokenAddress) return
    const max = 2n ** 256n - 1n
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [STAKING_ADDRESS, max],
      gas: GAS.APPROVE,
    })
  }

  function stake() {
    if (amountWei <= 0n) return
    writeContract({
      address: STAKING_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'stake',
      args: [amountWei, lock],
      gas: GAS.STAKE,
    })
  }

  function claim() {
    writeContract({
      address: STAKING_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'claim',
      gas: GAS.CLAIM,
    })
  }

  function unstake() {
    writeContract({
      address: STAKING_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'unstake',
      gas: GAS.UNSTAKE,
    })
  }

  function unstakeEarly() {
    writeContract({
      address: STAKING_ADDRESS,
      abi: STAKING_ABI,
      functionName: 'unstakeEarly',
      gas: GAS.UNSTAKE_EARLY,
    })
  }

  if (!mounted) return <div className="text-white/60">Loading…</div>

  if (!isConnected) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/25 p-4 text-white/70">
        Connect wallet to stake.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="text-xs tracking-[0.22em] text-white/60">AMOUNT</div>
        <div className="mt-2 flex items-center gap-3">
          <input
            placeholder={`0.0 ${tokenSymbol}`}
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-white outline-none"
          />
          <div className="text-xs text-white/55 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            {tokenSymbol}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
        <div className="text-xs tracking-[0.22em] text-white/60">LOCK TIER</div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {LOCKS.map((l) => (
            <button
              key={l.value}
              onClick={() => setLock(l.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                lock === l.value
                  ? 'border-purple-400/60 bg-purple-500/20 shadow-[0_0_25px_rgba(168,85,247,0.15)]'
                  : 'border-white/10 bg-black/30 hover:bg-white/5'
              }`}
            >
              <div className="font-semibold">{l.label}</div>
              <div className="text-xs text-white/55">{l.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {needsApprove ? (
        <button
          disabled={isPending || !tokenAddress || amountWei === 0n}
          onClick={approve}
          className="w-full rounded-2xl bg-purple-600 py-4 font-semibold hover:bg-purple-500 disabled:opacity-50"
        >
          {isPending ? 'Pending…' : `Approve ${tokenSymbol}`}
        </button>
      ) : (
        <button
          disabled={isPending || amountWei === 0n || !tokenAddress}
          onClick={stake}
          className="w-full rounded-2xl bg-purple-600 py-4 font-semibold hover:bg-purple-500 disabled:opacity-50"
        >
          {isPending ? 'Pending…' : 'Stake'}
        </button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          disabled={isPending}
          onClick={claim}
          className="rounded-2xl border border-white/10 bg-black/30 py-3 hover:bg-white/5 disabled:opacity-50"
        >
          Claim
        </button>

        <button
          disabled={isPending}
          onClick={unstake}
          className="rounded-2xl border border-white/10 bg-black/30 py-3 hover:bg-white/5 disabled:opacity-50"
        >
          Unstake
        </button>
      </div>

      <button
        disabled={isPending}
        onClick={unstakeEarly}
        className="w-full rounded-2xl border border-purple-400/40 bg-purple-500/15 py-3 text-purple-200 hover:bg-purple-500/20 disabled:opacity-50"
      >
        Unstake Early (10% Penalty)
      </button>
    </div>
  )
}
