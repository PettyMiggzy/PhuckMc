import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
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
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-6 py-28 grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* LEFT */}
        <div>
          <h1 className="text-5xl font-bold mb-4">
            PHUCK<span className="text-purple-400">MC</span>
          </h1>

          <p className="text-lg text-white/80 max-w-xl mb-8">
            A calm coin. A loud character.  
            A future that funds itself.
          </p>

          <div className="flex gap-4">
            <Link
              href="https://nad.fun/tokens/0x148a3a811979e5BF8366FC279B2d67742Fe17777"
              target="_blank"
              className="px-6 py-3 rounded-xl bg-purple-600 text-white font-semibold"
            >
              Buy on Nad.fun
            </Link>

            <Link
              href="https://t.me/PhuckMc"
              target="_blank"
              className="px-6 py-3 rounded-xl border border-white/20 text-white"
            >
              Join Telegram →
            </Link>
          </div>

          <div className="mt-6 text-xs text-white/50">
            CA: 0x148a3a811979e5BF8366FC279B2d67742Fe17777
          </div>
        </div>

        {/* RIGHT – PROJECT PULSE (STATIC / FAKE FOR NOW) */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="text-sm text-white/60 mb-4">Project pulse</div>

          <div className="grid grid-cols-2 gap-4">
            <Stat label="Holders" value="8,942" />
            <Stat label="Total Staked" value="384,220,000" />
            <Stat label="Rewards Pool" value="12,840,000" />
            <Stat label="APR (target)" value="84.2%" />
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <div className="font-semibold">PHUCK Swap</div>
              <div className="text-xs text-white/60">
                fees → buyback + rewards
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <div className="font-semibold">Staking</div>
              <div className="text-xs text-white/60">
                lock in • chill out
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-white/40 text-center">
            Last buyback: 2h ago • Next reward: 5h 12m
          </div>
        </div>

      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-white/5">
      <div className="text-xs text-white/60">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
