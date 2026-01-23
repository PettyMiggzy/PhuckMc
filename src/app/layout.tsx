import "./globals.css";
import type { Metadata } from "next";
import Providers from "@/providers/Providers";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "PHUCKMC",
  description: "Router + Staking",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <Providers>
          <SiteHeader />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
