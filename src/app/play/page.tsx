"use client";
import React from "react";
import SiteNav from "@/components/SiteNav";

const S = {
  bg: "#0a0710",
  text: "#efeaf6",
  muted: "rgba(232,230,240,.65)",
  accent: "#c8ff00",
  border: "rgba(255,255,255,.08)",
};

type Pop = { id: number; x: number; y: number; v: number };

export default function PlayPage() {
  const [score, setScore] = React.useState(0);
  const [combo, setCombo] = React.useState(0);
  const [best, setBest] = React.useState(0);
  const [pops, setPops] = React.useState<Pop[]>([]);
  const [time, setTime] = React.useState(30);
  const [running, setRunning] = React.useState(false);
  const lastClick = React.useRef<number>(0);
  const popId = React.useRef(0);

  React.useEffect(() => {
    try {
      const b = Number(localStorage.getItem("phuckmc_play_best") || "0");
      if (!Number.isNaN(b)) setBest(b);
    } catch {}
  }, []);

  React.useEffect(() => {
    if (!running) return;
    if (time <= 0) {
      setRunning(false);
      setBest((b) => {
        const nb = Math.max(b, score);
        try { localStorage.setItem("phuckmc_play_best", String(nb)); } catch {}
        return nb;
      });
      return;
    }
    const t = setTimeout(() => setTime((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [running, time, score]);

  function start() {
    setScore(0); setCombo(0); setTime(30); setRunning(true); lastClick.current = 0;
  }

  function onTap(e: React.MouseEvent<HTMLDivElement>) {
    if (!running) return;
    const now = Date.now();
    const dt = now - lastClick.current;
    lastClick.current = now;
    const newCombo = dt < 600 ? combo + 1 : 1;
    setCombo(newCombo);
    const mult = 1 + Math.floor(newCombo / 5);
    const v = mult;
    setScore((s) => s + v);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++popId.current;
    setPops((p) => [...p, { id, x, y, v }]);
    setTimeout(() => setPops((p) => p.filter((q) => q.id !== id)), 700);
  }

  return (
    <div style={{ background: S.bg, color: S.text, minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <SiteNav />
      <main style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: ".85rem", letterSpacing: ".25em", color: S.accent, marginBottom: ".5rem" }}>ARCADE</div>
        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(2.5rem,6vw,4rem)", letterSpacing: ".04em", margin: 0, lineHeight: 1.05 }}>PHUCK THE CHART</h1>
        <p style={{ color: S.muted, marginTop: ".75rem", fontSize: ".95rem", maxWidth: 600 }}>
          30 seconds. Tap as fast as you can. Chain taps under 600ms to build combo &mdash; every 5 in a row stacks a multiplier. Beat your high score and screenshot it.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: ".75rem", marginTop: "1.75rem" }}>
          {[
            ["SCORE", String(score)],
            ["COMBO", `x${1 + Math.floor(combo / 5)}`],
            ["TIME", `${time}s`],
            ["BEST", String(best)],
          ].map(([k, v]) => (
            <div key={k} style={{ border: `1px solid ${S.border}`, borderRadius: 14, padding: "1rem", background: "rgba(255,255,255,.02)" }}>
              <div style={{ fontSize: ".7rem", letterSpacing: ".18em", color: S.muted, marginBottom: 6 }}>{k}</div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.6rem", color: k === "COMBO" && combo >= 5 ? S.accent : S.text }}>{v}</div>
            </div>
          ))}
        </div>

        <div
          onClick={onTap}
          style={{
            marginTop: "1.5rem",
            position: "relative",
            height: 360,
            borderRadius: 24,
            border: `1px solid ${S.border}`,
            background: running
              ? "radial-gradient(circle at 50% 50%, rgba(200,255,0,.08), rgba(255,255,255,.02))"
              : "rgba(255,255,255,.02)",
            cursor: running ? "crosshair" : "default",
            overflow: "hidden",
            userSelect: "none",
            transition: "background .3s",
          }}
        >
          {!running && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "2rem", letterSpacing: ".08em" }}>
                {time === 0 ? `FINAL: ${score}` : "READY?"}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); start(); }}
                style={{
                  padding: "14px 32px",
                  borderRadius: 999,
                  border: "none",
                  background: S.accent,
                  color: "#0a0710",
                  fontFamily: "'Bebas Neue',sans-serif",
                  fontSize: "1.2rem",
                  letterSpacing: ".1em",
                  cursor: "pointer",
                }}
              >
                {time === 0 ? "PLAY AGAIN" : "START"}
              </button>
            </div>
          )}
          {pops.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                transform: "translate(-50%,-50%)",
                color: S.accent,
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: `${1.4 + p.v * 0.15}rem`,
                pointerEvents: "none",
                animation: "phuckPop .7s ease-out forwards",
              }}
            >
              +{p.v}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "2rem", padding: "1.25rem", border: `1px solid ${S.border}`, borderRadius: 14, background: "rgba(255,255,255,.02)" }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.1rem", letterSpacing: ".06em", marginBottom: ".5rem" }}>HOW IT WORKS</div>
          <div style={{ color: S.muted, fontSize: ".9rem", lineHeight: 1.6 }}>
            Tap the field as fast as possible for 30 seconds. Consecutive taps inside 600ms stack the combo &mdash; every 5 hits adds +1 to the multiplier. High score is saved locally. No wallet, no gas, no cap table.
          </div>
        </div>
      </main>
      <style>{`@keyframes phuckPop { 0%{opacity:1;transform:translate(-50%,-50%) scale(.6)} 50%{transform:translate(-50%,-90%) scale(1.1)} 100%{opacity:0;transform:translate(-50%,-130%) scale(.9)} }`}</style>
    </div>
  );
}
