'use client'

import { useAccount, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { STAKING_ABI, STAKING_ADDRESS } from '@/lib/contracts'

export function useStakingData() {
  const { address } = useAccount()

  // --- READS ---
  const { data: tokenAddress } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'TOKEN',
    query: { enabled: true },
  })

  const { data: totalStakedRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'totalStaked',
    query: {
      enabled: true,
      staleTime: 5_000,
      refetchInterval: 10_000,
    },
  })

  const { data: totalWeightRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'totalWeight',
    query: {
      enabled: true,
      staleTime: 5_000,
      refetchInterval: 10_000,
    },
  })

  const { data: rewardsPoolBalanceRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'rewardsPoolBalance',
    query: {
      enabled: true,
      staleTime: 5_000,
      refetchInterval: 10_000,
    },
  })

  const { data: rewardsFundedTotalRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'rewardsFundedTotal',
    query: {
      enabled: true,
      staleTime: 5_000,
      refetchInterval: 10_000,
    },
  })

  const { data: positionRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'positions',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 5_000,
      refetchInterval: 10_000,
    },
  })

  const { data: pendingRewardsRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'pendingRewards',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 5_000,
      refetchInterval: 10_000,
    },
  })

  const { data: currentWeightRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'currentWeight',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 5_000,
      refetchInterval: 10_000,
    },
  })

  const { data: multiplierRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'timeWeightMultiplier',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 5_000,
      refetchInterval: 10_000,
    },
  })

  // --- NORMALIZATION ---
  const tokenDecimals = 18
  const tokenSymbol = 'PHUCKMC'

  function fmt(v?: bigint) {
    return Number(formatUnits(v ?? 0n, tokenDecimals))
  }

  const position = {
    amount: (positionRaw as any)?.amount ?? 0n,
    startTime: (positionRaw as any)?.startTime ?? 0n,
    unlockTime: (positionRaw as any)?.unlockTime ?? 0n,
    rewardDebt: (positionRaw as any)?.rewardDebt ?? 0n,
    exists: (positionRaw as any)?.exists ?? false,
  }

  const multiplierX =
    multiplierRaw && multiplierRaw > 0n
      ? `${Number(multiplierRaw) / 1e18}×`
      : '—'

  return {
    tokenAddress: tokenAddress as `0x${string}` | undefined,
    tokenDecimals,
    tokenSymbol,

    totalStaked: totalStakedRaw ?? 0n,
    totalWeight: totalWeightRaw ?? 0n,
    rewardsPoolBalance: rewardsPoolBalanceRaw ?? 0n,
    rewardsFundedTotal: rewardsFundedTotalRaw ?? 0n,

    position,
    pendingRewards: pendingRewardsRaw ?? 0n,
    currentWeight: currentWeightRaw ?? 0n,

    multiplierX,
    fmt,
  }
}
