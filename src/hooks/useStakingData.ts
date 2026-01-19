'use client'

import { useMemo } from 'react'
import { useAccount, useReadContracts } from 'wagmi'
import { formatUnits } from 'viem'
import { STAKING_ABI, STAKING_ADDRESS } from '@/lib/contracts'

type Address = `0x${string}`

export function useStakingData() {
  const { address, isConnected } = useAccount()

  const enabled = !!address && isConnected
  const userArg = enabled ? ([address as Address] as const) : undefined

  // NOTE: args MUST be a tuple like [address] as const
  const stakingRead = useReadContracts({
    contracts: [
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'positions',
        args: userArg,
      },
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'pendingRewards',
        args: userArg,
      },
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'currentWeight',
        args: userArg,
      },
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'timeWeightMultiplier',
        args: userArg,
      },
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'TOKEN',
      },
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'totalStaked',
      },
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'totalWeight',
      },
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'rewardsPoolBalance',
      },
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'rewardsFundedTotal',
      },
    ] as const,
    query: {
      enabled: true,
      refetchInterval: 6000,
      staleTime: 2000,
    },
  })

  const position = useMemo(() => {
    const r = stakingRead.data?.[0]?.result as
      | { amount: bigint; startTime: bigint; unlockTime: bigint; rewardDebt: bigint; existsFlag: boolean }
      | undefined
    return (
      r ?? {
        amount: 0n,
        startTime: 0n,
        unlockTime: 0n,
        rewardDebt: 0n,
        existsFlag: false,
      }
    )
  }, [stakingRead.data])

  const pendingRewards = (stakingRead.data?.[1]?.result as bigint | undefined) ?? 0n
  const currentWeight = (stakingRead.data?.[2]?.result as bigint | undefined) ?? 0n
  const multiplier = (stakingRead.data?.[3]?.result as bigint | undefined) ?? 0n
  const tokenAddress = (stakingRead.data?.[4]?.result as Address | undefined) ?? undefined

  const totalStaked = (stakingRead.data?.[5]?.result as bigint | undefined) ?? 0n
  const totalWeight = (stakingRead.data?.[6]?.result as bigint | undefined) ?? 0n
  const rewardsPoolBalance = (stakingRead.data?.[7]?.result as bigint | undefined) ?? 0n
  const rewardsFundedTotal = (stakingRead.data?.[8]?.result as bigint | undefined) ?? 0n

  // You already set these elsewhere; keeping defaults here so UI doesn't crash
  const tokenDecimals = 18
  const tokenSymbol = 'PHUCKMC'

  function fmt(raw: bigint, decimals = tokenDecimals) {
    try {
      return Number(formatUnits(raw ?? 0n, decimals))
    } catch {
      return 0
    }
  }

  // Human-friendly multiplier string (assuming multiplier uses 1e18 scaling)
  const multiplierX = useMemo(() => {
    const x = Number(multiplier) / 1e18
    if (!Number.isFinite(x) || x <= 0) return '—'
    return `${x.toFixed(2)}x`
  }, [multiplier])

  return {
    address: address as Address | undefined,
    enabled,

    // token basics (UI can override with real decimals/symbol elsewhere)
    tokenAddress,
    tokenDecimals,
    tokenSymbol,

    // user
    position,
    pendingRewards,
    currentWeight,
    multiplier,
    multiplierX,

    // global
    totalStaked,
    totalWeight,
    rewardsPoolBalance,
    rewardsFundedTotal,

    // helpers
    fmt,
  }
}
