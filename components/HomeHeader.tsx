'use client'

import Link from 'next/link'
import { Flame } from 'lucide-react'
import { useAvatars } from '@/lib/useAvatars'

interface Props {
  today: string
  name: string
  streak: number
}

export default function HomeHeader({ today, name, streak }: Props) {
  const { userAvatar } = useAvatars()

  return (
    <header className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/60">
      <div className="flex items-center gap-3">
        <Link href="/profile" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center overflow-hidden group-hover:border-emerald-400 transition-all shadow-sm">
            <img
              src={userAvatar}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">{today}</span>
            </div>
            <h1 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
              {name || 'عمر'}
            </h1>
          </div>
        </Link>
      </div>

      {/* Streak Counter Pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
        <Flame size={16} className="text-orange-400 fill-orange-400" />
        <span className="text-xs font-black text-orange-400 font-mono">
          {streak}
        </span>
        <span className="text-[10px] text-slate-400">أيام متتالية</span>
      </div>
    </header>
  )
}
