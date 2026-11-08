import type { Metadata, Viewport } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
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
  themeColor: '#060913',
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
    <html lang="ar" dir="rtl" className="dark">
      <body className={`${cairo.variable} font-sans bg-[#060913] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200`}>
        {/* Ambient Glow Atmosphere */}
        <div className="ambient-bg">
          <div className="ambient-blob-1" />
          <div className="ambient-blob-2" />
          <div className="ambient-blob-3" />
        </div>

        {/* Responsive Content Shell - Expanded for Desktop and Mobile */}
        <div className="relative z-10 w-full min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
