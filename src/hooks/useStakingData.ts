'use client'

import { useMemo } from 'react'
import { useAccount, useReadContracts } from 'wagmi'
import { formatUnits } from 'viem'
import { STAKING_ABI, STAKING_ADDRESS } from '@/lib/contracts'

type Address = `0x${string}`

const ERC20_META_ABI = [
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
] as const

function safeAddr(a?: string | null): Address | undefined {
  if (!a) return undefined
  return a as Address
}

function fmtMultiplierX(mult: bigint) {
  // Most staking contracts return multiplier scaled by 1e18 (1x = 1e18)
  // If yours is different, this will still show something reasonable.
  const x = Number(formatUnits(mult ?? 0n, 18))
  if (!Number.isFinite(x) || x <= 0) return '—'
  return `${x.toFixed(2)}x`
}

export function useStakingData() {
  const { address, isConnected } = useAccount()
  const a = safeAddr(address)

  const enabled = isConnected && !!a

  // Batch read staking core first
  const stakingContracts = useMemo(() => {
    return [
      // user
      { address: STAKING_ADDRESS as Address, abi: STAKING_ABI, functionName: 'positions', args: a ? [a] : undefined },
      { address: STAKING_ADDRESS as Address, abi: STAKING_ABI, functionName: 'pendingRewards', args: a ? [a] : undefined },
      { address: STAKING_ADDRESS as Address, abi: STAKING_ABI, functionName: 'currentWeight', args: a ? [a] : undefined },
      { address: STAKING_ADDRESS as Address, abi: STAKING_ABI, functionName: 'timeWeightMultiplier', args: a ? [a] : undefined },

      // globals
      { address: STAKING_ADDRESS as Address, abi: STAKING_ABI, functionName: 'totalStaked' },
      { address: STAKING_ADDRESS as Address, abi: STAKING_ABI, functionName: 'totalWeight' },
      { address: STAKING_ADDRESS as Address, abi: STAKING_ABI, functionName: 'rewardsPoolBalance' },
      { address: STAKING_ADDRESS as Address, abi: STAKING_ABI, functionName: 'rewardsFundedTotal' },

      // token address
      { address: STAKING_ADDRESS as Address, abi: STAKING_ABI, functionName: 'TOKEN' },
    ] as const
  }, [a])

  const stakingRead = useReadContracts({
    contracts: stakingContracts,
    query: {
      enabled,
      refetchInterval: 6000,
      staleTime: 0,
      gcTime: 0,
    },
  })

  const tokenAddress = (stakingRead.data?.[8]?.result ??
    ('0x0000000000000000000000000000000000000000' as Address)) as Address

  // Now read token meta (symbol/decimals)
  const tokenMetaContracts = useMemo(() => {
    const isZero = tokenAddress === ('0x0000000000000000000000000000000000000000' as Address)
    if (isZero) return [] as const
    return [
      { address: tokenAddress, abi: ERC20_META_ABI, functionName: 'decimals' },
      { address: tokenAddress, abi: ERC20_META_ABI, functionName: 'symbol' },
    ] as const
  }, [tokenAddress])

  const tokenMetaRead = useReadContracts({
    contracts: tokenMetaContracts,
    query: {
      enabled: enabled && tokenMetaContracts.length > 0,
      refetchInterval: 60_000,
      staleTime: 30_000,
      gcTime: 60_000,
    },
  })

  // Defaults (safe)
  const positionRaw = (stakingRead.data?.[0]?.result ?? [0n, 0n, 0n, 0n, false]) as readonly [
    bigint,
    bigint,
    bigint,
    bigint,
    boolean
  ]

  const position = {
    amount: positionRaw[0] ?? 0n,
    startTime: positionRaw[1] ?? 0n,
    unlockTime: positionRaw[2] ?? 0n,
    rewardDebt: positionRaw[3] ?? 0n,
    existsFlag: positionRaw[4] ?? false,
  }

  // ✅ Treat stake as active if amount > 0 (exists flag can lie on some builds)
  const hasStake = position.amount > 0n

  const pendingRewards = (stakingRead.data?.[1]?.result ?? 0n) as bigint
  const currentWeight = (stakingRead.data?.[2]?.result ?? 0n) as bigint
  const multiplier = (stakingRead.data?.[3]?.result ?? 0n) as bigint

  const totalStaked = (stakingRead.data?.[4]?.result ?? 0n) as bigint
  const totalWeight = (stakingRead.data?.[5]?.result ?? 0n) as bigint
  const rewardsPoolBalance = (stakingRead.data?.[6]?.result ?? 0n) as bigint
  const rewardsFundedTotal = (stakingRead.data?.[7]?.result ?? 0n) as bigint

  const tokenDecimals = Number((tokenMetaRead.data?.[0]?.result ?? 18) as number)
  const tokenSymbol = String((tokenMetaRead.data?.[1]?.result ?? 'PHUCKMC') as string) || 'PHUCKMC'

  return {
    address: a,
    enabled,
    isLoading: stakingRead.isLoading || tokenMetaRead.isLoading,
    isFetching: stakingRead.isFetching || tokenMetaRead.isFetching,
    refetch: stakingRead.refetch,

    tokenAddress,
    tokenDecimals,
    tokenSymbol,

    position,
    hasStake,

    pendingRewards,
    currentWeight,
    multiplier,
    multiplierX: fmtMultiplierX(multiplier),

    totalStaked,
    totalWeight,

    rewardsPoolBalance,
    rewardsFundedTotal,
  }
}
