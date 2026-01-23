"use client";

import Link from "next/link";

const pill =
  "px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-white/80";
const glassCard =
  "rounded-3xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-[0_0_80px_rgba(168,85,247,0.10)]";
const softBtn =
  "rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-bold";
const purpleBtn =
  "rounded-2xl border border-purple-400/40 bg-purple-500/25 hover:bg-purple-500/35 transition font-extrabold";

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 text-white">
      {/* Glossy header */}
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
              How it works <span className="text-white/70">— PHUCKMC Predictions</span>
            </div>
            <div className="mt-2 text-white/70">
              Matched bets. Locked pools. Bond-backed resolution. 1% fees fuel buybacks.
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className={pill}>Minimum create: 100 MON</span>
              <span className={pill}>No match in 7 days → refund escrow</span>
              <span className={pill}>Disputes use bonds</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/predictions" className={`${softBtn} px-4 py-3`}>
              Back to Predictions
            </Link>
            <Link href="/predictions/create" className={`${purpleBtn} px-4 py-3`}>
              Create Prediction
            </Link>
          </div>
        </div>
      </div>

      {/* Main sections */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Step-by-step */}
        <div className={`${glassCard} p-6 relative overflow-hidden`}>
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background:
                "linear-gradient(120deg, rgba(168,85,247,0.18), transparent 45%), linear-gradient(300deg, rgba(168,85,247,0.10), transparent 60%)",
            }}
          />
          <div className="relative">
            <div className="text-2xl font-extrabold">Step-by-step</div>
            <div className="mt-4 space-y-4 text-white/80">
              <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <div className="font-bold">1) Create a prediction</div>
                <div className="mt-2 text-white/70 text-sm">
                  Enter a market title + two outcomes (Outcome A / Outcome B). Pick your outcome, set expiry, and stake MON.
                  <br />
                  <b className="text-white">Minimum: 100 MON</b>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <div className="font-bold">2) Matched system (fair)</div>
                <div className="mt-2 text-white/70 text-sm">
                  Your prediction sits open until someone takes the other side with the same stake amount.
                  <br />
                  Once matched, the pool is locked until expiry.
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <div className="font-bold">3) No match in 7 days</div>
                <div className="mt-2 text-white/70 text-sm">
                  If nobody matches it within 7 days, the escrow is refundable.
                  <br />
                  The <b className="text-white">1% creation fee</b> is not refundable.
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <div className="font-bold">4) After expiry → propose outcome</div>
                <div className="mt-2 text-white/70 text-sm">
                  When a matched prediction expires, <b className="text-white">anyone</b> can propose the outcome (A wins or B wins)
                  by posting a <b className="text-white">bond</b>.
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <div className="font-bold">5) Challenge window</div>
                <div className="mt-2 text-white/70 text-sm">
                  After a proposal, anyone can challenge within the challenge window by posting the same bond.
                  <br />
                  If nobody challenges, it finalizes automatically.
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                <div className="font-bold">6) If challenged → dispute resolution</div>
                <div className="mt-2 text-white/70 text-sm">
                  Challenged predictions enter dispute mode.
                  <br />
                  A resolver wallet finalizes the dispute. The correct side wins, and the bond incentives punish bad proposals.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fees + bonds */}
        <div className="space-y-6">
          <div className={`${glassCard} p-6 relative overflow-hidden`}>
            <div
              className="absolute inset-0 opacity-25"
              style={{
                background:
                  "radial-gradient(circle at 25% 20%, rgba(168,85,247,0.35), transparent 55%), radial-gradient(circle at 70% 70%, rgba(236,72,153,0.10), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="text-2xl font-extrabold">Fees</div>

              <div className="mt-4 space-y-3 text-sm text-white/75">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <div className="font-bold text-white">Creation fee: 1%</div>
                  <div className="mt-1">
                    Paid when a prediction is created. This goes to the PHUCKMC buyback wallet.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <div className="font-bold text-white">Winnings fee: 1%</div>
                  <div className="mt-1">
                    Taken from the losing side during settlement and sent to the buyback wallet.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <div className="font-bold text-white">Why matched bets?</div>
                  <div className="mt-1">
                    No house. No hidden odds. Two users lock equal stake amounts — winner takes the pot.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${glassCard} p-6 relative overflow-hidden`}>
            <div
              className="absolute inset-0 opacity-25"
              style={{
                background:
                  "linear-gradient(120deg, rgba(168,85,247,0.18), transparent 45%), linear-gradient(300deg, rgba(168,85,247,0.10), transparent 60%)",
              }}
            />
            <div className="relative">
              <div className="text-2xl font-extrabold">What is the bond?</div>
              <div className="mt-3 text-white/75 text-sm space-y-3">
                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <div className="font-bold text-white">Bond = honesty deposit</div>
                  <div className="mt-1">
                    When you propose an outcome, you put up a bond. If you lie, someone can challenge and you risk losing it.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <div className="font-bold text-white">Bond is small but meaningful</div>
                  <div className="mt-1">
                    Bond has a minimum and can scale with the pot.
                    This keeps proposals honest and makes disputes expensive to spam.
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/35 p-4">
                  <div className="font-bold text-white">Most markets auto-finalize</div>
                  <div className="mt-1">
                    If the proposal is correct, nobody challenges and it finalizes without drama.
                    Disputes only happen if someone strongly disagrees.
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Link href="/predictions/create" className={`${purpleBtn} px-4 py-3 text-center`}>
                  Create a Prediction
                </Link>
                <Link href="/predictions" className={`${softBtn} px-4 py-3 text-center`}>
                  View Predictions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div className="mt-8 text-xs text-white/50">
        Tip: For sports or yes/no events, use Outcome A vs Outcome B. “Higher/Lower” is just the contract’s internal label.
      </div>
    </div>
  );
}
