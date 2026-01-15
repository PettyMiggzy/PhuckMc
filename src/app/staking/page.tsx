"use client";

import { useEffect, useMemo, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWriteContract } from "wagmi";
import { parseUnits } from "viem";

type Stats = {
  totalStakedAll: string;
  rewardsPool: string;
  activeStakers: string;
  lockedSupplyPct: string;
  buybackWallet: string;

  userStake: string;
  pendingRewards: string;
  timeWeight: string;
  lockEndsAtUnix: number;
};

const TOKEN_SYMBOL = "PHUCKMC";
const TOKEN_DECIMALS = 18;

// For now: Donation panel is “ready” but disabled until you set these.
const REWARDS_POOL_ADDRESS: `0x${string}` | "" = ""; // set later (staking contract or pool vault)
const TOKEN_ADDRESS: `0x${string}` | "" = ""; // set later when token deployed on Monad

const erc20TransferAbi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

export default function StakingPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const [stats, setStats] = useState<Stats | null>(null);
  const [donateAmount, setDonateAmount] = useState("");

  // fetch “live” stats (server endpoint)
  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        const data = (await res.json()) as Stats;
        if (alive) setStats(data);
      } catch {
        // keep null; UI handles gracefully
      }
    }
    run();
    const t = setInterval(run, 10_000); // refresh every 10s
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  const lockCountdown = useMemo(() => {
    if (!stats?.lockEndsAtUnix) return "—";
    const now = Math.floor(Date.now() / 1000);
    const diff = stats.lockEndsAtUnix - now;
    if (diff <= 0) return "Unlocked";
    const d = Math.floor(diff / 86400);
    const h = Math.floor((diff % 86400) / 3600);
    const m = Math.floor((diff % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  }, [stats?.lockEndsAtUnix]);

  async function donateToPool() {
    if (!isConnected) return;
    if (!TOKEN_ADDRESS || !REWARDS_POOL_ADDRESS) return;
    if (!donateAmount) return;

    const amt = parseUnits(donateAmount, TOKEN_DECIMALS);

    await writeContractAsync({
      abi: erc20TransferAbi,
      address: TOKEN_ADDRESS,
      functionName: "transfer",
      args: [REWARDS_POOL_ADDRESS, amt],
    });

    setDonateAmount("");
  }

  return (
    <main className="min-h-screen bg-[#05030A] text-[#EDE9FE] px-6 py-16">
      <div className="mx-auto max-w-6xl space-y-10">
        {/* TOP BAR */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-wide">
              {TOKEN_SYMBOL} Staking
            </h1>
            <p className="text-white/65">
              Stillness is rewarded. Movement is taxed.
            </p>
          </div>
          <ConnectButton />
        </div>

        {/* HERO ORB / POOL */}
        <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-xl p-10">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-purple-600/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-violet-300/10 blur-3xl" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <p className="text-xs tracking-[0.35em] text-white/60">
                REWARDS POOL
              </p>
              <div className="text-4xl md:text-5xl font-serif">
                {stats ? `${stats.rewardsPool} ${TOKEN_SYMBOL}` : "—"}
              </div>
              <p className="text-white/60">
                Funded by swap fees + early exits. Anyone can add rewards anytime.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <MiniStat label="Total Staked" value={stats ? `${stats.totalStakedAll} ${TOKEN_SYMBOL}` : "—"} />
                <MiniStat label="Active Stakers" value={stats ? stats.activeStakers : "—"} />
                <MiniStat label="Locked Supply" value={stats ? `${stats.lockedSupplyPct}%` : "—"} />
                <MiniStat label="Buyback Wallet" value={stats ? short(stats.buybackWallet) : "—"} />
              </div>
            </div>

            {/* Orb visual */}
            <div className="flex justify-center">
              <div className="relative h-72 w-72 md:h-80 md:w-80 rounded-full border border-white/10 bg-gradient-to-br from-purple-600/20 via-black/40 to-violet-300/10 shadow-[0_0_120px_rgba(124,58,237,0.25)]">
                <div className="absolute inset-6 rounded-full bg-black/40 border border-white/10" />
                <div className="absolute inset-10 rounded-full bg-gradient-to-b from-purple-500/20 to-transparent" />
                <div className="absolute inset-0 rounded-full animate-[pulse_6s_ease-in-out_infinite] bg-purple-500/5" />
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
                  <p className="text-xs text-white/60 tracking-widest">PRESSURE</p>
                  <p className="text-lg text-purple-200/90">RISING</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* YOUR POSITION */}
        <section className="rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl p-10">
          <div className="flex items-center justify-between gap-6 flex-wrap">
            <h2 className="text-lg tracking-widest text-purple-200/90">
              YOUR POSITION
            </h2>
            <div className="text-xs text-white/60 font-mono">
              {isConnected ? short(address!) : "Not connected"}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <BigStat label="Your Stake" value={stats && isConnected ? `${stats.userStake} ${TOKEN_SYMBOL}` : "—"} />
            <BigStat label="Pending Rewards" value={stats && isConnected ? `${stats.pendingRewards} ${TOKEN_SYMBOL}` : "—"} />
            <BigStat label="Time Weight" value={stats && isConnected ? `${stats.timeWeight}×` : "—"} accent />
            <BigStat label="Lock Remaining" value={stats && isConnected ? lockCountdown : "—"} />
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-white/70 leading-relaxed">
            <span className="text-white">Early unstake:</span> lose{" "}
            <span className="text-white">10%</span> and receive{" "}
            <span className="text-white">0 rewards</span>. Penalty split:{" "}
            <span className="text-white">60%</span> → rewards pool,{" "}
            <span className="text-white">40%</span> → buybacks (
            <span className="font-mono text-white/80">
              0xC77A81C4Cf1Dce5006141996D1c6B84E16621aD6
            </span>
            ).
          </div>
        </section>

        {/* ACTIONS (disabled until contract deploy) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Panel title="Stake & Lock" subtitle="30 / 60 / 90 / 365 days">
            <button
              disabled
              className="w-full rounded-2xl bg-purple-700/35 text-white/75 py-4 font-semibold cursor-not-allowed"
            >
              Stake (contract not deployed yet)
            </button>
            <p className="mt-3 text-xs text-white/55">
              This will go live the moment the staking contract is deployed.
            </p>
          </Panel>

          <Panel title="Fund the Rewards Pool" subtitle="Anyone can add rewards anytime">
            <div className="space-y-3">
              <input
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value)}
                placeholder="Amount"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 outline-none"
              />
              <button
                onClick={donateToPool}
                disabled={!isConnected || !TOKEN_ADDRESS || !REWARDS_POOL_ADDRESS || !donateAmount || isPending}
                className="w-full rounded-2xl bg-white/10 hover:bg-white/15 py-4 font-semibold disabled:opacity-40"
              >
                {TOKEN_ADDRESS && REWARDS_POOL_ADDRESS ? "Send to Rewards Pool" : "Set pool address first"}
              </button>

              <div className="text-xs text-white/55 leading-relaxed">
                Once the pool address exists, this sends {TOKEN_SYMBOL} directly into the pool.
                It’s a public action anyone can do — rewards become bigger for stakers.
              </div>
            </div>
          </Panel>
        </section>

        {/* FOOTER */}
        <div className="text-center text-xs text-white/55 pt-10">
          No charts. No noise. Just quiet, consistent revenue.
        </div>
      </div>
    </main>
  );
}

/* ---------------- components ---------------- */

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl p-8">
      <div className="space-y-1">
        <div className="text-lg text-purple-200/90">{title}</div>
        <div className="text-sm text-white/60">{subtitle}</div>
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
      <div className="text-xs text-white/55">{label}</div>
      <div className="mt-1 text-sm text-white/85">{value}</div>
    </div>
  );
}

function BigStat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
      <div className="text-xs text-white/55">{label}</div>
      <div className={`mt-2 text-2xl ${accent ? "text-purple-300" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
