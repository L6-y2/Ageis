'use client'

import Link from 'next/link'
import { Flame, ArrowUpLeft, CheckSquare, Sparkles } from 'lucide-react'
import { useAvatars } from '@/lib/useAvatars'

interface Props {
  today: string
  name: string
  streak: number
}

export default function HomeHeader({ today, name, streak }: Props) {
  const { userAvatar } = useAvatars()

  return (
    <header className="mb-6">
      {/* Top Folio Date & Quick Context Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-[rgba(236,238,242,0.07)] text-[11px] text-[#7D8594]">
        <div className="flex items-center gap-2.5">
          <span
            dir="ltr"
            className="font-tabular tracking-[0.14em] uppercase text-[#D4AF37] font-semibold"
          >
            AEGIS // STUDY BRIEF
          </span>
          <span className="text-[#3A4050]" aria-hidden="true">/</span>
          <span className="text-[#9CA3AF] font-medium">{today}</span>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-1.5 text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors py-1"
          >
            <CheckSquare size={13} className="text-[#4EA87E]" />
            <span>سجل المهام والتكرار</span>
          </Link>
          <span className="text-[#2B303E]" aria-hidden="true">|</span>
          <Link
            href="/chat"
            className="inline-flex items-center gap-1.5 text-[#9CA3AF] hover:text-[#D4AF37] transition-colors py-1"
          >
            <Sparkles size={13} className="text-[#D4AF37]" />
            <span>استشارة إيجيس</span>
          </Link>
        </div>
      </div>

      {/* Main Editorial Masthead Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <Link
            href="/profile"
            aria-label={`الملف الشخصي: ${name || 'عمر'}`}
            className="relative w-12 h-12 sm:w-13 sm:h-13 rounded-[10px] bg-[#12141C] border border-[rgba(212,175,55,0.34)] hover:border-[#D4AF37] overflow-hidden shrink-0 transition-colors"
          >
            <img
              src={userAvatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          </Link>

          <div className="min-w-0">
            <span className="block text-[11px] text-[#9CA3AF] font-medium">
              غرفة القيادة الدراسية
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h1 className="font-editorial text-2xl sm:text-[28px] font-bold text-[#ECEEF2] leading-tight truncate">
                مرحباً، {name || 'عمر'}
              </h1>
              <Link
                href="/profile"
                className="hidden sm:inline-flex items-center gap-0.5 text-[11px] text-[#7D8594] hover:text-[#D4AF37] transition-colors"
              >
                <span>الملف</span>
                <ArrowUpLeft size={12} />
              </Link>
            </div>
          </div>
        </div>

        {/* Minimalist Streak Counter */}
        <div className="flex items-center gap-2.5 pr-3.5 pl-4 py-2 bg-[#12141C] border border-[rgba(236,238,242,0.09)] rounded-[10px] shrink-0 min-h-[44px]">
          <Flame size={16} strokeWidth={1.75} className="text-[#C88A36]" />
          <div className="flex items-baseline gap-1.5">
            <span dir="ltr" className="text-base font-bold text-[#ECEEF2] font-tabular">
              {streak}
            </span>
            <span className="text-[11px] text-[#9CA3AF]">يوم التزام</span>
          </div>
        </div>
      </div>
    </header>
  )
}
