'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronLeft, Sparkles, BookOpen } from 'lucide-react'
import { SUBJECTS } from '@/lib/types'

interface SubjectCardProps {
  subjectId: number
  mastered: number
  total: number
  percentage: number
}

export default function SubjectCard({ subjectId, mastered, total, percentage }: SubjectCardProps) {
  const subject = SUBJECTS.find((s) => s.id === subjectId)
  if (!subject) return null

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`/curriculum/${subjectId}`} className="block group">
        <div className="glass-interactive rounded-3xl p-4 relative overflow-hidden border border-slate-800/90 hover:border-indigo-500/40">
          {/* Subtle background ambient corner glow */}
          <div
            className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${subject.color} opacity-10 rounded-full blur-2xl pointer-events-none group-hover:opacity-20 transition-opacity`}
          />

          <div className="flex items-center justify-between gap-3 mb-3 relative z-10">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-2xl shadow-lg ring-1 ring-white/20 group-hover:scale-105 transition-transform`}
              >
                {subject.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base group-hover:text-white transition-colors flex items-center gap-1.5">
                  {subject.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <BookOpen size={12} className="text-slate-500" />
                  <span>{`${mastered} من ${total} درس متقن`}</span>
                </p>
              </div>
            </div>

            {/* Percentage Badge */}
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-black tracking-tight px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-200 group-hover:border-indigo-500/50 transition-colors`}>
                {`${percentage}%`}
              </span>
              <div className="w-7 h-7 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-[-2px] transition-all">
                <ChevronLeft size={16} />
              </div>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="relative h-2.5 bg-slate-950/70 rounded-full overflow-hidden p-0.5 border border-slate-800/60 z-10">
            <motion.div
              className={`h-full bg-gradient-to-r ${subject.color} rounded-full relative`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(percentage, 2)}%` }}
              transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
            >
              {percentage > 5 && (
                <div className="absolute inset-y-0 right-0 w-2 bg-white/40 rounded-full blur-[1px]" />
              )}
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
