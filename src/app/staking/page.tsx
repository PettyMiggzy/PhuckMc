"use client";

import * as React from "react";
import { useReadContract } from "wagmi";

const STAKING_CA = "0x1eD1B91aa4B58336348783bC671E22AA4E34b9b8" as const;

// Minimal ABI for reads we need
const STAKING_ABI = [
  {
    name: "rewardsPoolBalance",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "rewardsFundedTotal",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "totalStaked",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
] as const;

function formatToken(x?: bigint) {
  if (x === undefined) return "—";
  // no decimals info here, assume 18 like normal ERC20
  const s = (Number(x) / 1e18).toLocaleString(undefined, { maximumFractionDigits: 2 });
  return s;
}

export default function StakingPage() {
  const { data: poolBal } = useReadContract({
    address: STAKING_CA,
    abi: STAKING_ABI,
    functionName: "rewardsPoolBalance",
  });

  const { data: fundedTotal } = useReadContract({
    address: STAKING_CA,
    abi: STAKING_ABI,
    functionName: "rewardsFundedTotal",
  });

  const { data: totalStaked } = useReadContract({
    address: STAKING_CA,
    abi: STAKING_ABI,
    functionName: "totalStaked",
  });

  const pct = React.useMemo(() => {
    if (!poolBal || !fundedTotal || fundedTotal === 0n) return 0;
    // pool / fundedTotal, clamped
    const p = Number(poolBal) / Number(fundedTotal);
    return Math.max(0, Math.min(1, p));
  }, [poolBal, fundedTotal]);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl opacity-40 bg-purple-700" />
        <div className="absolute bottom-[-200px] right-[-200px] h-[520px] w-[520px] rounded-full blur-3xl opacity-30 bg-purple-600" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0b0613]" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Stake <span className="text-purple-400">PHUCKMC</span>
            </h1>
            <p className="text-white/70 mt-3 max-w-2xl">
              Lock 30 / 60 / 90 / 365 days. Early unstake = <span className="text-purple-300 font-semibold">10% tax</span>,
              no rewards, and the penalty routes into rewards + buyback wallet.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
            <div className="text-xs uppercase tracking-wider text-white/60">Staking Contract</div>
            <div className="mt-1 font-mono text-sm text-white/80 break-all">{STAKING_CA}</div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="text-sm text-white/60">Total Staked</div>
            <div className="mt-2 text-2xl font-bold">{formatToken(totalStaked)}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="text-sm text-white/60">Rewards Pool (Live)</div>
            <div className="mt-2 text-2xl font-bold">{formatToken(poolBal)}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="text-sm text-white/60">Rewards Funded (Total)</div>
            <div className="mt-2 text-2xl font-bold">{formatToken(fundedTotal)}</div>
          </div>
        </div>

        {/* Reward Tank */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-lg font-semibold">Reward Tank</div>
              <div className="text-white/60 text-sm mt-1">
                Fills up as rewards are added. Based on pool vs total funded.
              </div>
            </div>

            <div className="text-sm text-white/70">
              Fill: <span className="text-purple-300 font-semibold">{Math.round(pct * 100)}%</span>
            </div>
          </div>

          <div className="mt-5">
            <div className="h-5 w-full rounded-full bg-black/50 border border-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 via-purple-400 to-purple-600 transition-all duration-700"
                style={{ width: `${pct * 100}%` }}
              />
            </div>

            <div className="mt-3 flex justify-between text-xs text-white/50">
              <span>Empty</span>
              <span>Full</span>
            </div>
          </div>
        </div>

        {/* Placeholder actions block (premium look, not wired yet) */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="text-lg font-semibold">Stake (coming online)</div>
          <div className="text-white/60 text-sm mt-1">
            Next: amount input + lock selector + approve + stake + claim + early-unstake warnings.
          </div>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
            {["30 Days", "60 Days", "90 Days", "365 Days"].map((t) => (
              <div key={t} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-sm font-semibold">{t}</div>
                <div className="text-xs text-white/50 mt-1">Time-weight multiplier + timer UI</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
