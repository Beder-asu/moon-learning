import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/components/auth-provider'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://moon-learn.vercel.app'),
  title: {
    default: 'Moon Learning - Master New Skills Online',
    template: '%s | Moon Learning',
  },
  description: 'Learn under the stars with expertly-crafted courses in chess, strategy, and more. Join Moon Learning to unlock premium video lessons and grow your skills.',
  keywords: ['online learning', 'chess courses', 'e-learning', 'video lessons', 'moon learning', 'skill development'],
  authors: [{ name: 'Moon Learning' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://moon-learn.vercel.app',
    siteName: 'Moon Learning',
    title: 'Moon Learning - Master New Skills Online',
    description: 'Learn under the stars with expertly-crafted courses. Join Moon Learning to unlock premium video lessons.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Moon Learning - Master New Skills Online',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Moon Learning - Master New Skills Online',
    description: 'Learn under the stars with expertly-crafted courses. Join Moon Learning.',
    images: ['/images/og-image.png'],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
