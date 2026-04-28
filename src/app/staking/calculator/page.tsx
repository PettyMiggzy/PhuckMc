"use client";
import React from "react";
import SiteNav from "@/components/SiteNav";

const S = { bg: "#0a0710", text: "#efeaf6", muted: "rgba(232,230,240,.65)", accent: "#c8ff00", border: "rgba(255,255,255,.08)" };

function compound(principal: number, apr: number, days: number, periodsPerYear: number) {
  const t = days / 365;
  const r = apr / 100;
  const n = periodsPerYear;
  return principal * Math.pow(1 + r / n, n * t);
}

export default function CalculatorPage() {
  const [amount, setAmount] = React.useState("10000");
  const [apr, setApr] = React.useState("42");
  const [days, setDays] = React.useState("180");
  const [price, setPrice] = React.useState("0.00042");
  const [period, setPeriod] = React.useState("daily");

  const principal = Math.max(0, Number(amount) || 0);
  const aprN = Math.max(0, Number(apr) || 0);
  const daysN = Math.max(0, Number(days) || 0);
  const priceN = Math.max(0, Number(price) || 0);
  const periods = period === "continuous" ? 365 * 24 : period === "daily" ? 365 : period === "weekly" ? 52 : period === "monthly" ? 12 : 1;
  const final = compound(principal, aprN, daysN, periods);
  const profit = final - principal;
  const usdProfit = profit * priceN;
  const usdFinal = final * priceN;
  const dailyEarn = (final - principal) / Math.max(daysN, 1);

  return (
    <div style={{ background: S.bg, color: S.text, minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <SiteNav />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: ".85rem", letterSpacing: ".25em", color: S.accent, marginBottom: ".5rem" }}>STAKING TOOLS</div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(2.5rem,6vw,4rem)", letterSpacing: ".04em", margin: 0, lineHeight: 1.05 }}>CALCULATOR</h1>
        <p style={{ color: S.muted, marginTop: ".75rem", maxWidth: 640, fontSize: ".95rem" }}>
          Estimate compound returns on PHUCK staking. APRs change &mdash; this is a model, not a promise. Set your own assumptions.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: ".75rem", marginTop: "1.75rem" }}>
          <Field label="PRINCIPAL (PHUCK)" value={amount} onChange={setAmount} />
          <Field label="APR %" value={apr} onChange={setApr} />
          <Field label="DAYS" value={days} onChange={setDays} />
          <Field label="PHUCK / USD" value={price} onChange={setPrice} />
          <div style={{ border: `1px solid ${S.border}`, borderRadius: 14, padding: "1rem", background: "rgba(255,255,255,.02)" }}>
            <div style={{ fontSize: ".7rem", letterSpacing: ".18em", color: S.muted, marginBottom: 8 }}>COMPOUND</div>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 10, border: `1px solid ${S.border}`, background: "rgba(255,255,255,.04)", color: S.text, fontSize: ".9rem" }}>
              <option value="yearly">Yearly</option>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
              <option value="continuous">Hourly</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: ".75rem", marginTop: "1.75rem" }}>
          <Out label="FINAL BALANCE" value={`${final.toLocaleString(undefined, { maximumFractionDigits: 2 })} PHUCK`} accent />
          <Out label="PROFIT" value={`+${profit.toLocaleString(undefined, { maximumFractionDigits: 2 })} PHUCK`} />
          <Out label="VALUE @ PRICE" value={`$${usdFinal.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
          <Out label="USD PROFIT" value={`+$${usdProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
          <Out label="AVG / DAY" value={`${dailyEarn.toLocaleString(undefined, { maximumFractionDigits: 2 })} PHUCK`} />
          <Out label="EFFECTIVE APY" value={`${(((Math.pow(1 + aprN/100/periods, periods) - 1) * 100)).toFixed(2)}%`} />
        </div>

        <div style={{ marginTop: "2rem", padding: "1.25rem", border: `1px solid ${S.border}`, borderRadius: 14, background: "rgba(255,255,255,.02)", color: S.muted, fontSize: ".82rem", lineHeight: 1.6 }}>
          <strong style={{ color: S.text }}>Heads up:</strong> rewards depend on emissions, lockups and pool size. Plug realistic APRs &mdash; not the inflated number from the dashboard on day one. Auto-compounding assumes you actually re-stake; manual claims will be lower.
        </div>
      </main>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label style={{ display: "block", border: `1px solid ${S.border}`, borderRadius: 14, padding: "1rem", background: "rgba(255,255,255,.02)" }}>
      <div style={{ fontSize: ".7rem", letterSpacing: ".18em", color: S.muted, marginBottom: 8 }}>{label}</div>
      <input value={value} onChange={(e) => onChange(e.target.value)} inputMode="decimal" style={{ width: "100%", border: "none", background: "transparent", color: S.text, fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.4rem", outline: "none" }} />
    </label>
  );
}
function Out({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ border: `1px solid ${accent ? S.accent : S.border}`, borderRadius: 14, padding: "1rem", background: accent ? "rgba(200,255,0,0.06)" : "rgba(255,255,255,.02)" }}>
      <div style={{ fontSize: ".7rem", letterSpacing: ".18em", color: S.muted, marginBottom: 8 }}>{label}</div>
      <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.4rem", color: accent ? S.accent : S.text }}>{value}</div>
    </div>
  );
}
