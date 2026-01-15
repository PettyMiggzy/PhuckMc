import Link from "next/link";
import Image from "next/image";

export default function StakingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* HERO BACKGROUND */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero.png"
          alt="PHUCKMC hero"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/25 via-transparent to-black/40" />
      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        {/* Title row */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              PHUCK <span className="text-purple-400">Staking</span>
            </h1>
            <p className="mt-2 text-white/75 max-w-2xl">
              Lock in. Chill out. Rewards are fueled by usage + buybacks.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition text-white/90"
            >
              Home
            </Link>
            <Link
              href="/swap"
              className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition text-white/90"
            >
              Swap
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 h-px w-full bg-white/10" />

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard title="Total Staked" value="384,220,000" sub="PHUCKMC" />
          <StatCard title="Rewards Pool" value="12,840,000" sub="PHUCKMC" />
          <StatCard title="APR (target)" value="84.2%" sub="placeholder" />
        </div>

        {/* Main */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Stake actions */}
          <div className="lg:col-span-3 rounded-3xl border border-white/12 bg-black/35 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)] p-6 md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Stake</h2>
              <span className="text-xs px-3 py-1 rounded-full border border-white/12 bg-white/5 text-white/70">
                Connect Wallet (soon)
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Amount to stake" rightLabel="PHUCKMC" defaultValue="0.00" />
              <Field label="Your staked" rightLabel="PHUCKMC" defaultValue="0.00" />
              <Field label="Rewards earned" rightLabel="PHUCKMC" defaultValue="0.00" />
              <Field label="Next reward in" rightLabel="time" defaultValue="~ 5h 12m" />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                disabled
                className="w-full px-5 py-3 rounded-2xl bg-purple-600/40 border border-purple-300/20 text-white/70 cursor-not-allowed"
                title="Contract wiring coming next"
              >
                Stake (soon)
              </button>
              <button
                disabled
                className="w-full px-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-white/70 cursor-not-allowed"
                title="Contract wiring coming next"
              >
                Unstake (soon)
              </button>
            </div>

            <div className="mt-4 text-sm text-white/70">
              When we wire it on-chain: rewards will flow, and unstake rules (if
              any) will be shown here clearly.
            </div>
          </div>

          {/* Side info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-white/12 bg-black/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold">Why stake?</h3>
              <ul className="mt-3 space-y-2 text-white/75">
                <li>• Fees feed rewards.</li>
                <li>• Buybacks support the meme.</li>
                <li>• Stakers get first love.</li>
                <li>• Simple, clean, no fluff.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/12 bg-black/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold">Quick links</h3>
              <div className="mt-3 flex flex-col gap-3">
                <Link
                  href="/swap"
                  className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition text-white/90 border border-white/12 text-center"
                >
                  Open Swap
                </Link>
                <Link
                  href="https://nad.fun/tokens/0x148a3a811979e5BF8366FC279B2d67742Fe17777"
                  target="_blank"
                  className="px-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 transition text-white font-semibold text-center"
                >
                  Buy on Nad.fun
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="h-10" />
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-3xl border border-white/12 bg-black/30 backdrop-blur-xl p-5">
      <div className="text-sm text-white/60">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-sm text-white/60">{sub}</div>
    </div>
  );
}

function Field({
  label,
  rightLabel,
  defaultValue,
}: {
  label: string;
  rightLabel: string;
  defaultValue?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>{label}</span>
        <span className="px-2 py-1 rounded-lg border border-white/10 bg-black/20 text-white/70">
          {rightLabel}
        </span>
      </div>
      <input
        className="mt-2 w-full bg-transparent outline-none text-white text-xl placeholder:text-white/30"
        defaultValue={defaultValue}
        disabled
        aria-label={label}
      />
      <div className="mt-1 text-xs text-white/45">UI only for now</div>
    </div>
  );
}
