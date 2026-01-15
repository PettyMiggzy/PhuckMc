import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PHUCKMC",
  description: "calm money • loud memes",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="navbar">
          <div className="container">
            <div className="nav-inner">
              <div className="brand">
                {/* Put your logo at /public/logo.png (or change this) */}
                <img src="/logo.png" alt="PHUCKMC" />
                <div className="brand-title">
                  <div className="name">PHUCKMC</div>
                  <div className="tag">calm money • loud memes</div>
                </div>
              </div>

              <div className="nav-links">
                <a className="pill" href="/">PHUCK</a>
                <a className="pill" href="/swap">Swap</a>
                <a className="pill" href="/staking">Staking</a>
                <a className="pill" href="https://t.me/YOUR_TELEGRAM" target="_blank" rel="noreferrer">
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </div>

        {children}
      </body>
    </html>
  );
}
