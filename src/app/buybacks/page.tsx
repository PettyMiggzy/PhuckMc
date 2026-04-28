"use client";
import React from "react";
import SiteNav from "@/components/SiteNav";

const S = { bg: "#0a0710", text: "#efeaf6", muted: "rgba(232,230,240,.65)", accent: "#c8ff00", border: "rgba(255,255,255,.08)" };

type Stats = {
  totalBuys?: string;
  totalMonIn?: string;
  totalTokensOut?: string;
  feeBps?: number;
  treasury?: string;
  router?: string;
  token?: string;
  lastBlock?: number;
  updatedAt?: number;
} & Record<string, unknown>;

function Num({ v, suffix = "", digits = 4 }: { v: string | number | undefined; suffix?: string; digits?: number }) {
  if (v === undefined || v === null || v === "") return <span style={{ color: S.muted }}>&mdash;</span>;
  const n = typeof v === "string" ? Number(v) : v;
  if (Number.isNaN(n)) return <span>{String(v)}{suffix}</span>;
  return <span>{n.toLocaleString(undefined, { maximumFractionDigits: digits })}{suffix}</span>;
}

export default function BuybacksPage() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    try {
      setLoading(true);
      const r = await fetch("/api/fees/stats", { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      setStats(await r.json());
      setErr(null);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "offline");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, []);

  return (
    <div style={{ background: S.bg, color: S.text, minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <SiteNav />
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: ".85rem", letterSpacing: ".25em", color: S.accent, marginBottom: ".5rem" }}>FEE FLYWHEEL</div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(2.5rem,6vw,4rem)", letterSpacing: ".04em", margin: 0, lineHeight: 1.05 }}>BUYBACKS</h1>
        <p style={{ color: S.muted, marginTop: ".75rem", maxWidth: 640, fontSize: ".95rem" }}>
          Every swap routed through PHUCKMC kicks fees back into the treasury. This page reads the FeeRouter contract live &mdash; no spreadsheet, no &ldquo;trust me&rdquo;.
        </p>

        {err && (
          <div style={{ marginTop: "1.5rem", padding: "1rem", border: `1px solid rgba(255,80,80,.4)`, borderRadius: 12, background: "rgba(255,80,80,.08)", color: "#ff8a8a", fontSize: ".88rem" }}>
            Stats endpoint offline: {err}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: ".75rem", marginTop: "1.75rem" }}>
          {[
            ["TOTAL BUYS", <Num key="a" v={stats?.totalBuys as string | undefined} digits={0} />],
            ["MON ROUTED", <Num key="b" v={stats?.totalMonIn as string | undefined} suffix=" MON" />],
            ["TOKENS BOUGHT", <Num key="c" v={stats?.totalTokensOut as string | undefined} suffix=" PHUCK" />],
            ["FEE BPS", stats?.feeBps !== undefined ? `${stats.feeBps} (${(Number(stats.feeBps) / 100).toFixed(2)}%)` : "\u2014"],
            ["LAST BLOCK", stats?.lastBlock ?? "\u2014"],
            ["UPDATED", stats?.updatedAt ? new Date(stats.updatedAt).toLocaleTimeString() : (loading ? "loading\u2026" : "\u2014")],
          ].map(([k, v], i) => (
            <div key={i} style={{ border: `1px solid ${S.border}`, borderRadius: 14, padding: "1.1rem", background: "rgba(255,255,255,.02)" }}>
              <div style={{ fontSize: ".7rem", letterSpacing: ".18em", color: S.muted, marginBottom: 8 }}>{k as string}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.4rem" }}>{v as React.ReactNode}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "1.75rem", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: ".75rem" }}>
          {[
            ["ROUTER", stats?.router],
            ["TREASURY", stats?.treasury],
            ["TOKEN", stats?.token],
          ].map(([k, v], i) => (
            <div key={i} style={{ border: `1px solid ${S.border}`, borderRadius: 14, padding: "1rem", background: "rgba(255,255,255,.02)", overflow: "hidden" }}>
              <div style={{ fontSize: ".7rem", letterSpacing: ".18em", color: S.muted, marginBottom: 6 }}>{k as string}</div>
              <div style={{ fontFamily: "ui-monospace,SFMono-Regular,Menlo,monospace", fontSize: ".78rem", wordBreak: "break-all", color: v ? S.text : S.muted }}>{(v as string) || "not configured"}</div>
            </div>
          ))}
        </div>

        <button onClick={load} disabled={loading} style={{ marginTop: "1.5rem", padding: "10px 20px", borderRadius: 999, border: `1px solid ${S.border}`, background: "rgba(255,255,255,.04)", color: S.text, fontSize: ".85rem", cursor: loading ? "wait" : "pointer" }}>
          {loading ? "Refreshing\u2026" : "Refresh"}
        </button>
      </main>
    </div>
  );
}
