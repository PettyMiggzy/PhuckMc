import Link from "next/link";
import Image from "next/image";

export default function SwapPage() {
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
              PHUCK <span className="text-purple-400">Swap</span>
            </h1>
            <p className="mt-2 text-white/75 max-w-2xl">
              Swap through the PHUCK route. A tiny fee funds{" "}
              <span className="text-white">buybacks + rewards</span>. (Frontend
              is live — router plugs in later.)
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
              href="/staking"
              className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition text-white/90"
            >
              Staking
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 h-px w-full bg-white/10" />

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Fee"
            value="0.30%"
            sub="split 50/50"
          />
          <StatCard
            title="24h Fees"
            value="$38,200"
            sub="estimated"
          />
          <StatCard
            title="24h Buyback / Rewards"
            value="$19,100 / $19,100"
            sub="est."
          />
        </div>

        {/* Main grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Swap box */}
          <div className="lg:col-span-3 rounded-3xl border border-white/12 bg-black/35 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.04)] p-6 md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Swap</h2>
              <span className="text-xs px-3 py-1 rounded-full border border-white/12 bg-white/5 text-white/70">
                Connect Wallet (soon)
              </span>
            </div>

            <div className="mt-6 space-y-4">
              <Field
                label="You pay"
                rightLabel="MON"
                placeholder="0.0"
                defaultValue="1.00"
              />
              <div className="flex items-center justify-center text-white/60">
                <span className="text-xl">↓</span>
              </div>
              <Field
                label="You receive"
                rightLabel="PHUCKMC"
                placeholder="0.0"
                defaultValue="~ 9,420,000"
              />

              <button
                disabled
                className="w-full mt-2 px-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-white/70 cursor-not-allowed"
                title="Router integration coming next"
              >
                Swap (soon)
              </button>

              <p className="text-sm text-white/70">
                Fee is automatically split into buyback + rewards pool. No extra
                steps.
              </p>
            </div>
          </div>

          {/* Side info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl border border-white/12 bg-black/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold">How it feels</h3>
              <ul className="mt-3 space-y-2 text-white/75">
                <li>• Same swap experience.</li>
                <li>• Tiny fee keeps the project alive.</li>
                <li>• Revenue comes from usage, not holders.</li>
                <li>• When staking launches, fees feed rewards.</li>
              </ul>
            </div>

            <div className="rounded-3xl border border-white/12 bg-black/30 backdrop-blur-xl p-6">
              <h3 className="text-lg font-semibold">Links</h3>
              <div className="mt-3 flex flex-col gap-3">
                <Link
                  href="https://nad.fun/tokens/0x148a3a811979e5BF8366FC279B2d67742Fe17777"
                  target="_blank"
                  className="px-4 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 transition text-white font-semibold text-center"
                >
                  Buy on Nad.fun
                </Link>
                <Link
                  href="#"
                  className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition text-white/90 border border-white/12 text-center"
                >
                  Telegram (set link)
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom spacing */}
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
  placeholder,
  defaultValue,
}: {
  label: string;
  rightLabel: string;
  placeholder: string;
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
        placeholder={placeholder}
        defaultValue={defaultValue}
        disabled
        aria-label={label}
      />
      <div className="mt-1 text-xs text-white/45">UI only for now</div>
    </div>
  );
}
