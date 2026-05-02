"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS: [string, string][] = [
  ["Home", "/"],
  ["Swap", "/swap"],
  ["Staking", "/staking"],
  ["Predictions", "/predictions"],
  ["Play", "/play"],
  ["Buybacks", "/buybacks"],
  ["Portfolio", "/portfolio"],
  ["Vault", "/vault"],
  ["Memes", "/memes"],
];

const S = {
  bg: "#0a0710",
  text: "#efeaf6",
  muted: "rgba(232,230,240,.65)",
  accent: "#c8ff00",
  border: "rgba(255,255,255,.08)",
};

export default function SiteNav() {
  const pathname = usePathname() || "/";
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(6,5,14,.92)",
        backdropFilter: "blur(20px)",
        padding: "0 2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        borderBottom: `1px solid ${S.border}`,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <img src="/logo.png" alt="PHUCKMC" style={{ width: 34, height: 34, borderRadius: 9, objectFit: "cover", border: `1px solid ${S.border}` }} />
        <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.4rem", letterSpacing: ".06em", color: S.text }}>
          PHUCK<span style={{ color: S.accent }}>MC</span>
        </span>
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {NAV_LINKS.map(([label, href]) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                padding: "7px 14px",
                borderRadius: 999,
                border: `1px solid ${active ? S.accent : S.border}`,
                background: active ? "rgba(200,255,0,0.1)" : "rgba(255,255,255,0.03)",
                fontSize: ".82rem",
                fontWeight: 500,
                color: active ? S.accent : S.text,
                textDecoration: "none",
                transition: "all .15s",
              }}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
