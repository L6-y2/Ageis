'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, CheckSquare, Timer, Sparkles, User } from 'lucide-react'

const navItems = [
  { href: '/', icon: Home, label: 'الرئيسية' },
  { href: '/curriculum', icon: BookOpen, label: 'المنهج' },
  { href: '/tasks', icon: CheckSquare, label: 'المهام' },
  { href: '/focus', icon: Timer, label: 'التركيز' },
  { href: '/chat', icon: Sparkles, label: 'إيجيس' },
  { href: '/profile', icon: User, label: 'حسابي' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0e1217]/90 backdrop-blur-xl border-t border-slate-800/80 shadow-[0_-8px_25px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-around px-1 py-2 max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all duration-300 relative ${
                active
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${
                active ? 'bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : ''
              }`}>
                <Icon size={20} />
              </div>
              <span className="text-[10px] tracking-tight">{label}</span>
              {active && (
                <span className="absolute -bottom-1 w-4 h-0.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
