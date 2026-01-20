import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import SiteHeader from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'PHUCKMC',
  description: 'PHUCKMC Router + Staking',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteHeader />
          {children}
        </Providers>
      </body>
    </html>
  )
}
