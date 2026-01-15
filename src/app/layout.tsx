import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  title: "PHUCKMC",
  description: "Calm coin. Loud character.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
