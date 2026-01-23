"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseEther } from "viem";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";

import { PREDICTIONS_ABI } from "@/lib/predictionsAbi";
import { PREDICTIONS_ADDRESS } from "@/lib/predictions";
import { computeMarketId, saveMarketMeta } from "@/lib/marketMeta";

const MIN_BET = parseEther("100");

const pill =
  "px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white/80";

const glassCard =
  "rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-[0_0_80px_rgba(168,85,247,0.10)]";
const input =
  "w-full rounded-2xl bg-black/35 border border-white/10 px-4 py-3 text-white outline-none focus:border-purple-400/40 focus:bg-black/40";
const softBtn =
  "rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-bold";
const purpleBtn =
  "rounded-2xl border border-purple-400/40 bg-purple-500/25 hover:bg-purple-500/35 transition font-extrabold";

export default function CreatePredictionPage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [title, setTitle] = useState("Lakers vs Bulls");
  const [outcomeA, setOutcomeA] = useState("Lakers win");
  const [outcomeB, setOutcomeB] = useState("Bulls win");
  const [side, setSide] = useState<0 | 1>(0); // 0=Outcome A (Higher), 1=Outcome B (Lower)
  const [amount, setAmount] = useState("100");

  const [expiryPreset, setExpiryPreset] = useState<"1d" | "3d" | "7d" | "custom">("1d");
  const [customHours, setCustomHours] = useState("24");

  const [loading, setLoading] = useState(false);

  const marketId = useMemo(() => {
    return computeMarketId(title, outcomeA, outcomeB);
  }, [title, outcomeA, outcomeB]);

  const expirySeconds = useMemo(() => {
    if (expiryPreset === "1d") return 60 * 60 * 24;
    if (expiryPreset === "3d") return 60 * 60 * 24 * 3;
    if (expiryPreset === "7d") return 60 * 60 * 24 * 7;
    const h = Math.max(1, Number(customHours || "24"));
    return h * 60 * 60;
  }, [expiryPreset, customHours]);

  async function onCreate() {
    if (!walletClient || !publicClient) {
      alert("Connect wallet");
      return;
    }

    const t = title.trim();
    const a = outcomeA.trim();
    const b = outcomeB.trim();

    if (!t || !a || !b) {
      alert("Fill Title + Outcome A + Outcome B");
      return;
    }
    if (a.toLowerCase() === b.toLowerCase()) {
      alert("Outcome A and Outcome B must be different");
      return;
    }

    let value: bigint;
    try {
      value = parseEther(amount || "0");
    } catch {
      alert("Bad amount");
      return;
    }

    if (value < MIN_BET) {
      alert("Minimum prediction size is 100 MON");
      return;
    }

    // store labels locally so list page can show nice text
    saveMarketMeta({ marketId, title: t, outcomeA: a, outcomeB: b });

    const expiry = Math.floor(Date.now() / 1000) + expirySeconds;

    try {
      setLoading(true);

      const targetPrice = 0n; // unused for A/B markets
      const hash = await walletClient.writeContract({
        address: PREDICTIONS_ADDRESS,
        abi: PREDICTIONS_ABI,
        functionName: "createPrediction",
        args: [marketId, side, targetPrice, expiry],
        value,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      router.push("/predictions");
    } catch (e) {
      console.error(e);
      alert("Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 text-white">
      {/* glossy header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl p-6">
        <div className="absolute -inset-10 opacity-40 blur-3xl"
             style={{
               background:
                 "radial-gradient(circle at 20% 30%, rgba(168,85,247,0.35), transparent 55%), radial-gradient(circle at 75% 20%, rgba(236,72,153,0.18), transparent 55%), radial-gradient(circle at 40% 80%, rgba(168,85,247,0.20), transparent 55%)",
             }}
        />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <div className="text-3xl font-extrabold">Create Prediction</div>
            <div className="mt-1 text-white/70">
              Minimum bet: <b className="text-white">100 MON</b> • 1% fee fuels buybacks
            </div>
          </div>
          <button onClick={() => router.push("/predictions")} className={`${softBtn} px-4 py-2`}>
            Back
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* left: form */}
        <div className={`${glassCard} p-6 relative overflow-hidden`}>
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background:
                "linear-gradient(120deg, rgba(168,85,247,0.20), transparent 40%), linear-gradient(300deg, rgba(168,85,247,0.12), transparent 55%)",
            }}
          />
          <div className="relative space-y-5">
            <div>
              <label className="text-sm text-white/70">Market title</label>
              <input
                className={`${input} mt-2`}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lakers vs Bulls • PHUCKMC price • Anything"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm text-white/70">Outcome A</label>
                <input
                  className={`${input} mt-2`}
                  value={outcomeA}
                  onChange={(e) => setOutcomeA(e.target.value)}
                  placeholder="Yes / Team A wins / Higher"
                />
              </div>
              <div>
                <label className="text-sm text-white/70">Outcome B</label>
                <input
                  className={`${input} mt-2`}
                  value={outcomeB}
                  onChange={(e) => setOutcomeB(e.target.value)}
                  placeholder="No / Team B wins / Lower"
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setSide(0)}
                className={`${side === 0 ? purpleBtn : softBtn} px-4 py-3`}
              >
                Pick Outcome A
              </button>
              <button
                type="button"
                onClick={() => setSide(1)}
                className={`${side === 1 ? purpleBtn : softBtn} px-4 py-3`}
              >
                Pick Outcome B
              </button>
            </div>

            <div>
              <label className="text-sm text-white/70">Expiry</label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {[
                  { k: "1d", label: "1 Day" },
                  { k: "3d", label: "3 Days" },
                  { k: "7d", label: "7 Days" },
                  { k: "custom", label: "Custom" },
                ].map((x) => (
                  <button
                    key={x.k}
                    type="button"
                    onClick={() => setExpiryPreset(x.k as any)}
                    className={`${expiryPreset === x.k ? purpleBtn : softBtn} py-2`}
                  >
                    {x.label}
                  </button>
                ))}
              </div>

              {expiryPreset === "custom" && (
                <div className="mt-3">
                  <label className="text-sm text-white/70">Custom hours</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className={`${input} mt-2`}
                    value={customHours}
                    onChange={(e) => setCustomHours(e.target.value)}
                  />
                </div>
              )}

              <div className="mt-2 text-xs text-white/50">
                Selected: {Math.round(expirySeconds / 3600)} hours
              </div>
            </div>

            <div>
              <label className="text-sm text-white/70">Stake amount (MON)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`${input} mt-2`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <div className="mt-2 text-xs text-white/50">
                Creation takes 1% fee → buyback wallet. If no match in 7 days → escrow refunded.
              </div>
            </div>

            <button
              onClick={onCreate}
              disabled={!isConnected || loading}
              className={`${purpleBtn} w-full py-3 disabled:opacity-50`}
            >
              {loading ? "Creating…" : "PHUCK IT — Create Prediction"}
            </button>

            {!isConnected && (
              <div className="text-sm text-red-400">Connect wallet to create.</div>
            )}
          </div>
        </div>

        {/* right: glossy preview */}
        <div className={`${glassCard} p-6 relative overflow-hidden`}>
          <div
            className="absolute inset-0 opacity-35"
            style={{
              background:
                "radial-gradient(circle at 25% 20%, rgba(168,85,247,0.35), transparent 55%), radial-gradient(circle at 70% 70%, rgba(236,72,153,0.10), transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="text-lg font-extrabold">Preview</div>
              <span className={pill}>Waiting for match</span>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/35 p-4">
              <div className="text-white/60 text-xs">Market</div>
              <div className="text-xl font-extrabold mt-1">{title.trim() || "—"}</div>

              <div className="mt-4 text-white/60 text-xs">Your Pick</div>
              <div className="mt-1 font-bold">
                {side === 0 ? `Outcome A: ${outcomeA || "—"}` : `Outcome B: ${outcomeB || "—"}`}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/70">
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-xs text-white/50">Stake</div>
                  <div className="text-lg font-extrabold">{amount || "0"} MON</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="text-xs text-white/50">Expiry</div>
                  <div className="text-lg font-extrabold">
                    {Math.round(expirySeconds / 3600)}h
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-white/50 break-all">
                marketId: {marketId}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
