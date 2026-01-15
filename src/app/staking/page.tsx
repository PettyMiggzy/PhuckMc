"use client";

import * as React from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { PHUCK_STAKING_ABI } from "@/lib/abis/phuckStaking";
import { ERC20_ABI } from "@/lib/abis/erc20";

const STAKING_CA = (process.env.NEXT_PUBLIC_STAKING_CA ?? "0x0") as `0x${string}`;

function fmt(num: bigint | undefined, decimals: number) {
  if (num === undefined) return "—";
  try {
    const s = formatUnits(num, decimals);
    // shorten big numbers
    const [a, b] = s.split(".");
    const short =
      a.length > 9 ? `${a.slice(0, a.length - 9)}.${a.slice(-9, -7)}B` :
      a.length > 6 ? `${a.slice(0, a.length - 6)}.${a.slice(-6, -4)}M` :
      a.length > 3 ? `${a.slice(0, a.length - 3)}.${a.slice(-3, -1)}K` :
      s;
    return b ? short : s;
  } catch {
    return "—";
  }
}

export default function StakingPage() {
  const { address, isConnected } = useAccount();
  const { writeContractAsync } = useWriteContract();

  // Read TOKEN address from staking contract
  const tokenRead = useReadContract({
    address: STAKING_CA,
    abi: PHUCK_STAKING_ABI,
    functionName: "TOKEN",
  });
  const token = (tokenRead.data ?? "0x0") as `0x${string}`;

  // Token meta
  const decimalsRead = useReadContract({
    address: token,
    abi: ERC20_ABI,
    functionName: "decimals",
    query: { enabled: token !== "0x0" },
  });
  const symbolRead = useReadContract({
    address: token,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: { enabled: token !== "0x0" },
  });

  const decimals = Number(decimalsRead.data ?? 18);
  const symbol = String(symbolRead.data ?? "TOKEN");

  // Global stats
  const totalStakedRead = useReadContract({ address: STAKING_CA, abi: PHUCK_STAKING_ABI, functionName: "totalStaked" });
  const rewardsPoolRead = useReadContract({ address: STAKING_CA, abi: PHUCK_STAKING_ABI, functionName: "rewardsPoolBalance" });
  const fundedTotalRead = useReadContract({ address: STAKING_CA, abi: PHUCK_STAKING_ABI, functionName: "rewardsFundedTotal" });
  const earlyBpsRead = useReadContract({ address: STAKING_CA, abi: PHUCK_STAKING_ABI, functionName: "EARLY_PENALTY_BPS" });

  // User stats
  const posRead = useReadContract({
    address: STAKING_CA,
    abi: PHUCK_STAKING_ABI,
    functionName: "positions",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const pendingRead = useReadContract({
    address: STAKING_CA,
    abi: PHUCK_STAKING_ABI,
    functionName: "pendingRewards",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const weightRead = useReadContract({
    address: STAKING_CA,
    abi: PHUCK_STAKING_ABI,
    functionName: "currentWeight",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const multRead = useReadContract({
    address: STAKING_CA,
    abi: PHUCK_STAKING_ABI,
    functionName: "timeWeightMultiplier",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Allowance + balance
  const balRead = useReadContract({
    address: token,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && token !== "0x0" },
  });

  const allowanceRead = useReadContract({
    address: token,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, STAKING_CA] : undefined,
    query: { enabled: !!address && token !== "0x0" },
  });

  const [amount, setAmount] = React.useState("");
  const [lock, setLock] = React.useState<0 | 1 | 2 | 3>(0);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);

  const userPos = posRead.data as
    | { amount: bigint; startTime: bigint; unlockTime: bigint; rewardDebt: bigint; exists: boolean }
    | undefined;

  const unlockMs = userPos?.unlockTime ? Number(userPos.unlockTime) * 1000 : 0;
  const now = Date.now();
  const locked = userPos?.exists && unlockMs > now;

  const allowance = allowanceRead.data ?? 0n;
  const needApprove = (() => {
    if (!amount) return false;
    try {
      const a = parseUnits(amount as `${number}`, decimals);
      return allowance < a;
    } catch {
      return false;
    }
  })();

  async function approve() {
    if (!amount) return;
    setMsg(null);
    setBusy("approve");
    try {
      const a = parseUnits(amount as `${number}`, decimals);
      await writeContractAsync({
        address: token,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [STAKING_CA, a],
      });
      setMsg("Approved.");
    } catch (e: any) {
      setMsg(e?.shortMessage ?? e?.message ?? "Approve failed.");
    } finally {
      setBusy(null);
    }
  }

  async function stake() {
    if (!amount) return;
    setMsg(null);
    setBusy("stake");
    try {
      const a = parseUnits(amount as `${number}`, decimals);
      await writeContractAsync({
        address: STAKING_CA,
        abi: PHUCK_STAKING_ABI,
        functionName: "stake",
        args: [a, lock],
      });
      setMsg("Staked.");
      setAmount("");
    } catch (e: any) {
      setMsg(e?.shortMessage ?? e?.message ?? "Stake failed.");
    } finally {
      setBusy(null);
    }
  }

  async function claim() {
    setMsg(null);
    setBusy("claim");
    try {
      await writeContractAsync({
        address: STAKING_CA,
        abi: PHUCK_STAKING_ABI,
        functionName: "claim",
      });
      setMsg("Claimed.");
    } catch (e: any) {
      setMsg(e?.shortMessage ?? e?.message ?? "Claim failed.");
    } finally {
      setBusy(null);
    }
  }

  async function unstake() {
    setMsg(null);
    setBusy("unstake");
    try {
      await writeContractAsync({
        address: STAKING_CA,
        abi: PHUCK_STAKING_ABI,
        functionName: "unstake",
      });
      setMsg("Unstaked.");
    } catch (e: any) {
      setMsg(e?.shortMessage ?? e?.message ?? "Unstake failed.");
    } finally {
      setBusy(null);
    }
  }

  async function unstakeEarly() {
    setMsg(null);
    setBusy("early");
    try {
      await writeContractAsync({
        address: STAKING_CA,
        abi: PHUCK_STAKING_ABI,
        functionName: "unstakeEarly",
      });
      setMsg("Early unstake executed (penalty applied).");
    } catch (e: any) {
      setMsg(e?.shortMessage ?? e?.message ?? "Early unstake failed.");
    } finally {
      setBusy(null);
    }
  }

  const penaltyBps = Number(earlyBpsRead.data ?? 0n);
  const penaltyPct = (penaltyBps / 100).toFixed(2);

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">PHUCK Staking</h1>
            <p className="text-white/70 mt-2">
              Lock in. Chill out. Early unstakers lose <span className="text-white">{penaltyPct}%</span> and earn <span className="text-white">zero</span> rewards.
            </p>
            <p className="text-white/50 mt-2 text-sm">
              Contract: <span className="font-mono">{STAKING_CA}</span>
            </p>
          </div>
          <div className="shrink-0">
            <ConnectButton />
          </div>
        </div>

        {/* Premium glass panels */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Total Staked" value={`${fmt(totalStakedRead.data, decimals)} ${symbol}`} />
          <Card title="Rewards Pool" value={`${fmt(rewardsPoolRead.data, decimals)} ${symbol}`} />
          <Card title="Rewards Funded (All Time)" value={`${fmt(fundedTotalRead.data, decimals)} ${symbol}`} />
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <h2 className="text-xl font-semibold">Your Position</h2>

            {!isConnected ? (
              <p className="text-white/70 mt-3">Connect wallet to view your stake + rewards.</p>
            ) : (
              <div className="mt-4 space-y-3 text-sm">
                <Row label="Wallet Balance" value={`${fmt(balRead.data, decimals)} ${symbol}`} />
                <Row label="Staked Amount" value={`${fmt(userPos?.amount ?? 0n, decimals)} ${symbol}`} />
                <Row
                  label="Unlock Time"
                  value={
                    userPos?.exists
                      ? new Date(unlockMs).toLocaleString()
                      : "—"
                  }
                />
                <Row label="Locked" value={userPos?.exists ? (locked ? "YES" : "NO") : "—"} />
                <Row label="Pending Rewards" value={`${fmt(pendingRead.data ?? 0n, decimals)} ${symbol}`} />
                <Row label="Current Weight" value={`${weightRead.data ?? 0n}`} />
                <Row label="Time Multiplier" value={`${multRead.data ?? 0n}`} />
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={claim}
                disabled={!isConnected || busy !== null}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-40"
              >
                {busy === "claim" ? "Claiming..." : "Claim"}
              </button>

              <button
                onClick={unstake}
                disabled={!isConnected || busy !== null || (locked ?? false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-40"
                title={locked ? "Locked — use Early Unstake if you want out now (penalty applies)." : ""}
              >
                {busy === "unstake" ? "Unstaking..." : "Unstake"}
              </button>

              <button
                onClick={unstakeEarly}
                disabled={!isConnected || busy !== null || !(userPos?.exists)}
                className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-400/30 disabled:opacity-40"
              >
                {busy === "early" ? "Early Unstaking..." : `Early Unstake (-${penaltyPct}%)`}
              </button>
            </div>

            {msg && <p className="mt-4 text-white/80">{msg}</p>}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
            <h2 className="text-xl font-semibold">Stake</h2>
            <p className="text-white/70 mt-2 text-sm">
              Choose lock duration. Longer lock = stronger time weight.
            </p>

            <div className="mt-5">
              <label className="text-sm text-white/70">Amount</label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={`0.0 ${symbol}`}
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 outline-none focus:border-purple-400/50"
                />
                <button
                  type="button"
                  onClick={() => setAmount("1")}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10"
                >
                  1
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <LockPill active={lock === 0} onClick={() => setLock(0)} label="30 days" />
                <LockPill active={lock === 1} onClick={() => setLock(1)} label="60 days" />
                <LockPill active={lock === 2} onClick={() => setLock(2)} label="90 days" />
                <LockPill active={lock === 3} onClick={() => setLock(3)} label="365 days" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={approve}
                disabled={!isConnected || busy !== null || !needApprove}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-40"
              >
                {busy === "approve" ? "Approving..." : "Approve"}
              </button>

              <button
                onClick={stake}
                disabled={!isConnected || busy !== null || !amount || needApprove}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl disabled:opacity-40"
              >
                {busy === "stake" ? "Staking..." : "Stake"}
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
              <div className="font-semibold text-white">Rules</div>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Early unstakers earn <span className="text-white">no rewards</span>.</li>
                <li>Early unstake penalty is <span className="text-white">{penaltyPct}%</span> (auto split pool + buyback).</li>
                <li>Anyone can add rewards to the pool via <span className="font-mono">fundRewards()</span>.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Visual sauce hook later */}
        <div className="mt-10 text-xs text-white/40">
          Tip: we can add premium visuals next (reward pressure meter, lock aura, leaderboard, “penalty feed” ticker).
        </div>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
      <div className="text-sm text-white/60">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="text-white/60">{label}</div>
      <div className="text-white font-mono text-right">{value}</div>
    </div>
  );
}

function LockPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "px-3 py-2 rounded-xl border text-sm",
        active
          ? "bg-purple-600/30 border-purple-400/40"
          : "bg-white/5 border-white/10 hover:bg-white/10",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
