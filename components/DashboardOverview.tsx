'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Clock,
  Flame,
  Zap,
  Target,
  BookOpen,
  ChevronLeft,
  Timer,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import type { DashboardAnalytics, SubjectDetailedProgress, UserProfile } from '@/lib/types'

interface Props {
  analytics: DashboardAnalytics
  profile: UserProfile
}

export default function DashboardOverview({ analytics, profile }: Props) {
  const [activeSubjectTab, setActiveSubjectTab] = useState<number | 'all'>('all')

  const xpPercentage =
    profile.progress_pct ?? Math.min(Math.round(((profile.total_xp % 500) / 500) * 100), 100)

  const goalPercentage = Math.min(
    100,
    Math.round((analytics.todayHours / (analytics.dailyGoalHours || 4)) * 100)
  )

  const maxWeeklyHours = Math.max(4, ...analytics.weeklyActivity.map((d) => d.hours))

  const totalLessons = analytics.subjects.reduce((acc, s) => acc + s.total_topics, 0)
  const totalMastered = analytics.subjects.reduce((acc, s) => acc + s.stages.mastered, 0)
  const totalReviewing = analytics.subjects.reduce((acc, s) => acc + s.stages.reviewing, 0)
  const totalRead = analytics.subjects.reduce((acc, s) => acc + s.stages.read + s.stages.summarized, 0)

  return (
    <div className="space-y-6">
      {/* ─── Hero Overview Row: Today's Goal & Level ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Daily Goal Card */}
        <div className="panel p-4 sm:p-5 flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Target size={14} className="text-emerald-400" />
              <span>الهدف اليومي للمذاكرة</span>
            </div>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                {analytics.todayHours}
              </span>
              <span className="text-xs text-slate-400 font-semibold font-mono">
                / {analytics.dailyGoalHours} ساعات
              </span>
            </div>
            <p className="text-[11px] text-slate-400 pt-0.5">
              {goalPercentage >= 100
                ? '🎉 أحسنت! حققت هدفك اليومي'
                : `متبقي ${(analytics.dailyGoalHours - analytics.todayHours).toFixed(1)} ساعة لإكمال الهدف`}
            </p>
          </div>

          {/* Radial Goal Indicator */}
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${goalPercentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-xs font-black text-white font-mono">
              {goalPercentage}%
            </span>
          </div>
        </div>

        {/* Level & XP Quick Card */}
        <div className="panel p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium">الرتبة والمستوى</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                  Lvl.{profile.current_level}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5">
                {profile.level_title || 'متعلم 📘'}
              </h3>
            </div>
            <Link
              href="/rpg"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-amber-400 transition-colors"
              title="الأوسمة"
            >
              <Zap size={18} />
            </Link>
          </div>

          <div className="pt-3">
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>{profile.total_xp.toLocaleString('ar-EG')} XP</span>
              <span className="font-mono">{profile.xp_to_next} XP للمستوى القادم</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-emerald-500 rounded-full xp-shimmer"
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4 Quick KPI Counters ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="panel p-3.5">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock size={12} className="text-cyan-400" />
            <span>إجمالي الساعات</span>
          </span>
          <p className="text-xl font-black text-white mt-1 font-mono">{analytics.totalHours}h</p>
          <span className="text-[10px] text-slate-500">منذ بداية المذاكرة</span>
        </div>

        <div className="panel p-3.5">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar size={12} className="text-indigo-400" />
            <span>ساعات الأسبوع</span>
          </span>
          <p className="text-xl font-black text-white mt-1 font-mono">{analytics.weeklyHours}h</p>
          <span className="text-[10px] text-slate-500">آخر 7 أيام</span>
        </div>

        <div className="panel p-3.5">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Flame size={12} className="text-orange-400" />
            <span>أيام الالتزام</span>
          </span>
          <p className="text-xl font-black text-orange-400 mt-1 font-mono">
            {analytics.streakDays} أيام
          </p>
          <span className="text-[10px] text-slate-500">سلسلة متتالية</span>
        </div>

        <div className="panel p-3.5">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span>الدروس المتقنة</span>
          </span>
          <p className="text-xl font-black text-emerald-400 mt-1 font-mono">
            {totalMastered} / {totalLessons}
          </p>
          <span className="text-[10px] text-slate-500">مرحلة الإتقان التام</span>
        </div>
      </div>

      {/* ─── Weekly Activity Chart (النشاط الأسبوعي والشهري) ───────────────── */}
      <div className="panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-400" />
              <h2 className="font-bold text-sm sm:text-base text-white">النشاط الأسبوعي للمذاكرة</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">توزيع ساعات المذاكرة لكل يوم في الأسبوع</p>
          </div>
          <span className="text-xs font-black text-slate-300 font-mono px-2.5 py-1 rounded-lg bg-slate-800">
            {analytics.weeklyHours} ساعة
          </span>
        </div>

        {/* 7-Bar Visual Chart */}
        <div className="pt-4 pb-2">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-36 border-b border-slate-800 pb-3">
            {analytics.weeklyActivity.map((day, i) => {
              const barHeight = Math.max(8, Math.round((day.hours / maxWeeklyHours) * 100))

              return (
                <div key={i} className="flex flex-col items-center h-full justify-end group">
                  {/* Tooltip / Hours value */}
                  <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1 font-bold">
                    {day.hours}h
                  </span>

                  {/* Bar track */}
                  <div className="w-full max-w-[32px] h-24 bg-slate-800/40 rounded-xl overflow-hidden flex flex-col justify-end p-0.5">
                    <motion.div
                      className={`w-full rounded-lg transition-colors ${
                        day.isToday
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-sm shadow-emerald-500/40'
                          : day.hours > 0
                          ? 'bg-slate-600 group-hover:bg-emerald-400'
                          : 'bg-transparent'
                      }`}
                      initial={{ height: 0 }}
                      animate={{ height: `${barHeight}%` }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                    />
                  </div>

                  {/* Day Label */}
                  <span
                    className={`text-[11px] mt-2 font-medium ${
                      day.isToday ? 'text-emerald-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {day.shortDay}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
              <span>اليوم الحالي</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-slate-600 inline-block" />
              <span>الأيام السابقة</span>
            </span>
          </div>
          <span className="font-mono text-[11px]">معدل: {(analytics.weeklyHours / 7).toFixed(1)} س/يوم</span>
        </div>
      </div>

      {/* ─── Detailed Subject Breakdown (المواد الأربعة وتفصيل المراحل) ─────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-cyan-400" />
              <h2 className="font-bold text-sm sm:text-base text-white">التقدم التفصيلي لكل مادة</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              حالة استيعاب الدروس في كل مادة بالمراحل الخمس الدقيقة
            </p>
          </div>
          <Link
            href="/curriculum"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            عرض الكل
          </Link>
        </div>

        {/* Detailed Subject Cards */}
        <div className="space-y-3.5">
          {analytics.subjects.map((sub) => (
            <SubjectDetailedCard key={sub.id} subject={sub} />
          ))}
        </div>
      </div>
    </div>
  )
}

function SubjectDetailedCard({ subject }: { subject: SubjectDetailedProgress }) {
  const { stages, total_topics } = subject

  // Percentages for segmented bar
  const pMastered = total_topics ? (stages.mastered / total_topics) * 100 : 0
  const pReviewing = total_topics ? (stages.reviewing / total_topics) * 100 : 0
  const pSummarized = total_topics ? (stages.summarized / total_topics) * 100 : 0
  const pRead = total_topics ? (stages.read / total_topics) * 100 : 0

  return (
    <div className="panel p-4 sm:p-5 space-y-4 hover:border-slate-700/80 transition-all">
      {/* Top Header Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-2xl flex-shrink-0">
            {subject.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">{subject.name}</h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                {subject.total_topics} درس
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span className="font-mono text-cyan-400">{subject.study_hours} ساعة مذاكرة</span>
              <span>•</span>
              <span className="font-mono text-emerald-400 font-bold">{subject.mastery_percentage}% إتقان عام</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/focus?subject=${subject.id}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-500/30 transition-all"
            title="بدء جلسة تركيز"
          >
            <Timer size={13} />
            <span className="hidden sm:inline">مذاكرة</span>
          </Link>
          <Link
            href={`/curriculum/${subject.id}`}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="فهرس الدروس"
          >
            <ChevronLeft size={16} />
          </Link>
        </div>
      </div>

      {/* Multi-Segment Mastery Bar */}
      <div className="space-y-1.5">
        <div className="h-2.5 bg-slate-800/60 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-800">
          {stages.mastered > 0 && (
            <div
              className="bg-emerald-500 rounded-full h-full"
              style={{ width: `${Math.max(3, pMastered)}%` }}
              title={`متقن: ${stages.mastered}`}
            />
          )}
          {stages.reviewing > 0 && (
            <div
              className="bg-amber-400 rounded-full h-full"
              style={{ width: `${Math.max(3, pReviewing)}%` }}
              title={`تحت المراجعة: ${stages.reviewing}`}
            />
          )}
          {stages.summarized > 0 && (
            <div
              className="bg-sky-400 rounded-full h-full"
              style={{ width: `${Math.max(3, pSummarized)}%` }}
              title={`تم التلخيص والحل: ${stages.summarized}`}
            />
          )}
          {stages.read > 0 && (
            <div
              className="bg-purple-400 rounded-full h-full"
              style={{ width: `${Math.max(3, pRead)}%` }}
              title={`تمت القراءة: ${stages.read}`}
            />
          )}
        </div>
      </div>

      {/* 5 Stages Pill Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1 text-[11px]">
        <div className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center justify-between">
          <span>🌟 متقن</span>
          <span className="font-bold font-mono">{stages.mastered}</span>
        </div>

        <div className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center justify-between">
          <span>⏳ تحت المراجعة</span>
          <span className="font-bold font-mono">{stages.reviewing}</span>
        </div>

        <div className="px-2.5 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 flex items-center justify-between">
          <span>✍️ تم التلخيص</span>
          <span className="font-bold font-mono">{stages.summarized}</span>
        </div>

        <div className="px-2.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-between">
          <span>📖 تمت القراءة</span>
          <span className="font-bold font-mono">{stages.read}</span>
        </div>

        <div className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 flex items-center justify-between col-span-2 sm:col-span-1">
          <span>⚪ لم يبدأ بعد</span>
          <span className="font-bold font-mono">{stages.not_started}</span>
        </div>
      </div>
    </div>
  )
}
