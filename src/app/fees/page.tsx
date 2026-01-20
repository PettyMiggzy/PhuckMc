export const dynamic = "force-dynamic";

const API_BASE =
  process.env.NEXT_PUBLIC_FEES_API_BASE || "http://143.198.8.129:8787";

async function getJson(path: string) {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fetch failed ${path}: ${res.status} ${text}`);
  }
  return res.json();
}

export default async function FeesPage() {
  const [stats, recent] = await Promise.all([
    getJson("/api/fees/stats"),
    getJson("/api/fees/recent?limit=20"),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Fees</h1>
        <a
          className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-sm"
          href={`${API_BASE}/api/fees/stats`}
          target="_blank"
          rel="noreferrer"
        >
          Open API
        </a>
      </div>

      <p className="mt-2 text-white/70">
        Live fee tracking from <span className="font-semibold">FeePaid</span>{" "}
        events on Monad (143).
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-white/60">Total FeePaid events</div>
          <div className="mt-2 text-3xl font-bold">
            {stats?.totalEvents ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm text-white/60">Buyback MON collected</div>
          <div className="mt-2 text-3xl font-bold">
            {stats?.buybackMon ?? "0"}
          </div>
          <div className="mt-1 text-xs text-white/50 break-all">
            Raw: {stats?.buybackMonRaw ?? "0"}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-lg font-semibold">Recent FeePaid</div>
          <div className="text-xs text-white/50">
            API: {API_BASE.replace("http://", "").replace("https://", "")}
          </div>
        </div>

        <div className="space-y-3">
          {(recent?.events ?? []).map((e: any) => {
            const sym = e?.tokenSymbol ?? "TOKEN";
            const amt = e?.platformShare ?? "0";
            const dest = e?.dest ?? "";
            const tx = e?.txHash ?? "";
            const block = e?.blockNumber ?? "";
            return (
              <div
                key={`${tx}-${e?.logIndex ?? ""}`}
                className="rounded-xl border border-white/10 bg-black/30 p-4"
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="text-white/70">
                    <span className="font-semibold text-white">Token:</span>{" "}
                    {sym}
                  </span>
                  <span className="text-white/70">
                    <span className="font-semibold text-white">Fee:</span>{" "}
                    {amt}
                  </span>
                  <span className="text-white/70">
                    <span className="font-semibold text-white">Block:</span>{" "}
                    {block}
                  </span>
                </div>

                <div className="mt-2 text-xs text-white/50 break-all">
                  <div>
                    <span className="font-semibold text-white/60">Dest:</span>{" "}
                    {dest}
                  </div>
                  <div>
                    <span className="font-semibold text-white/60">TX:</span>{" "}
                    {tx}
                  </div>
                </div>
              </div>
            );
          })}

          {(recent?.events ?? []).length === 0 && (
            <div className="text-white/60 text-sm">No events yet.</div>
          )}
        </div>
      </div>
    </main>
  );
}
