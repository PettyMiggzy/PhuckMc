export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-white">
      <div className="rounded-3xl border border-white/10 bg-black/40 p-8">
        <div className="text-xs tracking-[0.22em] text-white/60">LOADING</div>
        <div className="mt-3 text-lg font-semibold">Loading staking…</div>
        <div className="mt-2 text-white/70">If this hangs forever, the client is crashing.</div>
      </div>
    </div>
  )
}
