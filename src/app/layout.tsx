import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
