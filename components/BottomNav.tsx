'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  BookOpen,
  CheckSquare,
  Timer,
  Sparkles,
  User,
  Shield,
  Award,
} from 'lucide-react'

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
    <nav
      aria-label="التنقل الرئيسي"
      className="fixed bottom-0 left-0 right-0 z-30 bg-[#0A0B0E]/92 backdrop-blur-md border-t border-[rgba(236,238,242,0.08)] shadow-[0_-8px_24px_rgba(0,0,0,0.6)] lg:top-0 lg:right-0 lg:left-auto lg:bottom-0 lg:w-60 lg:border-t-0 lg:border-l lg:border-[rgba(236,238,242,0.08)] lg:bg-[#0D0F15] lg:backdrop-blur-none lg:shadow-none lg:flex lg:flex-col lg:justify-between"
    >
      {/* Desktop Brand Wordmark Header (RTL Right Rail) */}
      <div className="hidden lg:flex items-center gap-3 px-5 pt-7 pb-5 border-b border-[rgba(236,238,242,0.07)]">
        <div className="w-9 h-9 rounded-[10px] bg-[#191C25] border border-[rgba(212,175,55,0.35)] flex items-center justify-center text-[#D4AF37]">
          <Shield size={18} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <span
            dir="ltr"
            className="block font-editorial text-sm font-semibold tracking-[0.14em] text-[#ECEEF2] uppercase"
          >
            AEGIS
          </span>
          <span className="block text-[11px] text-[#7D8594]">مكتبة الدراسة الذكية</span>
        </div>
      </div>

      {/* Navigation Links (Bottom Bar on Mobile/Tablet, Vertical Stack on Desktop) */}
      <div className="flex items-center justify-around px-1.5 py-1.5 max-w-xl mx-auto pb-[max(0.375rem,env(safe-area-inset-bottom))] lg:flex-col lg:items-stretch lg:justify-start lg:gap-1 lg:px-3 lg:py-5 lg:max-w-none lg:mx-0 lg:flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          const isTimerItem = href === '/focus'

          return (
            <Link
              key={href}
              href={href}
              prefetch={true}
              aria-current={active ? 'page' : undefined}
              className={`group relative flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-3 min-h-[44px] min-w-[44px] px-2.5 lg:px-3.5 py-1.5 lg:py-2.5 rounded-[10px] transition-colors duration-150 ${
                active
                  ? 'text-[#ECEEF2] bg-[rgba(212,175,55,0.10)] border border-[rgba(212,175,55,0.28)] font-semibold'
                  : 'text-[#9CA3AF] hover:text-[#ECEEF2] hover:bg-[rgba(236,238,242,0.04)] border border-transparent'
              }`}
            >
              {/* Active Vertical Accent Bar on Desktop RTL */}
              {active && (
                <span
                  aria-hidden="true"
                  className="hidden lg:block absolute right-0 top-2 bottom-2 w-0.5 rounded-full bg-[#D4AF37]"
                />
              )}

              <div className="relative flex items-center justify-center">
                <Icon
                  size={19}
                  strokeWidth={active ? 2 : 1.75}
                  className={active ? 'text-[#D4AF37]' : 'text-[#7D8594] group-hover:text-[#ECEEF2] transition-colors'}
                />
                {isTimerItem && timerActive && (
                  <span
                    className="absolute -top-1 -left-1 w-2 h-2 rounded-full bg-[#4EA87E] ring-2 ring-[#0A0B0E]"
                    title="جلسة تركيز نشطة"
                  />
                )}
              </div>

              <span className="text-[11px] lg:text-[13px] tracking-normal whitespace-nowrap">
                {label}
              </span>

              {isTimerItem && timerActive && (
                <span className="hidden lg:inline-flex mr-auto text-[10px] font-tabular px-1.5 py-0.5 rounded bg-[rgba(78,168,126,0.14)] text-[#4EA87E] border border-[rgba(78,168,126,0.3)]">
                  نشط
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Desktop Secondary Shortcut to Distinction Hall (/rpg) */}
      <div className="hidden lg:block px-3 pb-5 pt-3 border-t border-[rgba(236,238,242,0.07)]">
        <Link
          href="/rpg"
          aria-current={pathname === '/rpg' ? 'page' : undefined}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] min-h-[44px] text-[13px] transition-colors duration-150 border ${
            pathname === '/rpg'
              ? 'text-[#ECEEF2] bg-[rgba(212,175,55,0.10)] border-[rgba(212,175,55,0.28)] font-semibold'
              : 'text-[#9CA3AF] hover:text-[#ECEEF2] hover:bg-[rgba(236,238,242,0.04)] border-transparent'
          }`}
        >
          <Award
            size={18}
            strokeWidth={1.75}
            className={pathname === '/rpg' ? 'text-[#D4AF37]' : 'text-[#D4AF37]/80'}
          />
          <span>قاعة الأوسمة والرتب</span>
        </Link>
      </div>
    </nav>
  )
}
