'use client'

import { useStakingData } from '@/hooks/useStakingData'
import { formatUnits } from 'viem'

export function useRewardsPool() {
  const d = useStakingData()
  const dec = d.tokenDecimals ?? 18
  const poolNum   = Number(formatUnits((d.rewardsPoolBalance ?? 0n) as bigint, dec))
  const fundedNum = Number(formatUnits((d.rewardsFundedTotal ?? 0n) as bigint, dec))
  const MIN_CAPACITY = 1_000_000
  const capacityNum  = Math.max(MIN_CAPACITY, fundedNum * 100)
  const fillRatio    = capacityNum <= 0 ? 0 : Math.max(0, Math.min(1, poolNum / capacityNum))
  const pulse        = poolNum > 0
  return { poolNum, fundedNum, capacityNum, fillRatio, pulse }
}
