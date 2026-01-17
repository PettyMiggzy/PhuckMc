'use client'

import { useAccount, useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import { STAKING_ABI, STAKING_ADDRESS } from '@/lib/contracts'

const ERC20_META_ABI = [
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
] as const

export function useStakingData() {
  const { address } = useAccount()

  const { data: tokenAddress } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'TOKEN',
    query: { enabled: true },
  })

  const { data: tokenDecimalsRaw } = useReadContract({
    address: tokenAddress as `0x${string}` | undefined,
    abi: ERC20_META_ABI,
    functionName: 'decimals',
    query: { enabled: !!tokenAddress },
  })

  const { data: tokenSymbolRaw } = useReadContract({
    address: tokenAddress as `0x${string}` | undefined,
    abi: ERC20_META_ABI,
    functionName: 'symbol',
    query: { enabled: !!tokenAddress },
  })

  const tokenDecimals = Number(tokenDecimalsRaw ?? 18)
  const tokenSymbol = (tokenSymbolRaw ?? 'TOKEN') as string

  const { data: oneRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'ONE',
    query: { enabled: true },
  })

  const ONE = (oneRaw ?? 10n ** 18n) as bigint

  const { data: positionRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'positions',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    watch: true,
  })

  const position = {
    amount: (positionRaw?.[0] ?? 0n) as bigint,
    startTime: (positionRaw?.[1] ?? 0n) as bigint,
    unlockTime: (positionRaw?.[2] ?? 0n) as bigint,
    rewardDebt: (positionRaw?.[3] ?? 0n) as bigint,
    exists: (positionRaw?.[4] ?? false) as boolean,
  }

  const { data: pendingRewards } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'pendingRewards',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    watch: true,
  })

  const { data: currentWeight } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'currentWeight',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    watch: true,
  })

  const { data: multiplierRaw } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'timeWeightMultiplier',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
    watch: true,
  })

  const { data: totalStaked } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'totalStaked',
    query: { enabled: true },
    watch: true,
  })

  const { data: totalWeight } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'totalWeight',
    query: { enabled: true },
    watch: true,
  })

  const { data: rewardsPoolBalance } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'rewardsPoolBalance',
    query: { enabled: true },
    watch: true,
  })

  const { data: rewardsFundedTotal } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'rewardsFundedTotal',
    query: { enabled: true },
    watch: true,
  })

  const multiplierScaled = (multiplierRaw ?? ONE) as bigint
  const multiplierX = `${Number(formatUnits(multiplierScaled, 18)).toFixed(2)}x` // assumes ONE is 1e18 scale

  function fmt(x: bigint) {
    return Number(formatUnits(x ?? 0n, tokenDecimals))
  }

  return {
    tokenAddress: tokenAddress as `0x${string}` | undefined,
    tokenDecimals,
    tokenSymbol,

    ONE,

    position,
    pendingRewards: (pendingRewards ?? 0n) as bigint,
    currentWeight: (currentWeight ?? 0n) as bigint,
    multiplierScaled,
    multiplierX,

    totalStaked: (totalStaked ?? 0n) as bigint,
    totalWeight: (totalWeight ?? 0n) as bigint,
    rewardsPoolBalance: (rewardsPoolBalance ?? 0n) as bigint,
    rewardsFundedTotal: (rewardsFundedTotal ?? 0n) as bigint,

    fmt,
  }
}
