import './globals.css'
import type { Metadata } from 'next'
import { Playfair_Display, Lato } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'

// We load your brand fonts here
const playfair = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-serif',
  display: 'swap',
})

const lato = Lato({ 
  subsets: ['latin'], 
  weight: ['300', '400', '700'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Sensory Intelligence',
  description: 'Design for nervous system regulation.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${lato.variable} font-sans min-h-screen text-[#c9ccbb] antialiased`}>
        {/* We removed any 'bg-white' class here so the global CSS green takes over */}
        {children}
        <Analytics />
      </body>
    </html>
  )
}
