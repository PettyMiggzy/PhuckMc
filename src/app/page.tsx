"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const CA = "0x148a3a811979e5BF8366FC279B2d67742Fe17777";

export default function HomePage() {
  const [copied, setCopied] = useState(false);

  async function copyCA() {
    try {
      await navigator.clipboard.writeText(CA);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback: do nothing
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      {/* BG */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero.png"
          alt="PHUCKMC hero"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/60" />
      </div>

      {/* TOP NAV */}
      <header className="mx-auto max-w-7xl px-6 pt-6">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 backdrop-blur-md px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/10 bg-black/40">
              <Image src="/logo.png" alt="PHUCKMC" fill sizes="36px" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold tracking-wide">PHUCKMC</div>
              <div className="text-xs text-white/70">calm money • loud memes</div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              PHUCK
            </Link>
            <Link
              href="/swap"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Swap
            </Link>
            <Link
              href="/staking"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Staking
            </Link>
            <a
              href="https://t.me/"
              target="_blank"
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
              rel="noreferrer"
            >
              Telegram
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              PHUCK<span className="text-purple-300">MC</span>
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-xl">
              Calm money. Loud memes.
              <br />
              <span className="font-semibold text-white">Fuck what the chart says.</span>
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={`https://nad.fun/tokens/${CA}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:bg-purple-500"
              >
                Buy on Nad.fun
              </a>
              <a
                href="https://t.me/"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-white/15 bg-black/25 px-6 py-3 font-semibold text-white hover:bg-white/10"
              >
                Join Telegram →
              </a>
            </div>

            {/* CA ROW */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/35 backdrop-blur-md p-4">
              <div className="text-xs tracking-widest text-white/60">CONTRACT</div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <code className="text-sm md:text-base text-white/90 break-all">
                  {CA}
                </code>
                <button
                  onClick={copyCA}
                  className="shrink-0 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="rounded-3xl border border-white/10 bg-black/25 backdrop-blur-md p-6">
            <div className="text-sm tracking-widest text-white/70">PROJECT PULSE</div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="font-semibold">LIVE SOON</div>
                <div className="mt-2 text-sm text-white/75">
                  We’re wiring the on-chain stats.
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="font-semibold">PHUCK SWAP</div>
                <div className="mt-2 text-sm text-white/75">
                  fees → buyback + rewards
                  <br />
                  Make the meme fund itself.
                </div>
                <Link
                  href="/swap"
                  className="mt-4 inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
                >
                  Open Swap
                </Link>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="font-semibold">STAKING</div>
                <div className="mt-2 text-sm text-white/75">
                  lock in • chill out
                  <br />
                  Earn while you ignore the noise.
                </div>
                <Link
                  href="/staking"
                  className="mt-4 inline-flex rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
                >
                  Open Staking
                </Link>
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4 text-center text-sm text-white/70">
              NO PRESSURE. JUST PRESENCE.
              <div className="mt-1 text-xs text-white/50">
                PHUCKMC runs. You hold. Rewards flow.
              </div>
            </div>

            {/* bottom stats placeholders */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-center">
                <div className="text-xs tracking-widest text-white/60">CURRENT TREASURY</div>
                <div className="mt-1 font-semibold">124.5K MON</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-center">
                <div className="text-xs tracking-widest text-white/60">TOTAL REWARDS PAID</div>
                <div className="mt-1 font-semibold">1.2M MON</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-center">
                <div className="text-xs tracking-widest text-white/60">SUPPLY LOCKED</div>
                <div className="mt-1 font-semibold">42%</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
