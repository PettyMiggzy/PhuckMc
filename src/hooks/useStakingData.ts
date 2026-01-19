// src/hooks/useStakingData.ts
'use client'

import { useMemo } from 'react'
import { useAccount, useReadContracts } from 'wagmi'
import { formatUnits } from 'viem'
import {
  STAKING_ABI,
  STAKING_ADDRESS,
  TOKEN_ADDRESS,
  TOKEN_DECIMALS,
  TOKEN_SYMBOL,
} from '@/lib/contracts'

type Position = {
  amount: bigint
  startTime: bigint
  unlockTime: bigint
  rewardDebt: bigint
  existsFlag: boolean
}

function safeNum(s: string) {
  const n = Number(s)
  return Number.isFinite(n) ? n : 0
}

export function useStakingData() {
  const { address, isConnected } = useAccount()

  const enabled = !!address && isConnected

  const stakingContracts = useMemo(() => {
    const user = address as `0x${string}` | undefined

    return [
      // user position
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'positionOf',
        args: user ? [user] : undefined,
      },

      // user pending rewards
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'pendingRewards',
        args: user ? [user] : undefined,
      },

      // user weight
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'currentWeight',
        args: user ? [user] : undefined,
      },

      // user multiplier label
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'multiplierX',
        args: user ? [user] : undefined,
      },

      // globals
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'totalStaked',
        args: [],
      },
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'totalWeight',
        args: [],
      },
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'rewardsPoolBalance',
        args: [],
      },
      {
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'rewardsFundedTotal',
        args: [],
      },
    ] as const
  }, [address])

  const read = useReadContracts({
    contracts: stakingContracts,
    query: {
      enabled,
      refetchInterval: 6000,
      staleTime: 3000,
    },
  })

  const position: Position = (read.data?.[0]?.result as any) ?? {
    amount: 0n,
    startTime: 0n,
    unlockTime: 0n,
    rewardDebt: 0n,
    existsFlag: false,
  }

  const pendingRewards = (read.data?.[1]?.result as bigint) ?? 0n
  const currentWeight = (read.data?.[2]?.result as bigint) ?? 0n
  const multiplierX = (read.data?.[3]?.result as string) ?? '—'

  const totalStaked = (read.data?.[4]?.result as bigint) ?? 0n
  const totalWeight = (read.data?.[5]?.result as bigint) ?? 0n
  const rewardsPoolBalance = (read.data?.[6]?.result as bigint) ?? 0n
  const rewardsFundedTotal = (read.data?.[7]?.result as bigint) ?? 0n

  // formatting helpers
  function fmtAmount(x: bigint) {
    return safeNum(formatUnits(x ?? 0n, TOKEN_DECIMALS))
  }

  return {
    // status
    isConnected,
    address,
    enabled,
    isLoading: read.isLoading,
    isFetching: read.isFetching,

    // token meta
    tokenAddress: TOKEN_ADDRESS,
    tokenDecimals: TOKEN_DECIMALS,
    tokenSymbol: TOKEN_SYMBOL,

    // user
    position,
    pendingRewards,
    currentWeight,
    multiplierX,

    // globals
    totalStaked,
    totalWeight,
    rewardsPoolBalance,
    rewardsFundedTotal,

    // helpers
    fmtAmount,
  }
}
