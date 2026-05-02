// src/lib/contracts.ts

export const CHAIN_ID = 143 as const

export const TOKEN_ADDRESS   = '0x148a3a811979e5BF8366FC279B2d67742Fe17777' as const
export const STAKING_ADDRESS = '0x1ed1b91aa4b58336348783bc671e22aa4e34b9b8' as const
export const BUYBACK_WALLET  = '0xC77A81C4Cf1Dce5006141996D1c6B84E16621aD6' as const
export const FEE_ROUTER      = '0x60832a12f12a971Aa530beb671baB2991d4afB7f' as const

export const ERC20_ABI = [
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'totalSupply', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'allowance', stateMutability: 'view', inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'approve', stateMutability: 'nonpayable', inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [{ type: 'bool' }] },
] as const

export const STAKING_ABI = [
  { type: 'function', name: 'positions', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: 'amount', type: 'uint256' }, { name: 'startTime', type: 'uint256' }, { name: 'unlockTime', type: 'uint256' }, { name: 'rewardDebt', type: 'uint256' }, { name: 'exists', type: 'bool' }] },
  { type: 'function', name: 'pendingRewards', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'currentWeight', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'timeWeightMultiplier', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'totalStaked', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'totalWeight', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'rewardsPoolBalance', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'rewardsFundedTotal', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'TOKEN', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'BUYBACK_WALLET', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'fundRewards', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'claim', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { type: 'function', name: 'stake', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }, { name: 'lockOption', type: 'uint8' }], outputs: [] },
  { type: 'function', name: 'unstake', stateMutability: 'nonpayable', inputs: [], outputs: [] },
  { type: 'function', name: 'unstakeEarly', stateMutability: 'nonpayable', inputs: [], outputs: [] },
] as const

// ─── VAULT (Privacy Vault — per-user contract via factory) ────────────────
export const VAULT_FACTORY_ADDRESS = '0x009435C220C157ceeE2EcD2d8dcE907D7697daa6' as const
export const VAULT_TIER_THRESHOLD = 2_000_000n // 2M $PHUCK to use vault

export const VAULT_FACTORY_ABI = [
  { type: 'function', name: 'createMyVault', stateMutability: 'nonpayable', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'userVault', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'hasVault', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'getVault', stateMutability: 'view', inputs: [{ type: 'address' }], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'totalVaults', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'event', name: 'VaultCreated', inputs: [
    { name: 'owner', type: 'address', indexed: true },
    { name: 'vault', type: 'address', indexed: true },
    { name: 'totalVaultsAtCreation', type: 'uint256', indexed: false }
  ] },
] as const

export const VAULT_ABI = [
  { type: 'function', name: 'owner', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'createdAt', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'deposit', stateMutability: 'nonpayable', inputs: [{ name: 'token', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'withdraw', stateMutability: 'nonpayable', inputs: [{ name: 'token', type: 'address' }, { name: 'amount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'depositNative', stateMutability: 'payable', inputs: [], outputs: [] },
  { type: 'function', name: 'withdrawNative', stateMutability: 'nonpayable', inputs: [{ name: 'amount', type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'token', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'nativeBalance', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'event', name: 'Deposited', inputs: [
    { name: 'token', type: 'address', indexed: true },
    { name: 'amount', type: 'uint256', indexed: false }
  ] },
  { type: 'event', name: 'Withdrawn', inputs: [
    { name: 'token', type: 'address', indexed: true },
    { name: 'amount', type: 'uint256', indexed: false }
  ] },
] as const
