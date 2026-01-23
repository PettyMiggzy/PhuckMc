"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useConnect, useDisconnect } from "wagmi";

function shortAddr(a?: string) {
  if (!a) return "";
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();

  // IMPORTANT: explicitly choose the injected connector (MetaMask)
  const injectedConnector =
    connectors.find((c) => c.id === "injected") ?? connectors[0];

  const pill =
    "px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition";
  const pillActive =
    "px-4 py-2 rounded-full bg-white/10 border border-white/15 text-white";

  const navLink = (href: string, label: string) => (
    <Link
      href={href}
      className={pathname === href ? pillActive : pill}
      prefetch={false}
    >
      {label}
    </Link>
  );

  return (
    <header className="w-full border-b border-white/10 bg-black/30 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="font-semibold tracking-wide">PHUCKMC</div>
          <div className="text-white/50 text-sm">
            Router + Staking {chainId ? `• ${chainId}` : ""}
          </div>
        </div>

        <nav className="flex items-center gap-2">
          {navLink("/", "Home")}
          {navLink("/swap", "Swap")}
          {navLink("/staking", "Stake")}
          {navLink("/predictions", "Predictions")}

          {!isConnected ? (
            <button
              type="button"
              className={pill}
              onClick={() => {
                if (!injectedConnector) return;
                connect({ connector: injectedConnector });
              }}
              disabled={isPending || !injectedConnector}
              title={!injectedConnector ? "No wallet connector found" : ""}
            >
              {isPending ? "Connecting…" : "Connect"}
            </button>
          ) : (
            <button type="button" className={pill} onClick={() => disconnect()}>
              {shortAddr(address)}
            </button>
          )}
        </nav>
      </div>

      {/* Optional tiny error line (helps you debug fast) */}
      {error ? (
        <div className="mx-auto max-w-6xl px-4 pb-3 text-xs text-red-300">
          {error.message}
        </div>
      ) : null}
    </header>
  );
}
