import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PHUCKMC",
  description: "No expectations. Just revenue.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
