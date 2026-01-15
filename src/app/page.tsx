import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white">
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
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-transparent to-black/60" />
      </div>

      {/* CONTENT */}
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
          PHUCK<span className="text-purple-400">MC</span>
        </h1>

        <p className="mt-4 text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed">
          Calm money. Loud memes.
          <br />
          <span className="text-white font-semibold">
            Fuck what the chart says.
          </span>
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="https://nad.fun/tokens/0x148a3a811979e5BF8366FC279B2d67742Fe17777"
            target="_blank"
            className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 transition text-white font-semibold shadow-lg shadow-purple-900/30"
          >
            Buy on Nad.fun
          </Link>

          <Link
            href="https://t.me/YOUR_TELEGRAM"
            target="_blank"
            className="px-6 py-3 rounded-2xl border border-white/30 hover:border-white/60 transition text-white/95 font-semibold bg-white/5"
          >
            Join Telegram →
          </Link>
        </div>

        <div className="mt-8 text-sm text-white/75">
          <div className="font-semibold">CA:</div>
          <div className="break-all">
            0x148a3a811979e5BF8366FC279B2d67742Fe17777
          </div>
        </div>

        {/* QUICK PULSE PANEL */}
        <div className="mt-10 rounded-2xl border border-white/15 bg-black/35 backdrop-blur px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white/90">
            <div>
              <div className="text-xs uppercase tracking-wider text-white/60">
                Project pulse
              </div>
              <div className="mt-2 text-2xl font-bold">Live soon</div>
              <div className="mt-1 text-sm text-white/70">
                We’re wiring the on-chain stats.
              </div>
            </div>

            <div className="md:text-center">
              <div className="text-xs uppercase tracking-wider text-white/60">
                PHUCK Swap
              </div>
              <div className="mt-2 text-lg font-semibold">
                fees → buyback + rewards
              </div>
              <div className="mt-1 text-sm text-white/70">
                Make the meme fund itself.
              </div>
            </div>

            <div className="md:text-right">
              <div className="text-xs uppercase tracking-wider text-white/60">
                Staking
              </div>
              <div className="mt-2 text-lg font-semibold">
                lock in • chill out
              </div>
              <div className="mt-1 text-sm text-white/70">
                Earn while you ignore the noise.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
