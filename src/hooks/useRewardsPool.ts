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

  const pool = Number(formatUnits((poolRaw ?? 0n) as bigint, d.tokenDecimals))
  const funded = Number(formatUnits((fundedRaw ?? 0n) as bigint, d.tokenDecimals))

  // baseline so small funds don’t instantly show 100%
  const BASE_CAPACITY_TOKENS = 1000
  const capacity = Math.max(BASE_CAPACITY_TOKENS, funded)

  const fillRatio = capacity <= 0 ? 0 : Math.max(0, Math.min(1, pool / capacity))
  const pulse = pool > 0

  return {
    poolNum: pool,
    fundedNum: funded,
    capacityNum: capacity,
    fillRatio,
    pulse,
  }
}
