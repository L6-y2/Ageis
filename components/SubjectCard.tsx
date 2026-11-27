'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, BookOpen } from 'lucide-react'
import { SUBJECTS } from '@/lib/types'
import { SubjectIcon, getSubjectTheme } from '@/components/AcademicIcons'

interface SubjectCardProps {
  subjectId: number
  mastered: number
  total: number
  percentage: number
}

export default function SubjectCard({ subjectId, mastered, total, percentage }: SubjectCardProps) {
  const subject = SUBJECTS.find((s) => s.id === subjectId)
  if (!subject) return null

  const theme = getSubjectTheme(subjectId)

  return (
    <Link href={`/curriculum/${subjectId}`} className="block group rounded-[14px]">
      <article className="aegis-panel-interactive rounded-[14px] p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-12 h-12 rounded-[10px] ${theme.bgSubtle} border ${theme.border} flex items-center justify-center shrink-0`}
            >
              <SubjectIcon subjectId={subjectId} size={22} />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-[#ECEEF2] text-base sm:text-lg group-hover:text-[#D4AF37] transition-colors truncate">
                {subject.name}
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-1 flex items-center gap-1.5">
                <BookOpen size={13} className="text-[#7D8594] shrink-0" />
                <span>
                  <span dir="ltr" className="font-tabular text-[#ECEEF2]">{mastered}</span> من{' '}
                  <span dir="ltr" className="font-tabular">{total}</span> درس متقن
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span
              dir="ltr"
              className={`text-sm font-bold font-tabular px-2.5 py-1 rounded-[8px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] ${theme.text}`}
            >
              {percentage}%
            </span>
            <div className="w-8 h-8 rounded-[8px] bg-[#191C25] border border-[rgba(236,238,242,0.08)] flex items-center justify-center text-[#7D8594] group-hover:text-[#ECEEF2] group-hover:border-[rgba(212,175,55,0.35)] transition-colors">
              <ChevronLeft size={16} />
            </div>
          </div>
        </div>

        {/* Crisp Progress Track */}
        <div className="space-y-1.5">
          <div className="h-2 bg-[#07080B] rounded-full overflow-hidden p-0.5 border border-[rgba(236,238,242,0.07)]">
            <motion.div
              className={`h-full ${theme.barBg} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(percentage, 2)}%` }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#7D8594]">
            <span>فهرس الفصول والدروس</span>
            <span className="font-tabular">
              متبقي <span dir="ltr">{Math.max(0, total - mastered)}</span>
            </span>
          </div>
        </div>
      </article>
    </Link>
  )
}
