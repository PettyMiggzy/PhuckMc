"use client";
import React from "react";
import SiteNav from "@/components/SiteNav";

const S = { bg: "#0a0710", text: "#efeaf6", muted: "rgba(232,230,240,.65)", accent: "#c8ff00", border: "rgba(255,255,255,.08)" };

const LINES = [
  "WE DON'T CHASE PUMPS.",
  "WE BUILD MACHINES.",
  "PHUCK THE NOISE.",
  "HOLD ANYWAY.",
  "CALM MONEY. LOUD MEMES.",
  "BUY THE FLINCH.",
  "NOT FINANCIAL ADVICE. PHUCK THE CHART.",
];

export default function MemesPage() {
  const [line, setLine] = React.useState(LINES[0]);
  const [bg, setBg] = React.useState("#0a0710");
  const [fg, setFg] = React.useState(S.accent);
  const [size, setSize] = React.useState(7);
  const ref = React.useRef<HTMLDivElement>(null);

  function randLine() { setLine(LINES[Math.floor(Math.random() * LINES.length)]); }
  function randPalette() {
    const palettes = [["#0a0710", "#c8ff00"], ["#c8ff00", "#0a0710"], ["#160028", "#ff5cf7"], ["#001a14", "#00ffd1"], ["#1a0000", "#ff5e3a"], ["#fff", "#0a0710"]];
    const p = palettes[Math.floor(Math.random() * palettes.length)];
    setBg(p[0]); setFg(p[1]);
  }
  async function copyText() { try { await navigator.clipboard.writeText(line); } catch {} }

  return (
    <div style={{ background: S.bg, color: S.text, minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <SiteNav />
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: ".85rem", letterSpacing: ".25em", color: S.accent, marginBottom: ".5rem" }}>PROPAGANDA OFFICE</div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(2.5rem,6vw,4rem)", letterSpacing: ".04em", margin: 0, lineHeight: 1.05 }}>MEMES</h1>
        <p style={{ color: S.muted, marginTop: ".75rem", maxWidth: 640, fontSize: ".95rem" }}>
          Built-in shitpost generator. Pick a line, smash a palette, screenshot, post. The marketing team is you.
        </p>

        <div ref={ref} style={{ marginTop: "1.75rem", aspectRatio: "16 / 9", borderRadius: 24, border: `1px solid ${S.border}`, background: bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", overflow: "hidden", textAlign: "center" }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", color: fg, fontSize: `clamp(1.5rem, ${size}vw, 6rem)`, letterSpacing: ".04em", lineHeight: 1, textShadow: `0 0 40px ${fg}33` }}>{line}</div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", marginTop: "1rem" }}>
          <button onClick={randLine} style={btn(S)}>Random line</button>
          <button onClick={randPalette} style={btn(S)}>Random palette</button>
          <button onClick={() => setSize((s) => Math.min(s + 1, 12))} style={btn(S)}>Bigger</button>
          <button onClick={() => setSize((s) => Math.max(s - 1, 3))} style={btn(S)}>Smaller</button>
          <button onClick={copyText} style={btn(S)}>Copy text</button>
        </div>

        <textarea
          value={line}
          onChange={(e) => setLine(e.target.value.toUpperCase().slice(0, 120))}
          rows={2}
          style={{ width: "100%", marginTop: "1rem", padding: "1rem", borderRadius: 12, border: `1px solid ${S.border}`, background: "rgba(255,255,255,.03)", color: S.text, fontSize: "1rem", fontFamily: "inherit", resize: "vertical" }}
        />

        <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: ".5rem" }}>
          {LINES.map((l) => (
            <button key={l} onClick={() => setLine(l)} style={{ ...btn(S), textAlign: "left", padding: ".75rem 1rem", fontSize: ".82rem", whiteSpace: "normal", lineHeight: 1.3 }}>
              {l}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

function btn(S: { border: string; text: string }) {
  return { padding: "10px 18px", borderRadius: 999, border: `1px solid ${S.border}`, background: "rgba(255,255,255,.04)", color: S.text, fontSize: ".85rem", cursor: "pointer", fontFamily: "inherit" } as const;
}
