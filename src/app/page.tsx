"use client";

import Image from "next/image";
import Link from "next/link";

const CA = "0x148a3a811979e5BF8366FC279B2d677742Fe17777";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        {/* star/space image (use your hero.png or swap to /space.png if you have one) */}
        <Image
          src="/hero.png"
          alt="PHUCKMC space"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* vignette */}
        <div className="absolute inset-0 bg-black/60" />
        {/* subtle purple glow */}
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_50%_20%,rgba(168,85,247,0.35),transparent_55%),radial-gradient(circle_at_20%_80%,rgba(99,102,241,0.22),transparent_55%)]" />
      </div>

      {/* TOP NAV */}
      <header className="mx-auto max-w-6xl px-6 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-white/5">
              <Image src="/logo.png" alt="PHUCKMC" fill className="object-cover" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold tracking-wide">PHUCKMC</div>
              <div className="text-xs text-white/60">calm money • loud memes</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-3">
            <DeadPill>PHUCK</DeadPill>
            <DeadPill>Swap</DeadPill>
            <DeadPill>Staking</DeadPill>
            <Link
              href="https://t.me/"
              target="_blank"
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm hover:bg-white/10 transition"
            >
              Telegram
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO CONTENT */}
      <section className="mx-auto max-w-6xl px-6 pt-14 pb-20">
        {/* big neon title */}
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-[0.12em]">
            <span className="drop-shadow-[0_0_18px_rgba(168,85,247,0.55)]">
              PHUCKMC
            </span>
          </h1>
          <p className="mt-3 text-sm md:text-base tracking-[0.22em] text-white/70">
            NO EXPECTATIONS. JUST REVENUE.
          </p>
        </div>

        {/* MAIN GLASS PANEL */}
        <div className="mt-10 rounded-[32px] border border-white/12 bg-white/6 backdrop-blur-2xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)] overflow-hidden">
          {/* top strip */}
          <div className="h-10 bg-gradient-to-r from-purple-600/30 via-white/5 to-indigo-600/25 border-b border-white/10" />

          <div className="p-6 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* LEFT */}
              <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-wide">
                  A TOKEN THAT WORKS SILENTLY.
                </h2>

                <p className="mt-5 text-white/80 leading-relaxed max-w-xl">
                  Hold PHUCKMC. We do the work. You earn the rewards.
                  <br />
                  <span className="text-white/60">
                    No charts, no hype. Just quiet, consistent revenue.
                  </span>
                </p>

                <div className="mt-8">
                  <div className="text-xs tracking-[0.22em] text-white/60">
                    CONTRACT:
                  </div>

                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/12 bg-black/35 px-4 py-3">
                    <div className="text-sm md:text-base font-semibold break-all">
                      {CA}
                    </div>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(CA)}
                      className="ml-auto shrink-0 rounded-xl border border-white/12 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`https://nad.fun/tokens/${CA}`}
                    target="_blank"
                    className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 font-semibold hover:opacity-95 transition"
                  >
                    BUY PHUCKMC
                  </Link>

                  <Link
                    href="https://t.me/"
                    target="_blank"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-6 py-3 font-semibold hover:bg-white/10 transition"
                  >
                    JOIN TELEGRAM
                  </Link>
                </div>
              </div>

              {/* RIGHT */}
              <div>
                <div className="text-xs tracking-[0.22em] text-white/60 mb-3">
                  THE FUTURE OF PHUCKMC
                </div>

                <div className="space-y-4">
                  <FeatureCard
                    icon="crystal"
                    title="STAKING"
                    desc="Earn passive rewards."
                    disabled
                  />
                  <FeatureCard
                    icon="swap"
                    title="PHUCK SWAP"
                    desc="Feeless trades, shared revenue."
                    disabled
                  />
                  <FeatureCard
                    icon="rocket"
                    title="BUYBACKS"
                    desc="Constant support of price."
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {/* bottom strip */}
          <div className="h-12 bg-gradient-to-r from-purple-600/25 via-white/5 to-indigo-600/20 border-t border-white/10" />
        </div>

        {/* BOTTOM TAGLINE + METRICS */}
        <div className="mt-10 text-center">
          <div className="text-sm tracking-[0.22em] text-white/75">
            NO PRESSURE. JUST PRESENCE.
          </div>
          <div className="mt-2 text-white/60">
            PHUCKMC runs. You hold. Rewards flow.
          </div>
        </div>

        <div className="mt-8 mx-auto max-w-6xl rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10">
            <Metric label="CURRENT TREASURY" value="124.5K MON" />
            <Metric label="TOTAL REWARDS PAID" value="1.2M MON" />
            <Metric label="SUPPLY LOCKED" value="42%" />
          </div>
        </div>
      </section>
    </main>
  );
}

/** Disabled pill nav item (does nothing) */
function DeadPill({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={(e) => e.preventDefault()}
      className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm hover:bg-white/10 transition cursor-not-allowed opacity-80"
      aria-disabled="true"
      title="Coming soon"
    >
      {children}
    </button>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-6 py-5 text-center">
      <div className="text-xs tracking-[0.22em] text-white/60">{label}</div>
      <div className="mt-2 text-lg font-bold">{value}</div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  disabled,
}: {
  icon: "crystal" | "swap" | "rocket";
  title: string;
  desc: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={(e) => e.preventDefault()}
      className={[
        "w-full text-left rounded-2xl border border-white/12 bg-black/30 p-5",
        "hover:bg-black/40 transition",
        disabled ? "cursor-not-allowed opacity-90" : "",
      ].join(" ")}
      aria-disabled={disabled ? "true" : "false"}
      title={disabled ? "Coming soon" : ""}
    >
      <div className="flex items-center gap-4">
        <Icon kind={icon} />
        <div>
          <div className="font-bold tracking-wide">{title}</div>
          <div className="text-sm text-white/65 mt-1">{desc}</div>
        </div>
      </div>
    </button>
  );
}

function Icon({ kind }: { kind: "crystal" | "swap" | "rocket" }) {
  // Simple inline icons so you don’t need any icon libraries
  const base =
    "h-12 w-12 rounded-2xl border border-white/12 bg-gradient-to-b from-purple-600/30 to-indigo-600/15 flex items-center justify-center";
  if (kind === "crystal") {
    return (
      <div className={base}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l5 6-5 14L7 8l5-6z"
            stroke="currentColor"
            strokeWidth="1.6"
            opacity="0.95"
          />
          <path
            d="M7 8h10"
            stroke="currentColor"
            strokeWidth="1.6"
            opacity="0.55"
          />
        </svg>
      </div>
    );
  }
  if (kind === "swap") {
    return (
      <div className={base}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path
            d="M7 7h10l-2-2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />
          <path
            d="M17 17H7l2 2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.95"
          />
        </svg>
      </div>
    );
  }
  return (
    <div className={base}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2l4 8-4 3-4-3 4-8z"
          stroke="currentColor"
          strokeWidth="1.6"
          opacity="0.95"
        />
        <path
          d="M8 21l4-8 4 8"
          stroke="currentColor"
          strokeWidth="1.6"
          opacity="0.55"
        />
      </svg>
    </div>
  );
}
