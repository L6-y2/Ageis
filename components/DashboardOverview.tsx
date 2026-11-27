'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Timer,
  TrendingUp,
  CheckCircle2,
  Clock,
  FileText,
  BookOpen,
  Circle,
  ChevronLeft,
  Award,
  ArrowUpLeft,
  Layers,
  CheckSquare,
  Compass,
} from 'lucide-react'
import type { DashboardAnalytics, SubjectDetailedProgress, UserProfile } from '@/lib/types'
import {
  SubjectIcon,
  RankIcon,
  getSubjectTheme,
  stripPresentationEmojis,
} from '@/components/AcademicIcons'

interface Props {
  analytics: DashboardAnalytics
  profile: UserProfile
}

export default function DashboardOverview({ analytics, profile }: Props) {
  const [activeSubjectTab, setActiveSubjectTab] = useState<number | 'all'>('all')
  const [hoveredDayIdx, setHoveredDayIdx] = useState<number | null>(null)

  const xpPercentage =
    profile.progress_pct ?? Math.min(Math.round(((profile.total_xp % 500) / 500) * 100), 100)

  const dailyGoal = analytics.dailyGoalHours || 4
  const goalPercentage = Math.min(100, Math.round((analytics.todayHours / dailyGoal) * 100))
  const remainingHours = Math.max(0, dailyGoal - analytics.todayHours).toFixed(1)

  const maxWeeklyHours = Math.max(dailyGoal, ...analytics.weeklyActivity.map((d) => d.hours))

  const totalLessons = analytics.subjects.reduce((acc, s) => acc + s.total_topics, 0)
  const totalMastered = analytics.subjects.reduce((acc, s) => acc + s.stages.mastered, 0)
  const overallMasteryPct = totalLessons ? Math.round((totalMastered / totalLessons) * 100) : 0
  const cleanRankTitle = stripPresentationEmojis(profile.level_title) || 'متعلم'

  // Determine real smart focus recommendation (lowest mastery subject with remaining topics)
  const recommendedSubject = useMemo(() => {
    if (!analytics.subjects.length) return null
    const incomplete = analytics.subjects.filter((s) => s.mastery_percentage < 100)
    const pool = incomplete.length ? incomplete : analytics.subjects
    return [...pool].sort((a, b) => a.mastery_percentage - b.mastery_percentage)[0]
  }, [analytics.subjects])

  // Aggregate or selected subject stage breakdown for the Master-Detail Inspector
  const selectedSubject: SubjectDetailedProgress | null = useMemo(() => {
    if (activeSubjectTab === 'all') return null
    return analytics.subjects.find((s) => s.id === activeSubjectTab) || null
  }, [analytics.subjects, activeSubjectTab])

  const inspectorMetrics = useMemo(() => {
    if (selectedSubject) {
      return {
        title: selectedSubject.name,
        total: selectedSubject.total_topics,
        pct: selectedSubject.mastery_percentage,
        hours: selectedSubject.study_hours,
        stages: selectedSubject.stages,
        subjectId: selectedSubject.id,
      }
    }
    const agg = analytics.subjects.reduce(
      (acc, s) => {
        acc.mastered += s.stages.mastered
        acc.reviewing += s.stages.reviewing
        acc.summarized += s.stages.summarized
        acc.read += s.stages.read
        acc.not_started += s.stages.not_started
        acc.total += s.total_topics
        acc.hours += s.study_hours
        return acc
      },
      { mastered: 0, reviewing: 0, summarized: 0, read: 0, not_started: 0, total: 0, hours: 0 }
    )
    return {
      title: 'إجمالي المنهج العام',
      total: agg.total,
      pct: overallMasteryPct,
      hours: Math.round(agg.hours * 10) / 10,
      stages: {
        mastered: agg.mastered,
        reviewing: agg.reviewing,
        summarized: agg.summarized,
        read: agg.read,
        not_started: agg.not_started,
      },
      subjectId: null as number | null,
    }
  }, [selectedSubject, analytics.subjects, overallMasteryPct])

  // Weekly inspected day
  const inspectedDay =
    hoveredDayIdx !== null
      ? analytics.weeklyActivity[hoveredDayIdx]
      : analytics.weeklyActivity.find((d) => d.isToday) ||
        analytics.weeklyActivity[analytics.weeklyActivity.length - 1]

  // Arc math for the Hero Horological Daily Gauge (240-degree sweep)
  const gaugeRadius = 62
  const gaugeCirc = 2 * Math.PI * gaugeRadius
  const sweepFraction = 240 / 360
  const trackLength = gaugeCirc * sweepFraction
  const fillLength = trackLength * (goalPercentage / 100)

  return (
    <div className="space-y-6">
      {/* ─── 1. Hairline Architectural Telemetry Ledger (No Stacked Boxes) ───── */}
      <section
        aria-label="ملخص المؤشرات اليومية"
        className="border border-[rgba(236,238,242,0.08)] bg-[rgba(236,238,242,0.07)] rounded-[12px] overflow-hidden"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px">
          <div className="bg-[#0E1016] p-3.5 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="block text-[11px] text-[#7D8594]">مذاكرة اليوم</span>
              <span dir="ltr" className="block text-xl sm:text-2xl font-bold text-[#ECEEF2] font-tabular mt-0.5 text-right">
                {analytics.todayHours}
                <span className="text-xs font-normal text-[#7D8594]"> / {dailyGoal}h</span>
              </span>
            </div>
            <span
              dir="ltr"
              className={`self-start sm:self-auto text-xs font-semibold font-tabular px-2 py-0.5 rounded-[6px] ${
                goalPercentage >= 100
                  ? 'bg-[rgba(78,168,126,0.12)] text-[#4EA87E]'
                  : 'bg-[rgba(212,175,55,0.10)] text-[#D4AF37]'
              }`}
            >
              {goalPercentage}%
            </span>
          </div>

          <div className="bg-[#0E1016] p-3.5 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="block text-[11px] text-[#7D8594]">رصيد الأسبوع</span>
              <span dir="ltr" className="block text-xl sm:text-2xl font-bold text-[#ECEEF2] font-tabular mt-0.5 text-right">
                {analytics.weeklyHours}h
              </span>
            </div>
            <span className="text-[11px] text-[#9CA3AF]">
              <span dir="ltr" className="font-tabular">{(analytics.weeklyHours / 7).toFixed(1)}h</span>/يوم
            </span>
          </div>

          <div className="bg-[#0E1016] p-3.5 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="block text-[11px] text-[#7D8594]">إجمالي الساعات</span>
              <span dir="ltr" className="block text-xl sm:text-2xl font-bold text-[#ECEEF2] font-tabular mt-0.5 text-right">
                {analytics.totalHours}h
              </span>
            </div>
            <span className="text-[11px] text-[#7D8594]">تراكمي</span>
          </div>

          <div className="bg-[#0E1016] p-3.5 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="block text-[11px] text-[#7D8594]">الدروس المتقنة</span>
              <span dir="ltr" className="block text-xl sm:text-2xl font-bold text-[#ECEEF2] font-tabular mt-0.5 text-right">
                <span className="text-[#4EA87E]">{totalMastered}</span>
                <span className="text-xs font-normal text-[#7D8594]"> / {totalLessons}</span>
              </span>
            </div>
            <span dir="ltr" className="self-start sm:self-auto text-xs font-semibold font-tabular text-[#4EA87E]">
              {overallMasteryPct}%
            </span>
          </div>
        </div>
      </section>

      {/* ─── 2. Asymmetric Dual-Column Command Workspace (7 : 5) ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ═══ PRIMARY COLUMN (7 cols): Daily Focus Console + Weekly Cadence ═══ */}
        <div className="lg:col-span-7 bg-[#12141C] border border-[rgba(236,238,242,0.08)] rounded-[16px] overflow-hidden shadow-[0_8px_24px_-4px_rgba(0,0,0,0.55)]">
          {/* Top-edge restrained gold indicator hairline */}
          <div className="h-[2px] w-full bg-gradient-to-l from-[#D4AF37]/75 via-[#D4AF37]/20 to-transparent" />

          {/* Part A: Hero Daily Focus Instrument */}
          <section className="p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-3.5 flex-1 min-w-0 text-center sm:text-right">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#D4AF37] bg-[rgba(212,175,55,0.08)] border border-[rgba(212,175,55,0.25)] px-2.5 py-1 rounded-[6px]">
                <Compass size={13} />
                <span>مؤشر الإنجاز اليومي</span>
              </div>

              <div>
                <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#ECEEF2] leading-snug">
                  {goalPercentage >= 100
                    ? 'حققت هدف التركيز المقرر لليوم'
                    : `متبقي ${remainingHours} ساعة لإتمام جلسة اليوم`}
                </h2>
                {recommendedSubject && (
                  <p className="text-xs text-[#9CA3AF] mt-1.5 leading-relaxed">
                    الأولوية المقترحة الآن:{' '}
                    <span className="text-[#ECEEF2] font-semibold">{recommendedSubject.name}</span>{' '}
                    (<span dir="ltr" className="font-tabular text-[#D4AF37]">{recommendedSubject.mastery_percentage}%</span> إتقان)
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                <Link
                  href={recommendedSubject ? `/focus?subject=${recommendedSubject.id}` : '/focus'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#D4AF37] hover:bg-[#E0C058] text-[#0A0B0E] text-xs sm:text-sm font-semibold transition-colors min-h-[44px]"
                >
                  <Timer size={16} strokeWidth={2} />
                  <span>
                    {recommendedSubject ? `ابدأ جلسة ${recommendedSubject.name}` : 'دخول استوديو التركيز'}
                  </span>
                </Link>

                <Link
                  href="/tasks"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-[#191C25] hover:bg-[#202430] border border-[rgba(236,238,242,0.12)] text-[#ECEEF2] text-xs font-semibold transition-colors min-h-[44px]"
                >
                  <CheckSquare size={14} className="text-[#4EA87E]" />
                  <span>المهام والمراجعات</span>
                </Link>
              </div>
            </div>

            {/* Horological Chronometer Arc Gauge */}
            <div className="relative w-40 h-36 flex items-center justify-center shrink-0 select-none">
              <svg className="w-40 h-40 overflow-visible" viewBox="0 0 160 160" aria-hidden="true">
                {/* Background 240-deg track */}
                <circle
                  cx="80"
                  cy="80"
                  r={gaugeRadius}
                  fill="none"
                  stroke="#07080B"
                  strokeWidth="10"
                  strokeDasharray={`${trackLength} ${gaugeCirc}`}
                  strokeLinecap="round"
                  transform="rotate(150 80 80)"
                />
                {/* Outer hairline calibration ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={gaugeRadius + 10}
                  fill="none"
                  stroke="rgba(236,238,242,0.08)"
                  strokeWidth="1"
                  strokeDasharray="2 6"
                  transform="rotate(150 80 80)"
                />
                {/* Active gold/sage progress arc */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r={gaugeRadius}
                  fill="none"
                  stroke={goalPercentage >= 100 ? '#4EA87E' : '#D4AF37'}
                  strokeWidth="8"
                  strokeDasharray={`${fillLength} ${gaugeCirc}`}
                  strokeLinecap="round"
                  transform="rotate(150 80 80)"
                  initial={{ strokeDasharray: `0 ${gaugeCirc}` }}
                  animate={{ strokeDasharray: `${fillLength} ${gaugeCirc}` }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <span dir="ltr" className="text-3xl font-bold text-[#ECEEF2] font-tabular leading-none">
                  {goalPercentage}%
                </span>
                <span dir="ltr" className="text-[11px] font-tabular text-[#9CA3AF] mt-1.5">
                  {analytics.todayHours} / {dailyGoal}h
                </span>
                <span className="text-[10px] text-[#7D8594] mt-0.5">هدف اليوم</span>
              </div>
            </div>
          </section>

          {/* Architectural Divider */}
          <div className="border-t border-[rgba(236,238,242,0.07)]" />

          {/* Part B: Integrated Weekly Study Cadence Telemetry */}
          <section className="p-5 sm:p-6 bg-[#0E1016]/60 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp size={15} className="text-[#D4AF37]" />
                <h3 className="text-sm font-semibold text-[#ECEEF2]">الإيقاع الأسبوعي للتركيز</h3>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-[11px] text-[#7D8594] inline-flex items-center gap-1.5">
                  <span className="w-3 border-t border-dashed border-[#D4AF37]/60 inline-block" />
                  <span>
                    الهدف <span dir="ltr" className="font-tabular text-[#D4AF37]">{dailyGoal}h</span>
                  </span>
                </span>
                {inspectedDay && (
                  <>
                    <span className="text-[#2B303E]" aria-hidden="true">|</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#9CA3AF]">{inspectedDay.dayName}:</span>
                      <span dir="ltr" className="font-tabular font-semibold text-[#D4AF37]">
                        {inspectedDay.hours}h
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {analytics.weeklyActivity.length > 0 ? (
              <div className="relative pt-2">
                <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end border-b border-[rgba(236,238,242,0.08)] pb-2.5">
                  {analytics.weeklyActivity.map((day, i) => {
                    const barHeight =
                      day.hours > 0 ? Math.max(8, Math.round((day.hours / maxWeeklyHours) * 100)) : 0
                    const isActive = hoveredDayIdx === i || (hoveredDayIdx === null && day.isToday)

                    return (
                      <button
                        key={day.date || i}
                        type="button"
                        onMouseEnter={() => setHoveredDayIdx(i)}
                        onMouseLeave={() => setHoveredDayIdx(null)}
                        onFocus={() => setHoveredDayIdx(i)}
                        onBlur={() => setHoveredDayIdx(null)}
                        aria-label={`${day.dayName}: ${day.hours} ساعة`}
                        className="flex flex-col items-center justify-end group rounded-[6px]"
                      >
                        <span
                          dir="ltr"
                          className={`text-[10px] font-tabular mb-1.5 transition-colors ${
                            isActive ? 'text-[#D4AF37] font-semibold' : 'text-[#7D8594]'
                          }`}
                        >
                          {day.hours > 0 ? `${day.hours}h` : '—'}
                        </span>

                        <div className="relative w-full max-w-[30px] h-24 bg-[#07080B] border border-[rgba(236,238,242,0.06)] rounded-[6px] overflow-hidden flex flex-col justify-end p-0.5">
                          {/* Subtle calibrated goal marker inside track */}
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-0 border-t border-dashed border-[rgba(212,175,55,0.22)] pointer-events-none"
                            style={{
                              bottom: `${Math.min(96, Math.round((dailyGoal / maxWeeklyHours) * 100))}%`,
                            }}
                          />
                          {barHeight > 0 && (
                            <motion.div
                              className={`relative z-10 w-full rounded-[4px] transition-colors ${
                                day.isToday
                                  ? 'bg-[#D4AF37]'
                                  : isActive
                                  ? 'bg-[#5D8AA8]'
                                  : 'bg-[#2C3242]'
                              }`}
                              initial={{ height: 0 }}
                              animate={{ height: `${barHeight}%` }}
                              transition={{ duration: 0.55, delay: i * 0.035, ease: [0.22, 1, 0.36, 1] }}
                            />
                          )}
                        </div>

                        <span
                          className={`text-[11px] mt-1.5 ${
                            day.isToday
                              ? 'text-[#D4AF37] font-semibold'
                              : isActive
                              ? 'text-[#ECEEF2]'
                              : 'text-[#7D8594]'
                          }`}
                        >
                          {day.shortDay}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#7D8594] py-6 text-center">
                لا توجد جلسات مسجلة خلال الأسبوع الحالي بعد.
              </p>
            )}

            <div className="flex items-center justify-between text-[11px] text-[#7D8594] pt-0.5">
              <span>7 أيام متتالية</span>
              <span>
                إجمالي الأسبوع:{' '}
                <span dir="ltr" className="font-tabular text-[#ECEEF2] font-semibold">
                  {analytics.weeklyHours}h
                </span>
              </span>
            </div>
          </section>
        </div>

        {/* ═══ SECONDARY COLUMN (5 cols): Rank Dossier + Interactive Subject Syllabus Inspector ═══ */}
        <div className="lg:col-span-5 space-y-4">
          {/* A. Academic Rank & Standing Strip */}
          <section className="aegis-panel-elevated p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-[10px] bg-[#07080B] border border-[rgba(212,175,55,0.34)] flex items-center justify-center shrink-0">
                  <RankIcon level={profile.current_level} size={20} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#9CA3AF]">الرتبة الحالية</span>
                    <span
                      dir="ltr"
                      className="text-[10px] font-tabular font-semibold px-1.5 py-0.5 rounded bg-[rgba(212,175,55,0.10)] text-[#D4AF37] border border-[rgba(212,175,55,0.28)]"
                    >
                      LVL {profile.current_level}
                    </span>
                  </div>
                  <h2 className="font-editorial text-lg font-bold text-[#ECEEF2] mt-0.5 truncate">
                    {cleanRankTitle}
                  </h2>
                </div>
              </div>

              <Link
                href="/rpg"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[8px] bg-[#12141C] hover:bg-[#202430] border border-[rgba(236,238,242,0.12)] text-xs font-medium text-[#ECEEF2] transition-colors min-h-[38px] shrink-0"
              >
                <Award size={14} className="text-[#D4AF37]" />
                <span>الأوسمة</span>
              </Link>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span dir="ltr" className="font-tabular font-semibold text-[#ECEEF2]">
                  {profile.total_xp.toLocaleString('en-US')} XP
                </span>
                <span className="text-[#7D8594]">
                  متبقي <span dir="ltr" className="font-tabular text-[#9CA3AF]">{profile.xp_to_next} XP</span>
                </span>
              </div>
              <div className="h-1.5 bg-[#07080B] rounded-full overflow-hidden border border-[rgba(236,238,242,0.06)]">
                <motion.div
                  className="h-full rounded-full xp-shimmer"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPercentage}%` }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[rgba(236,238,242,0.07)] grid grid-cols-3 gap-2 text-center">
              <div>
                <span dir="ltr" className="block text-sm font-bold font-tabular text-[#ECEEF2]">
                  {profile.longest_streak}
                </span>
                <span className="block text-[10px] text-[#7D8594]">أطول سلسلة</span>
              </div>
              <div className="border-x border-[rgba(236,238,242,0.07)]">
                <span dir="ltr" className="block text-sm font-bold font-tabular text-[#ECEEF2]">
                  {profile.tasks_completed}
                </span>
                <span className="block text-[10px] text-[#7D8594]">مهام منجزة</span>
              </div>
              <div>
                <span dir="ltr" className="block text-sm font-bold font-tabular text-[#4EA87E]">
                  {totalMastered}
                </span>
                <span className="block text-[10px] text-[#7D8594]">دروس متقنة</span>
              </div>
            </div>
          </section>

          {/* B. Comparative Subject Ledger + Interactive Stage Inspector */}
          <section className="aegis-panel overflow-hidden">
            <div className="px-5 py-4 border-b border-[rgba(236,238,242,0.07)] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookOpen size={15} className="text-[#D4AF37]" />
                <h2 className="text-sm font-semibold text-[#ECEEF2]">فهرس المواد الدراسية</h2>
              </div>
              <div className="flex items-center gap-2">
                {activeSubjectTab !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setActiveSubjectTab('all')}
                    className="text-[11px] font-medium text-[#D4AF37] hover:text-[#E0C058] px-2 py-1 rounded-[6px] bg-[rgba(212,175,55,0.08)]"
                  >
                    نظرة عامة
                  </button>
                )}
                <Link
                  href="/curriculum"
                  className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#9CA3AF] hover:text-[#ECEEF2]"
                >
                  <span>المناهج</span>
                  <ChevronLeft size={13} />
                </Link>
              </div>
            </div>

            {/* Interactive Comparative Rows (All 4 Subjects in one crisp ledger) */}
            <div className="divide-y divide-[rgba(236,238,242,0.06)]">
              {analytics.subjects.map((sub) => {
                const theme = getSubjectTheme(sub.id)
                const isSelected = activeSubjectTab === sub.id

                return (
                  <div
                    key={sub.id}
                    className={`flex items-center gap-2 px-4 py-2.5 transition-colors ${
                      isSelected ? 'bg-[#191C25]' : 'hover:bg-[#161923]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveSubjectTab(isSelected ? 'all' : sub.id)}
                      aria-pressed={isSelected}
                      className="flex-1 min-w-0 text-right flex items-center gap-3 py-0.5"
                    >
                      <div
                        className={`w-9 h-9 rounded-[8px] ${theme.bgSubtle} border ${theme.border} flex items-center justify-center shrink-0`}
                      >
                        <SubjectIcon subjectId={sub.id} size={17} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs sm:text-sm font-semibold text-[#ECEEF2] truncate">
                            {sub.name}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span dir="ltr" className="text-[11px] font-tabular text-[#7D8594]">
                              {sub.study_hours}h
                            </span>
                            <span dir="ltr" className={`text-xs font-bold font-tabular ${theme.text}`}>
                              {sub.mastery_percentage}%
                            </span>
                          </div>
                        </div>

                        <div className="h-1.5 bg-[#07080B] rounded-full overflow-hidden">
                          <div
                            className={`h-full ${theme.barBg} rounded-full transition-all duration-300`}
                            style={{ width: `${Math.max(2, sub.mastery_percentage)}%` }}
                          />
                        </div>
                      </div>
                    </button>

                    <Link
                      href={`/focus?subject=${sub.id}`}
                      aria-label={`بدء تركيز في ${sub.name}`}
                      title={`بدء جلسة ${sub.name}`}
                      className="w-9 h-9 rounded-[8px] bg-[#07080B] hover:bg-[#202430] border border-[rgba(236,238,242,0.08)] hover:border-[rgba(212,175,55,0.40)] flex items-center justify-center text-[#9CA3AF] hover:text-[#D4AF37] transition-colors shrink-0"
                    >
                      <Timer size={14} />
                    </Link>
                  </div>
                )
              })}
            </div>

            {/* Stage Distribution Drill-Down Inspector */}
            <div className="p-4 sm:p-5 bg-[#0B0D13] border-t border-[rgba(236,238,242,0.08)] space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Layers size={14} className="text-[#D4AF37] shrink-0" />
                  <h3 className="text-xs font-semibold text-[#ECEEF2] truncate">
                    تفصيل المراحل: {inspectorMetrics.title}
                  </h3>
                </div>
                <span className="text-[11px] text-[#9CA3AF] shrink-0">
                  <span dir="ltr" className="font-tabular text-[#ECEEF2] font-semibold">
                    {inspectorMetrics.total}
                  </span>{' '}
                  درس
                </span>
              </div>

              {/* 5-Stage Stacked Bar */}
              <div className="h-2 bg-[#07080B] rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-[rgba(236,238,242,0.06)]">
                {inspectorMetrics.stages.mastered > 0 && inspectorMetrics.total > 0 && (
                  <div
                    className="bg-[#4EA87E] rounded-full h-full"
                    style={{
                      width: `${Math.max(3, (inspectorMetrics.stages.mastered / inspectorMetrics.total) * 100)}%`,
                    }}
                  />
                )}
                {inspectorMetrics.stages.reviewing > 0 && inspectorMetrics.total > 0 && (
                  <div
                    className="bg-[#C88A36] rounded-full h-full"
                    style={{
                      width: `${Math.max(3, (inspectorMetrics.stages.reviewing / inspectorMetrics.total) * 100)}%`,
                    }}
                  />
                )}
                {inspectorMetrics.stages.summarized > 0 && inspectorMetrics.total > 0 && (
                  <div
                    className="bg-[#5D8AA8] rounded-full h-full"
                    style={{
                      width: `${Math.max(3, (inspectorMetrics.stages.summarized / inspectorMetrics.total) * 100)}%`,
                    }}
                  />
                )}
                {inspectorMetrics.stages.read > 0 && inspectorMetrics.total > 0 && (
                  <div
                    className="bg-[#937CB8] rounded-full h-full"
                    style={{
                      width: `${Math.max(3, (inspectorMetrics.stages.read / inspectorMetrics.total) * 100)}%`,
                    }}
                  />
                )}
              </div>

              {/* Compact Tabular Stage Breakdown List */}
              <div className="grid grid-cols-5 gap-1.5 text-center text-[11px]">
                <div className="py-1.5 px-1 rounded-[7px] bg-[#12141C] border border-[rgba(78,168,126,0.22)]">
                  <CheckCircle2 size={12} className="text-[#4EA87E] mx-auto mb-1" />
                  <span dir="ltr" className="block font-bold font-tabular text-[#ECEEF2]">
                    {inspectorMetrics.stages.mastered}
                  </span>
                  <span className="block text-[9px] text-[#7D8594]">متقن</span>
                </div>

                <div className="py-1.5 px-1 rounded-[7px] bg-[#12141C] border border-[rgba(200,138,54,0.22)]">
                  <Clock size={12} className="text-[#C88A36] mx-auto mb-1" />
                  <span dir="ltr" className="block font-bold font-tabular text-[#ECEEF2]">
                    {inspectorMetrics.stages.reviewing}
                  </span>
                  <span className="block text-[9px] text-[#7D8594]">مراجعة</span>
                </div>

                <div className="py-1.5 px-1 rounded-[7px] bg-[#12141C] border border-[rgba(93,138,168,0.22)]">
                  <FileText size={12} className="text-[#5D8AA8] mx-auto mb-1" />
                  <span dir="ltr" className="block font-bold font-tabular text-[#ECEEF2]">
                    {inspectorMetrics.stages.summarized}
                  </span>
                  <span className="block text-[9px] text-[#7D8594]">تلخيص</span>
                </div>

                <div className="py-1.5 px-1 rounded-[7px] bg-[#12141C] border border-[rgba(147,124,184,0.22)]">
                  <BookOpen size={12} className="text-[#937CB8] mx-auto mb-1" />
                  <span dir="ltr" className="block font-bold font-tabular text-[#ECEEF2]">
                    {inspectorMetrics.stages.read}
                  </span>
                  <span className="block text-[9px] text-[#7D8594]">قراءة</span>
                </div>

                <div className="py-1.5 px-1 rounded-[7px] bg-[#12141C] border border-[rgba(236,238,242,0.08)]">
                  <Circle size={11} className="text-[#6B7280] mx-auto mb-1" />
                  <span dir="ltr" className="block font-bold font-tabular text-[#9CA3AF]">
                    {inspectorMetrics.stages.not_started}
                  </span>
                  <span className="block text-[9px] text-[#7D8594]">متبقي</span>
                </div>
              </div>

              {/* Contextual Drill-Down Action Link */}
              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={
                    inspectorMetrics.subjectId
                      ? `/curriculum/${inspectorMetrics.subjectId}`
                      : '/curriculum'
                  }
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-[8px] bg-[#191C25] hover:bg-[#202430] border border-[rgba(236,238,242,0.12)] text-xs font-semibold text-[#ECEEF2] transition-colors min-h-[38px]"
                >
                  <span>
                    {inspectorMetrics.subjectId
                      ? `فتح فهرس ${inspectorMetrics.title}`
                      : 'تصفح جميع المناهج'}
                  </span>
                  <ArrowUpLeft size={13} className="text-[#D4AF37]" />
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
