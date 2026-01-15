import Image from "next/image";
import Link from "next/link";

const CA = "0x148a3a811979e5BF8366FC279B2d67742Fe17777";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/hero.png"
          alt="PHUCKMC background"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/30 via-black/30 to-black/70" />
      </div>

      {/* Top bar */}
      <header className="mx-auto max-w-6xl px-6 pt-6">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 overflow-hidden rounded-full ring-1 ring-white/15">
              <Image src="/logo.png" alt="logo" fill className="object-cover" />
            </div>
            <div className="leading-tight">
              <div className="font-semibold tracking-wide">PHUCKMC</div>
              <div className="text-xs text-white/70">calm money • loud memes</div>
            </div>
          </div>

          <nav className="flex items-center gap-2 text-sm">
            <Link className="rounded-full border border-white/15 bg-black/20 px-4 py-2 hover:bg-white/10" href="/">
              PHUCK
            </Link>
            <Link className="rounded-full border border-white/15 bg-black/20 px-4 py-2 hover:bg-white/10" href="/swap">
              Swap
            </Link>
            <Link className="rounded-full border border-white/15 bg-black/20 px-4 py-2 hover:bg-white/10" href="/staking">
              Staking
            </Link>
            <Link
              className="rounded-full border border-white/15 bg-black/20 px-4 py-2 hover:bg-white/10"
              href="https://t.me/"
              target="_blank"
            >
              Telegram
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-[0.18em]">PHUCKMC</h1>
          <p className="mt-3 text-sm md:text-base tracking-[0.35em] text-white/80">
            NO EXPECTATIONS. JUST REVENUE.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur">
            <h2 className="text-2xl font-semibold tracking-wide">A TOKEN THAT WORKS SILENTLY.</h2>
            <p className="mt-4 text-white/80 leading-relaxed">
              Hold PHUCKMC. We do the work. You earn the rewards.
              <br />
              No charts, no hype. Just quiet, consistent revenue.
            </p>

            <div className="mt-6">
              <div className="text-sm tracking-[0.35em] text-white/70">CONTRACT:</div>
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                <code className="text-sm text-white/90 break-all">{CA}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(CA)}
                  className="ml-auto rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs hover:bg-white/15"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                href={`https://nad.fun/tokens/${CA}`}
                target="_blank"
                className="rounded-xl bg-purple-600 px-5 py-3 font-semibold hover:bg-purple-500"
              >
                Buy PHUCKMC
              </Link>
              <Link
                href="https://t.me/"
                target="_blank"
                className="rounded-xl border border-white/15 bg-black/20 px-5 py-3 font-semibold hover:bg-white/10"
              >
                Join Telegram →
              </Link>
            </div>
          </div>

          {/* Right card */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 backdrop-blur">
            <h2 className="text-xl font-semibold tracking-wide text-white/90">THE FUTURE OF PHUCKMC</h2>

            <div className="mt-5 space-y-4">
              <Feature title="STAKING" desc="Earn passive rewards." />
              <Feature title="PHUCK SWAP" desc="Feeless trades, shared revenue." />
              <Feature title="BUYBACKS" desc="Constant support of price." />
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm tracking-[0.35em] text-white/80">NO PRESSURE. JUST PRESENCE.</p>
          <p className="mt-2 text-white/70">PHUCKMC runs. You hold. Rewards flow.</p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            <Stat label="CURRENT TREASURY" value="124.5K MON" />
            <Stat label="TOTAL REWARDS PAID" value="1.2M MON" />
            <Stat label="SUPPLY LOCKED" value="42%" />
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
      <div className="font-semibold tracking-wide">{title}</div>
      <div className="mt-1 text-white/70">{desc}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
      <div className="text-xs tracking-[0.35em] text-white/70">{label}</div>
      <div className="mt-2 text-lg font-semibold">{value}</div>
    </div>
  );
}
