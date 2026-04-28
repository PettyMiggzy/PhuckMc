"use client";
import React from "react";
import { useAccount, useBalance, useConnect, useDisconnect } from "wagmi";
import SiteNav from "@/components/SiteNav";

const S = { bg: "#0a0710", text: "#efeaf6", muted: "rgba(232,230,240,.65)", accent: "#c8ff00", border: "rgba(255,255,255,.08)" };

function short(addr?: string) { return addr ? `${addr.slice(0,6)}\u2026${addr.slice(-4)}` : ""; }
function fmt(v: bigint | undefined, decimals = 18, digits = 4) {
  if (v === undefined) return "\u2014";
  const s = v.toString().padStart(decimals + 1, "0");
  const i = s.slice(0, -decimals);
  const f = s.slice(-decimals).slice(0, digits).replace(/0+$/, "");
  return f ? `${i}.${f}` : i;
}

function WalletPill() {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  if (isConnected) {
    return (
      <button onClick={() => disconnect()} style={{ padding: "10px 18px", borderRadius: 999, border: `1px solid ${S.border}`, background: "rgba(255,255,255,.04)", color: S.text, fontSize: ".85rem", cursor: "pointer" }}>
        {short(address)} \u00b7 Disconnect
      </button>
    );
  }
  const inj = connectors.find((c) => c.id === "injected") || connectors[0];
  return (
    <button disabled={!inj || isPending} onClick={() => inj && connect({ connector: inj })} style={{ padding: "10px 18px", borderRadius: 999, border: "none", background: S.accent, color: "#0a0710", fontSize: ".85rem", fontWeight: 600, cursor: inj ? "pointer" : "not-allowed" }}>
      {isPending ? "Connecting\u2026" : "Connect Wallet"}
    </button>
  );
}

export default function PortfolioPage() {
  const { address, isConnected, chainId } = useAccount();
  const { data: monBal } = useBalance({ address });

  return (
    <div style={{ background: S.bg, color: S.text, minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <SiteNav />
      <main style={{ maxWidth: 920, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: ".85rem", letterSpacing: ".25em", color: S.accent, marginBottom: ".5rem" }}>YOUR BAGS</div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(2.5rem,6vw,4rem)", letterSpacing: ".04em", margin: 0, lineHeight: 1.05 }}>PORTFOLIO</h1>
        <p style={{ color: S.muted, marginTop: ".75rem", maxWidth: 600, fontSize: ".95rem" }}>
          Read-only snapshot of your wallet on Monad. Keys never leave your wallet.
        </p>

        <div style={{ marginTop: "1.75rem", display: "flex", justifyContent: "flex-end" }}>
          <WalletPill />
        </div>

        {!isConnected ? (
          <div style={{ marginTop: "2rem", padding: "3rem 1.5rem", border: `1px dashed ${S.border}`, borderRadius: 18, textAlign: "center", background: "rgba(255,255,255,.02)" }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.6rem", letterSpacing: ".06em", marginBottom: ".5rem" }}>CONNECT YOUR WALLET</div>
            <div style={{ color: S.muted, fontSize: ".9rem" }}>We&rsquo;ll show your MON balance, PHUCK position, and staking accruals.</div>
          </div>
        ) : (
          <div style={{ marginTop: "1.75rem", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: ".75rem" }}>
            <Card label="WALLET" value={short(address)} mono />
            <Card label="NETWORK" value={chainId === 143 ? "Monad Mainnet" : `Chain ${chainId ?? "\u2014"}`} accent={chainId === 143} />
            <Card label="MON BALANCE" value={`${fmt(monBal?.value)} ${monBal?.symbol ?? "MON"}`} />
            <Card label="PHUCK BALANCE" value="see /swap" muted />
            <Card label="STAKED" value="see /staking" muted />
            <Card label="PREDICTIONS" value="see /predictions" muted />
          </div>
        )}

        <div style={{ marginTop: "2rem", padding: "1.25rem", border: `1px solid ${S.border}`, borderRadius: 14, background: "rgba(255,255,255,.02)" }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.1rem", letterSpacing: ".06em", marginBottom: ".5rem" }}>QUICK LINKS</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem" }}>
            {[["Buy on Swap","/swap"],["Stake PHUCK","/staking"],["Predictions","/predictions"],["Calculator","/staking/calculator"]].map(([l,h]) => (
              <a key={h} href={h} style={{ padding: "8px 16px", borderRadius: 999, border: `1px solid ${S.border}`, color: S.text, textDecoration: "none", fontSize: ".85rem", background: "rgba(255,255,255,.03)" }}>{l}</a>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function Card({ label, value, mono, accent, muted }: { label: string; value: string; mono?: boolean; accent?: boolean; muted?: boolean }) {
  return (
    <div style={{ border: `1px solid ${accent ? S.accent : S.border}`, borderRadius: 14, padding: "1.1rem", background: "rgba(255,255,255,.02)" }}>
      <div style={{ fontSize: ".7rem", letterSpacing: ".18em", color: S.muted, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: mono ? "ui-monospace,Menlo,monospace" : "'Bebas Neue',sans-serif", fontSize: mono ? ".95rem" : "1.4rem", color: muted ? S.muted : (accent ? S.accent : S.text), wordBreak: "break-all" }}>{value}</div>
    </div>
  );
}
