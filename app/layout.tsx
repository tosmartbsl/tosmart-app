import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'
import './landing.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Tosmart App | Belanja tanpa drama, transaksi tanpa ribet',
  description: 'Tosmart membantu operasional toko agar waktumu lebih banyak untuk melayani pelanggan, bukan mengurus transaksi yang rumit.',
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
      <body className={`${poppins.variable} antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
