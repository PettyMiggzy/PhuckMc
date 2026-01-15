import { mock } from "@/lib/mockData";

export default function Swap() {
  const feePct = (mock.phuckSwapFeeBps / 100).toFixed(2);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold">PHUCK Swap</h1>
          <p className="mt-2 text-white/70 max-w-2xl">
            Swap through the PHUCK route. A tiny fee funds buybacks + rewards.  
            (Frontend is live — router plugs in later.)
          </p>
        </div>

        <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">
          Connect Wallet (soon)
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Stat label="Fee" value={`${feePct}%`} sub="split 50/50" />
        <Stat label="24h Fees" value={`$${mock.fees24h.toLocaleString()}`} sub="estimated" />
        <Stat label="24h Buyback" value={`$${mock.buyback24h.toLocaleString()}`} sub="est." />
        <Stat label="24h Rewards" value={`$${mock.rewards24h.toLocaleString()}`} sub="est." />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-bold">Swap</div>

          <div className="mt-4 space-y-3">
            <SwapBox title="You Pay" token="MON" amount="1.00" />
            <div className="text-center text-white/40">↓</div>
            <SwapBox title="You Receive" token="PHUCKMC" amount="~ 9,420,000" />
          </div>

          <button className="mt-6 w-full rounded-2xl bg-purple-600 px-4 py-4 text-lg font-extrabold text-black hover:bg-purple-500">
            Swap (soon)
          </button>

          <div className="mt-4 text-xs text-white/50">
            Fee is automatically split into buyback + rewards pool. No extra steps.
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-bold">How it feels</div>
          <ul className="mt-4 space-y-3 text-white/70">
            <li>• Same swap experience.</li>
            <li>• Tiny fee keeps the project alive.</li>
            <li>• Revenue comes from usage, not holders.</li>
            <li>• When staking launches, fees feed rewards.</li>
          </ul>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="text-xs text-white/60">Status</div>
            <div className="mt-1 text-sm text-white/80">
              Frontend ready. Router deploy later.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs text-white/50">{sub}</div>
    </div>
  );
}

function SwapBox({ title, token, amount }: { title: string; token: string; amount: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>{title}</span>
        <span>{token}</span>
      </div>
      <div className="mt-2 text-2xl font-extrabold text-white">{amount}</div>
    </div>
  );
}
