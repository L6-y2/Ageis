'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Trophy, ChevronLeft, Zap } from 'lucide-react'
import { RankIcon, stripPresentationEmojis } from '@/components/AcademicIcons'

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
    1: 'مبتدئ',
    2: 'متعلم',
    3: 'متقدم',
    4: 'محترف',
    5: 'خبير',
    6: 'أسطورة',
    7: 'نخبة',
    8: 'عبقري',
  }
  const currentTitle = stripPresentationEmojis(levelTitle) || levelLabels[level] || `المستوى ${level}`

  return (
    <div className="aegis-panel-elevated p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[10px] bg-[#07080B] border border-[rgba(212,175,55,0.35)] flex items-center justify-center shrink-0">
            <RankIcon level={level} size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-[#ECEEF2] text-base">{currentTitle}</h2>
              <span
                dir="ltr"
                className="inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-semibold font-tabular bg-[rgba(212,175,55,0.10)] text-[#D4AF37] border border-[rgba(212,175,55,0.28)]"
              >
                LVL {level}
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] mt-0.5 flex items-center gap-1">
              <Zap size={12} className="text-[#D4AF37]" />
              <span>
                <span dir="ltr" className="font-tabular text-[#ECEEF2]">{totalXp.toLocaleString('en-US')}</span> نقطة خبرة إجمالية
              </span>
            </p>
          </div>
        </div>

        <Link
          href="/rpg"
          className="flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-[#12141C] hover:bg-[#202430] border border-[rgba(236,238,242,0.12)] text-xs font-semibold text-[#ECEEF2] transition-colors group min-h-[40px]"
        >
          <Trophy size={13} className="text-[#D4AF37]" />
          <span>الأوسمة</span>
          <ChevronLeft size={13} className="text-[#7D8594]" />
        </Link>
      </div>

      <div>
        <div className="flex justify-between items-center text-[11px] font-medium text-[#9CA3AF] mb-1.5">
          <span>
            تقدم المستوى: <span dir="ltr" className="font-tabular text-[#D4AF37]">{percentage}%</span>
          </span>
          <span className="text-[#7D8594] font-tabular">
            <span dir="ltr">{xpToNext} XP</span> للترقية
          </span>
        </div>

        <div className="relative h-2 bg-[#07080B] rounded-full overflow-hidden border border-[rgba(236,238,242,0.07)]">
          <motion.div
            className="h-full xp-shimmer rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(percentage, 2)}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>
    </div>
  )
}
