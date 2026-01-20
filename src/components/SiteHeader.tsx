"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "px-4 py-2 rounded-full text-sm transition",
        active ? "bg-white/15 text-white" : "bg-white/5 text-white/80 hover:bg-white/10",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="font-extrabold tracking-wide">PHUCKMC</div>
          <span className="hidden sm:inline text-xs text-white/50">
            Router + Staking
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/swap">Swap</NavLink>
          <NavLink href="/staking">Stake</NavLink>
          <NavLink href="/fees">Fees</NavLink>
        </nav>
      </div>
    </header>
  );
}
