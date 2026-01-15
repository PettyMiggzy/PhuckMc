import Link from "next/link";

export default function StakingPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold">PHUCK Staking</h1>
        <p className="mt-3 text-white/70">
          Frontend placeholder. Contract wiring comes next.
        </p>

        <div className="mt-6 flex gap-3">
          <Link className="rounded-xl bg-purple-600 px-5 py-3 font-semibold" href="/">
            Back Home
          </Link>
          <a className="rounded-xl border border-white/15 bg-black/20 px-5 py-3 font-semibold" href="https://t.me/" target="_blank">
            Telegram
          </a>
        </div>
      </div>
    </main>
  );
}
