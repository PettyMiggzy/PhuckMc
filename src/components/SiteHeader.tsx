import Image from "next/image";
import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="w-full border-b border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="PHUCKMC"
            width={40}
            height={40}
            priority
          />
          <div>
            <div className="font-semibold text-white">PHUCKMC</div>
            <div className="text-xs text-white/60">
              calm money • loud memes
            </div>
          </div>
        </div>

        {/* Right: Nav */}
        <nav className="flex items-center gap-3">
          <span className="px-3 py-1 text-sm rounded-full border border-white/10 text-white/70">
            PHUCK Swap
          </span>
          <span className="px-3 py-1 text-sm rounded-full border border-white/10 text-white/70">
            Staking
          </span>
          <Link
            href="https://nad.fun/tokens/0x148a3a811979e5BF8366FC279B2d67742Fe17777"
            target="_blank"
            className="px-4 py-1.5 text-sm rounded-full bg-purple-600 text-white font-medium"
          >
            Buy
          </Link>
          <Link
            href="https://t.me/PhuckMc"
            target="_blank"
            className="px-4 py-1.5 text-sm rounded-full border border-white/20 text-white"
          >
            Telegram
          </Link>
        </nav>

      </div>
    </header>
  );
}
