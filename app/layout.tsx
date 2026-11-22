import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tosmart | POS & Manajemen Ritel',
  description: 'Tosmart membantu kasir dan pemilik toko mengelola transaksi dan operasional harian dengan lebih sederhana.',
  generator: 'v0.app',
  icons: {
    icon: '/tosmart-full.png',
    apple: '/tosmart-full.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#4C3525',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" data-scroll-behavior="smooth">
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
