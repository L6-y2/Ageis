'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Sparkles, Trophy, ChevronLeft, Zap } from 'lucide-react'

interface XPBarProps {
  totalXp: number
  level: number
  xpToNext: number
  percentage: number
  levelTitle?: string
}

export default function XPBar({
  totalXp,
  level,
  xpToNext,
  percentage,
  levelTitle,
}: XPBarProps) {
  const levelLabels: Record<number, string> = {
    1: 'مبتدئ 🛡️',
    2: 'متعلم 📘',
    3: 'متقدم ⚔️',
    4: 'محترف ⚡',
    5: 'خبير 🔮',
    6: 'أسطورة 👑',
    7: 'نخبة 🌟',
    8: 'عبقري 🌌',
  }
  const currentTitle = levelTitle || levelLabels[level] || `المستوى ${level}`

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-5 relative overflow-hidden border border-slate-800/80 shadow-2xl">
      {/* Background flare */}
      <div className="absolute -top-12 -left-12 w-40 h-40 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/25">
            <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center">
              <span className="text-xs font-black text-indigo-300">Lvl.{level}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-black text-slate-100 text-base">{currentTitle}</h2>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                RPG
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Zap size={11} className="text-amber-400 fill-amber-400" />
              <span>{`${totalXp.toLocaleString('ar-EG')} نقطة خبرة إجمالية`}</span>
            </p>
          </div>
        </div>

        <Link
          href="/rpg"
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-xs font-bold text-slate-200 transition-colors group"
        >
          <Trophy size={13} className="text-amber-400" />
          <span>الأوسمة</span>
          <ChevronLeft size={13} className="text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* XP Bar */}
      <div className="relative z-10">
        <div className="flex justify-between items-center text-[11px] font-semibold text-slate-400 mb-1.5 px-0.5">
          <span className="flex items-center gap-1 text-indigo-300">
            <Sparkles size={11} />
            <span>{`تقدم المستوى: ${percentage}%`}</span>
          </span>
          <span className="text-slate-400 font-mono">{`${xpToNext} XP للترقية`}</span>
        </div>

        <div className="relative h-3 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <motion.div
            className="absolute inset-y-0.5 right-0.5 xp-shimmer rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(percentage, 2)}%` }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
}
