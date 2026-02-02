import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Sentient Home',
  description: 'NeuroDesign™ Sensory Intelligence for Everyday Living',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#1b270e] text-[#c9ccbb] font-sans">
        {children}
      </body>
    </html>
  )
}
