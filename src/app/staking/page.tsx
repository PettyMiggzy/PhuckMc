import { PHUCK, mock } from "@/lib/mockData";

function fmt(n: number) {
  return n.toLocaleString();
}

export default function Staking() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold">Staking</h1>
          <p className="mt-2 text-white/70 max-w-2xl">
            Stake PHUCKMC to earn from the ecosystem. Calm rewards. No grind.  
            (Frontend is live — staking contract plugs in later.)
          </p>
        </div>

        <button className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10">
          Connect Wallet (soon)
        </button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Card label="Total Staked" value={fmt(mock.totalStaked)} sub="PHUCKMC" />
        <Card label="Total Stakers" value={fmt(mock.totalStakers)} sub="wallets" />
        <Card label="Rewards Pool" value={fmt(mock.rewardsPool)} sub="PHUCKMC" />
        <Card label="APR Target" value={`${mock.apr}%`} sub="dynamic" />
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-bold">Your Position</div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Mini label="Your Staked" value={fmt(mock.yourStaked)} />
            <Mini label="Pending Rewards" value={fmt(mock.yourRewards)} />
          </div>

          <div className="mt-6 grid gap-3">
            <FakeInput label="Stake amount" placeholder="10,000,000" />
            <div className="flex gap-3">
              <button className="flex-1 rounded-2xl bg-purple-600 px-4 py-3 font-bold text-black hover:bg-purple-500">
                Stake (soon)
              </button>
              <button className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-white/80 hover:bg-white/10">
                Unstake (soon)
              </button>
            </div>
          </div>

          <div className="mt-5 text-xs text-white/50">
            Rewards funded by PHUCK Swap fees + future project revenue. No pressure. Just distribution.
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-bold">What’s Bullish</div>
          <ul className="mt-4 space-y-3 text-white/70">
            <li>• Rewards pool is visible and trackable.</li>
            <li>• APR adjusts with volume — no fake fixed yields.</li>
            <li>• Buybacks reduce supply while rewards grow loyalty.</li>
            <li>• No “do tasks” farming. Holding is enough.</li>
          </ul>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
            <div className="text-xs text-white/60">Contract</div>
            <div className="mt-1 text-sm text-white/80 break-all">{PHUCK.ca}</div>
            <div className="mt-2 text-xs text-white/50">
              (Staking contract address will appear here after deployment.)
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs text-white/50">{sub}</div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-1 text-xl font-extrabold">{value}</div>
    </div>
  );
}

function FakeInput({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <div className="mb-2 text-xs text-white/60">{label}</div>
      <input
        placeholder={placeholder}
        disabled
        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white/70 placeholder:text-white/30 opacity-70"
      />
    </label>
  );
}
