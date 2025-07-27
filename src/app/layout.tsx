import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { TRPCReactProvider } from '@/lib/trpc/provider'
import { headers } from 'next/headers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PowerPulse - Your AI Personal Coach in 5 Minutes Daily',
  description: 'Transform your life with personalized daily audio coaching. AI-powered motivation tailored to your unique journey.',
  keywords: ['personal coaching', 'daily motivation', 'AI coach', 'fitness motivation', 'personal development'],
  authors: [{ name: 'PowerPulse' }],
  openGraph: {
    title: 'PowerPulse - Your AI Personal Coach',
    description: 'Transform your life with personalized daily audio coaching.',
    url: 'https://powerpulse.app',
    siteName: 'PowerPulse',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PowerPulse - Your AI Personal Coach',
    description: 'Transform your life with personalized daily audio coaching.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={inter.className}>
          <TRPCReactProvider headers={headers()}>
            {children}
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}