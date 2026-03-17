'use client'

import './globals.css'
import Providers from '@/providers/Providers'
import SiteHeader from '@/components/SiteHeader'
import { usePathname } from 'next/navigation'

function InnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showHeader = pathname !== '/'
  return (
    <>
      {showHeader && <SiteHeader />}
      <main>{children}</main>
    </>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>PHUCKMC — Calm Money. Loud Memes.</title>
        <meta name="description" content="Multi-chain meme token on Monad and Solana. Buybacks, staking, predictions." />
        <meta property="og:title" content="PHUCKMC" />
        <meta property="og:image" content="/banner.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/banner.png" />
      </head>
      <body className="min-h-screen bg-black text-white">
        <Providers>
          <InnerLayout>{children}</InnerLayout>
        </Providers>
      </body>
    </html>
  )
}
