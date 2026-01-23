"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { PREDICTIONS_ABI } from "@/lib/predictionsAbi";
import { PREDICTIONS_ADDRESS } from "@/lib/predictions";
import { ORACLE_CONTROLLER_ABI } from "@/lib/oracleControllerAbi";
import { ORACLE_CONTROLLER_ADDRESS } from "@/lib/oracleController";
import { getMarketMeta } from "@/lib/marketMeta";

const pill =
  "px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white/80";
const glassCard =
  "rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-[0_0_80px_rgba(168,85,247,0.10)]";
const btnGhost =
  "rounded-2xl border border-white/10 bg-black/35 px-4 py-3 font-bold hover:bg-black/45 transition";
const purpleBtn =
  "rounded-2xl border border-purple-400/40 bg-purple-500/25 px-4 py-3 font-extrabold hover:bg-purple-500/35 transition";

function shortAddr(a?: string) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}
function statusLabel(status: number) {
  if (status === 0) return "Open";
  if (status === 1) return "Matched";
  if (status === 2) return "Cancelled";
  if (status === 3) return "Refunded";
  if (status === 4) return "Resolved";
  return "Unknown";
}
function fmtCountdown(sec: number) {
  if (sec <= 0) return "Ready";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function PredictionsPage() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const now = Math.floor(Date.now() / 1000);

  const RESOLVER = "0xC022B75D302AF292328cc0C056c7310552E74c8E".toLowerCase();
  const isResolver = address?.toLowerCase() === RESOLVER;

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [oracleParams, setOracleParams] = useState<{
    challengeWindow: number;
    minBondWei: bigint;
    bondBpsOfPot: number;
  } | null>(null);

  function unpackPrediction(p: any) {
    return {
      creator: p[0] as `0x${string}`,
      opponent: p[1] as `0x${string}`,
      creatorEscrow: p[2] as bigint,
      opponentEscrow: p[3] as bigint,
      createdAt: Number(p[4]),
      matchDeadline: Number(p[5]),
      expiry: Number(p[6]),
      creatorSide: Number(p[7]), // 0 Outcome A, 1 Outcome B
      targetPrice: p[8] as bigint,
      marketId: p[9] as `0x${string}`,
      status: Number(p[10]),
      winner: p[11] as `0x${string}`,
    };
  }

  async function write(
    address_: `0x${string}`,
    abi: any,
    fn: string,
    args: any[] = [],
    value?: bigint
  ) {
    if (!walletClient) throw new Error("Connect wallet");
    const hash = await walletClient.writeContract({
      address: address_,
      abi,
      functionName: fn as any,
      args,
      value,
    });
    await publicClient?.waitForTransactionReceipt({ hash });
    await refresh();
  }

  async function refresh() {
    if (!publicClient) return;
    setLoading(true);
    try {
      const [challengeWindow, minBondWei, bondBpsOfPot] = (await Promise.all([
        publicClient.readContract({
          address: ORACLE_CONTROLLER_ADDRESS,
          abi: ORACLE_CONTROLLER_ABI,
          functionName: "challengeWindow",
        }),
        publicClient.readContract({
          address: ORACLE_CONTROLLER_ADDRESS,
          abi: ORACLE_CONTROLLER_ABI,
          functionName: "minBondWei",
        }),
        publicClient.readContract({
          address: ORACLE_CONTROLLER_ADDRESS,
          abi: ORACLE_CONTROLLER_ABI,
          functionName: "bondBpsOfPot",
        }),
      ])) as [bigint, bigint, bigint];

      setOracleParams({
        challengeWindow: Number(challengeWindow),
        minBondWei,
        bondBpsOfPot: Number(bondBpsOfPot),
      });

      const nextId = (await publicClient.readContract({
        address: PREDICTIONS_ADDRESS,
        abi: PREDICTIONS_ABI,
        functionName: "nextId",
      })) as bigint;

      const maxId = Number(nextId) - 1;
      if (maxId <= 0) {
        setRows([]);
        return;
      }

      const LIMIT = 30;
      const ids: number[] = [];
      for (let i = maxId; i >= Math.max(1, maxId - (LIMIT - 1)); i--) ids.push(i);

      const data = await Promise.all(
        ids.map(async (id) => {
          const [pRaw, dRaw, bond] = await Promise.all([
            publicClient.readContract({
              address: PREDICTIONS_ADDRESS,
              abi: PREDICTIONS_ABI,
              functionName: "predictions",
              args: [BigInt(id)],
            }),
            publicClient.readContract({
              address: ORACLE_CONTROLLER_ADDRESS,
              abi: ORACLE_CONTROLLER_ABI,
              functionName: "disputes",
              args: [BigInt(id)],
            }),
            publicClient.readContract({
              address: ORACLE_CONTROLLER_ADDRESS,
              abi: ORACLE_CONTROLLER_ABI,
              functionName: "requiredBond",
              args: [BigInt(id)],
            }),
          ]);

          const p = unpackPrediction(pRaw);
          const d = {
            exists: dRaw.exists as boolean,
            proposedCreatorWins: dRaw.proposedCreatorWins as boolean,
            proposer: dRaw.proposer as `0x${string}`,
            proposedAt: Number(dRaw.proposedAt as bigint | number),
            challenged: dRaw.challenged as boolean,
            challenger: dRaw.challenger as `0x${string}`,
            finalized: dRaw.finalized as boolean,
          };

          return { id, p, d, bond: bond as bigint };
        })
      );

      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicClient]);

  async function propose(id: number, creatorWins: boolean, bond: bigint) {
    await write(
      ORACLE_CONTROLLER_ADDRESS,
      ORACLE_CONTROLLER_ABI,
      "proposeOutcome",
      [BigInt(id), creatorWins],
      bond
    );
  }
  async function challenge(id: number, bond: bigint) {
    await write(
      ORACLE_CONTROLLER_ADDRESS,
      ORACLE_CONTROLLER_ABI,
      "challengeOutcome",
      [BigInt(id)],
      bond
    );
  }
  async function finalize(id: number) {
    await write(
      ORACLE_CONTROLLER_ADDRESS,
      ORACLE_CONTROLLER_ABI,
      "finalizeIfUnchallenged",
      [BigInt(id)]
    );
  }
  async function resolveDispute(id: number, creatorWins: boolean) {
    await write(
      ORACLE_CONTROLLER_ADDRESS,
      ORACLE_CONTROLLER_ABI,
      "resolveDispute",
      [BigInt(id), creatorWins]
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl p-6">
        <div
          className="absolute -inset-10 opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 20% 30%, rgba(168,85,247,0.35), transparent 55%), radial-gradient(circle at 75% 20%, rgba(236,72,153,0.18), transparent 55%), radial-gradient(circle at 40% 80%, rgba(168,85,247,0.20), transparent 55%)",
          }}
        />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-4xl font-extrabold leading-tight">
              PHUCKMC <span className="text-white/70">Predictions</span>
            </div>
            <div className="mt-2 text-white/70">
              1% fees fuel buybacks • No match in 7 days → refund • Minimum create:{" "}
              <b className="text-white">100 MON</b>
            </div>
            {oracleParams && (
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className={pill}>Bond min: {formatEther(oracleParams.minBondWei)} MON</span>
                <span className={pill}>Bond: {oracleParams.bondBpsOfPot / 100}% of pot</span>
                <span className={pill}>Challenge: {Math.round(oracleParams.challengeWindow / 3600)}h</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/predictions/how-it-works" className={btnGhost}>
              How it works
            </Link>
            <Link href="/predictions/create" className={purpleBtn}>
              Create Prediction
            </Link>
            <button onClick={refresh} className={btnGhost}>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className={`${glassCard} mt-8 p-8 text-white/70`}>
          No predictions yet. Hit <b className="text-white">Create Prediction</b> to start.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {rows.map(({ id, p, d, bond }) => {
            const pot = p.creatorEscrow + p.opponentEscrow;
            const matched = p.status === 1;
            const expired = now >= p.expiry;
            const badge = matched && expired ? "Expired" : statusLabel(p.status);

            const meta = getMarketMeta(p.marketId);
            const title = meta?.title || "Unknown market";
            const outcomeA = meta?.outcomeA || "Outcome A";
            const outcomeB = meta?.outcomeB || "Outcome B";
            const creatorPick = p.creatorSide === 0 ? `A: ${outcomeA}` : `B: ${outcomeB}`;

            const hasProposal = d.exists;
            const challenged = d.challenged;
            const finalized = d.finalized;

            const challengeEnd =
              hasProposal && oracleParams ? d.proposedAt + oracleParams.challengeWindow : 0;
            const secondsLeft = hasProposal ? challengeEnd - now : 0;

            return (
              <div key={id} className={`${glassCard} p-6 relative overflow-hidden`}>
                <div
                  className="absolute inset-0 opacity-25"
                  style={{
                    background:
                      "linear-gradient(120deg, rgba(168,85,247,0.18), transparent 45%), linear-gradient(300deg, rgba(168,85,247,0.10), transparent 60%)",
                  }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-extrabold">Prediction #{id}</div>
                    <span className={pill}>{badge}</span>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-4">
                    <div className="text-xs text-white/50">Market</div>
                    <div className="text-2xl font-extrabold mt-1">{title}</div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                        <div className="text-xs text-white/50">Pot</div>
                        <div className="text-lg font-extrabold">{formatEther(pot)} MON</div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                        <div className="text-xs text-white/50">Creator Pick</div>
                        <div className="text-sm font-bold">{creatorPick}</div>
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-white/70">
                      A: <span className="text-white/90 font-semibold">{outcomeA}</span>
                      <span className="mx-2 text-white/30">•</span>
                      B: <span className="text-white/90 font-semibold">{outcomeB}</span>
                    </div>

                    {p.status === 0 && (
                      <div className="mt-4 text-sm text-white/60">
                        Waiting for someone to take the other side.
                      </div>
                    )}
                    {p.status === 1 && !expired && (
                      <div className="mt-4 text-sm text-white/60">
                        Locked. Resolves at expiry.
                      </div>
                    )}
                    {p.status === 4 && p.winner !== "0x0000000000000000000000000000000000000000" && (
                      <div className="mt-4 text-sm text-white/60">
                        Winner: <span className="text-white/90">{shortAddr(p.winner)}</span>
                      </div>
                    )}
                  </div>

                  {matched && expired && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-extrabold">Resolution</div>
                        <span className={pill}>Bond: {formatEther(bond)} MON</span>
                      </div>

                      {!hasProposal ? (
                        <div className="mt-2 text-sm text-white/60">
                          No proposal yet — anyone can propose Outcome A or B.
                        </div>
                      ) : (
                        <>
                          <div className="mt-2 text-sm text-white/70">
                            Proposed:{" "}
                            <b className="text-white">
                              {d.proposedCreatorWins ? "Outcome A wins" : "Outcome B wins"}
                            </b>{" "}
                            by {shortAddr(d.proposer)}
                          </div>
                          {!finalized && !challenged && (
                            <div className="mt-1 text-sm text-white/60">
                              Challenge ends:{" "}
                              <b className="text-white">{fmtCountdown(secondsLeft)}</b>
                            </div>
                          )}
                          {challenged && !finalized && (
                            <div className="mt-1 text-sm text-red-300">
                              Challenged by {shortAddr(d.challenger)}
                            </div>
                          )}
                          {finalized && (
                            <div className="mt-2 text-sm text-green-400">Finalized ✔</div>
                          )}
                        </>
                      )}

                      <div className="mt-3 space-y-2">
                        {!hasProposal && (
                          <>
                            <button
                              className={purpleBtn + " w-full"}
                              disabled={!isConnected}
                              onClick={() => propose(id, true, bond)}
                            >
                              Propose: Outcome A wins
                            </button>
                            <button
                              className={purpleBtn + " w-full"}
                              disabled={!isConnected}
                              onClick={() => propose(id, false, bond)}
                            >
                              Propose: Outcome B wins
                            </button>
                          </>
                        )}

                        {hasProposal && !challenged && !finalized && (
                          <>
                            <button
                              className={btnGhost + " w-full"}
                              disabled={!isConnected}
                              onClick={() => challenge(id, bond)}
                            >
                              Challenge (post bond)
                            </button>
                            <button
                              className={purpleBtn + " w-full"}
                              disabled={!isConnected}
                              onClick={() => finalize(id)}
                            >
                              Finalize (if unchallenged)
                            </button>
                          </>
                        )}

                        {challenged && !finalized && isResolver && (
                          <>
                            <button className={purpleBtn + " w-full"} onClick={() => resolveDispute(id, true)}>
                              Resolve Dispute: Outcome A wins
                            </button>
                            <button className={purpleBtn + " w-full"} onClick={() => resolveDispute(id, false)}>
                              Resolve Dispute: Outcome B wins
                            </button>
                          </>
                        )}

                        {challenged && !finalized && !isResolver && (
                          <div className="text-xs text-white/50">Dispute pending resolver.</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
