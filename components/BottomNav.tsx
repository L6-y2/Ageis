'use client'

import { useState, useEffect } from 'react'
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
  const [timerActive, setTimerActive] = useState(false)

  // Check if a Pomodoro timer session is actively running
  useEffect(() => {
    const checkTimer = () => {
      try {
        const raw = localStorage.getItem('aegis_pomodoro_state')
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed.running && parsed.targetEndTime && parsed.targetEndTime > Date.now()) {
            setTimerActive(true)
            return
          }
        }
        setTimerActive(false)
      } catch {
        setTimerActive(false)
      }
    }

    checkTimer()
    const interval = setInterval(checkTimer, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0e1217]/90 backdrop-blur-xl border-t border-slate-800/80 shadow-[0_-8px_25px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-around px-1 py-2 max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          const isTimerItem = href === '/focus'

          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-xl transition-all duration-300 relative ${
                active
                  ? 'text-emerald-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all relative ${
                active ? 'bg-emerald-500/15 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : ''
              }`}>
                <Icon size={20} />
                {isTimerItem && timerActive && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  </span>
                )}
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
