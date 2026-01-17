'use client'

import { useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { STAKING_ABI, STAKING_ADDRESS } from '@/lib/contracts'
import { useStakingData } from '@/hooks/useStakingData'

export function useRewardsPool() {
  const d = useStakingData()

  const { data: poolRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'rewardsPoolBalance',
    query: {
      enabled: true,
      staleTime: 5_000,
      refetchInterval: 10_000,
    },
  })

  const { data: fundedRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'rewardsFundedTotal',
    query: {
      enabled: true,
      staleTime: 5_000,
      refetchInterval: 10_000,
    },
  })

  const poolNum = Number(formatUnits((poolRaw ?? 0n) as bigint, d.tokenDecimals))
  const fundedNum = Number(formatUnits((fundedRaw ?? 0n) as bigint, d.tokenDecimals))

  /**
   * Reactor “capacity” tuning:
   * - We want it to feel HARD to fill.
   * - 10 PHUCKMC should barely move the needle.
   *
   * Rule:
   * - Minimum capacity floor = 1,000,000 tokens
   * - Otherwise capacity grows with lifetime funded * 100
   *   (so 1% = funded/100, not pocket change)
   */
  const MIN_CAPACITY_TOKENS = 1_000_000
  const capacityNum = Math.max(MIN_CAPACITY_TOKENS, fundedNum * 100)

  const fillRatio =
    capacityNum <= 0 ? 0 : Math.max(0, Math.min(1, poolNum / capacityNum))

  const pulse = poolNum > 0

  return {
    poolNum,
    fundedNum,
    capacityNum,
    fillRatio,
    pulse,
  }
}
