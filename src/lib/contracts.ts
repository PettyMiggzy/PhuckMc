// src/lib/contracts.ts
export const CHAIN_ID = 10143 as const // <-- keep whatever your Monad chain id is if you already set it elsewhere

export const STAKING_ADDRESS = '0xYOUR_STAKING_CONTRACT_HERE' as const
export const TOKEN_ADDRESS = '0x148a3a811979e5BF8366FC279B2d67742Fe17777' as const // PHUCKMC token (you posted this CA)
export const TOKEN_DECIMALS = 18 as const
export const TOKEN_SYMBOL = 'PHUCKMC' as const

export const BUYBACK_WALLET = '0xC77A81C4Cf1Dce5006141996D1c6B84E16621aD6' as const

// IMPORTANT: ABI must match your deployed staking contract.
// This includes: positionOf(address) OR positions(address) OR userPosition(address)
// and totals: totalStaked(), totalWeight(), rewardsPoolBalance(), rewardsFundedTotal(), pendingRewards(address), multiplierX(address) etc.
//
// If your actual function names differ, ONLY change the functionName strings in useStakingData.ts below.
// Do NOT randomly rename fields again.
export const STAKING_ABI = [
  // --- user position ---
  {
    type: 'function',
    name: 'positionOf',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      {
        name: 'p',
        type: 'tuple',
        components: [
          { name: 'amount', type: 'uint256' },
          { name: 'startTime', type: 'uint256' },
          { name: 'unlockTime', type: 'uint256' },
          { name: 'rewardDebt', type: 'uint256' },
          { name: 'existsFlag', type: 'bool' },
        ],
      },
    ],
  },

  // --- user stats ---
  {
    type: 'function',
    name: 'pendingRewards',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'amount', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'currentWeight',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'w', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'multiplierX',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: 'm', type: 'string' }],
  },

  // --- globals ---
  {
    type: 'function',
    name: 'totalStaked',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 't', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'totalWeight',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 't', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'rewardsPoolBalance',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'b', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'rewardsFundedTotal',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 't', type: 'uint256' }],
  },

  // --- actions used by UI ---
  {
    type: 'function',
    name: 'fundRewards',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'amount', type: 'uint256' }],
    outputs: [],
  },
] as const
