import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Anton, Caveat, Space_Grotesk, Space_Mono } from 'next/font/google'
import './globals.css'

const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton', display: 'swap' })
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' })
const mono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-space-mono', display: 'swap' })
const caveat = Caveat({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-caveat', display: 'swap' })

export const metadata: Metadata = {
  title: 'Twenty-Six — A Birthday Journey for Hrushikesh Behera',
  description:
    'A cinematic five-chapter birthday experience: unseal the letter, ignite the launch, watch the burst, blow out the candle.',
  generator: 'v0.app',
  openGraph: {
    title: 'Twenty-Six — A Birthday Journey for Hrushikesh Behera',
    description: 'Unseal the letter. Ignite the launch. Blow out the candle.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FBF7F0',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`bg-paper ${anton.variable} ${grotesk.variable} ${mono.variable} ${caveat.variable}`}
    >
      <body className="bg-paper text-ink antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
