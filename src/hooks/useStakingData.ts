'use client'

import { useMemo } from 'react'
import { useAccount, useReadContracts } from 'wagmi'
import { ERC20_ABI, STAKING_ABI, STAKING_ADDRESS, TOKEN_ADDRESS } from '@/lib/contracts'

type Address = `0x${string}`

export function useStakingData() {
  const { address, isConnected } = useAccount()
  const enabled = isConnected && !!address

  const a = (address as Address | undefined) ?? undefined

  const contracts = useMemo(() => {
    return [
      // --- user reads
      {
        address: STAKING_ADDRESS as Address,
        abi: STAKING_ABI,
        functionName: 'positions',
        args: a ? ([a] as const) : undefined,
      },
      {
        address: STAKING_ADDRESS as Address,
        abi: STAKING_ABI,
        functionName: 'pendingRewards',
        args: a ? ([a] as const) : undefined,
      },
      {
        address: STAKING_ADDRESS as Address,
        abi: STAKING_ABI,
        functionName: 'currentWeight',
        args: a ? ([a] as const) : undefined,
      },
      {
        address: STAKING_ADDRESS as Address,
        abi: STAKING_ABI,
        functionName: 'timeWeightMultiplier',
        args: a ? ([a] as const) : undefined,
      },

      // --- globals
      {
        address: STAKING_ADDRESS as Address,
        abi: STAKING_ABI,
        functionName: 'totalStaked',
      },
      {
        address: STAKING_ADDRESS as Address,
        abi: STAKING_ABI,
        functionName: 'totalWeight',
      },
      {
        address: STAKING_ADDRESS as Address,
        abi: STAKING_ABI,
        functionName: 'rewardsPoolBalance',
      },
      {
        address: STAKING_ADDRESS as Address,
        abi: STAKING_ABI,
        functionName: 'rewardsFundedTotal',
      },
      {
        address: STAKING_ADDRESS as Address,
        abi: STAKING_ABI,
        functionName: 'TOKEN',
      },
      {
        address: STAKING_ADDRESS as Address,
        abi: STAKING_ABI,
        functionName: 'BUYBACK_WALLET',
      },

      // --- token meta (fallback to TOKEN_ADDRESS)
      {
        address: (TOKEN_ADDRESS as Address),
        abi: ERC20_ABI,
        functionName: 'decimals',
      },
      {
        address: (TOKEN_ADDRESS as Address),
        abi: ERC20_ABI,
        functionName: 'symbol',
      },
    ] as const
  }, [a])

  const { data, isLoading, refetch, isFetching } = useReadContracts({
    contracts,
    query: {
      enabled,
      refetchInterval: 6000,
      staleTime: 0,
      gcTime: 0,
    },
  })

  const positionRaw = (data?.[0]?.result ??
    [0n, 0n, 0n, 0n, false]) as readonly [bigint, bigint, bigint, bigint, boolean]

  const position = {
    amount: positionRaw[0],
    startTime: positionRaw[1],
    unlockTime: positionRaw[2],
    rewardDebt: positionRaw[3],
    exists: positionRaw[4],
  }

  // Treat stake as active if amount > 0 (exists can lie depending on older structs)
  const hasStake = position.amount > 0n

  const pendingRewards = (data?.[1]?.result ?? 0n) as bigint
  const currentWeight = (data?.[2]?.result ?? 0n) as bigint
  const multiplier = (data?.[3]?.result ?? 0n) as bigint

  const totalStaked = (data?.[4]?.result ?? 0n) as bigint
  const totalWeight = (data?.[5]?.result ?? 0n) as bigint
  const rewardsPoolBalance = (data?.[6]?.result ?? 0n) as bigint
  const rewardsFundedTotal = (data?.[7]?.result ?? 0n) as bigint

  const tokenFromStaking = (data?.[8]?.result ?? TOKEN_ADDRESS) as Address
  const buybackWallet = (data?.[9]?.result ?? ('0x0000000000000000000000000000000000000000' as Address)) as Address

  const tokenDecimals = Number((data?.[10]?.result ?? 18) as number)
  const tokenSymbol = String((data?.[11]?.result ?? 'PHUCKMC'))

  return {
    address,
    enabled,
    isLoading,
    isFetching,
    refetch,

    position,
    hasStake,

    pendingRewards,
    currentWeight,
    multiplier,

    totalStaked,
    totalWeight,
    rewardsPoolBalance,
    rewardsFundedTotal,

    tokenAddress: tokenFromStaking,
    tokenDecimals,
    tokenSymbol,

    buybackWallet,
  }
}
