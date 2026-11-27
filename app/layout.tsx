import type { Metadata, Viewport } from 'next'
import {
  Noto_Sans_Arabic,
  Noto_Naskh_Arabic,
  Newsreader,
  Inter,
  JetBrains_Mono,
} from 'next/font/google'
import './globals.css'

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans-ar',
  display: 'swap',
})

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['500', '600', '700'],
  variable: '--font-display-ar',
  display: 'swap',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display-en',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans-en',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono-tabular',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'إيجيس | Aegis — نظام إدارة المذاكرة والـ RPG الذكي',
  description: 'منصة مذاكرة ذكية مدعومة بالذكاء الاصطناعي والتكرار المتباعد ونظام الـ Gamification',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0B0E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`dark ${notoSansArabic.variable} ${notoNaskhArabic.variable} ${newsreader.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-[#0A0B0E] text-[#ECEEF2] antialiased selection:bg-[#D4AF37]/25 selection:text-[#ECEEF2]">
        {/* Subtle Academic Obsidian Atmosphere */}
        <div className="ambient-bg" aria-hidden="true" />

        {/* Responsive Content Shell */}
        <div className="relative z-10 w-full min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
