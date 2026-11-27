export const dynamic = 'force-dynamic'
export const revalidate = 30

import BottomNav from '@/components/BottomNav'
import { getUserProfile, sanitizeArabicText } from '@/lib/api'
import ProfileAvatarSection from '@/components/ProfileAvatarSection'
import {
  Zap,
  Flame,
  Clock,
  Trophy,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Award,
  CheckSquare,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import { RankIcon, stripPresentationEmojis } from '@/components/AcademicIcons'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crbfhqpklruvbgcanuoo.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYmZocXBrbHJ1dmJnY2FudW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0Mjc4NTcsImV4cCI6MjEwOTAwMzg1N30.W8YLY_kiGqHvLs5LFDxHP0goL0vRJ18HtzdPLa0mXjY'

async function getRecentXpTransactions() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/xp_transactions?select=*&order=earned_at.desc&limit=6`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      next: { revalidate: 15, tags: ['profile'] },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function ProfilePage() {
  const [profile, recentXp] = await Promise.all([
    getUserProfile().catch(() => ({
      name: 'عمر',
      total_xp: 576,
      current_level: 3,
      xp_to_next: 124,
      progress_pct: 69,
      level_title: 'متقدم ⚔️',
      current_streak: 6,
      longest_streak: 6,
      last_study_date: null,
      total_study_hours: 3.9,
      daily_goal_hours: 4,
      total_reviews: 0,
      tasks_completed: 6,
      topics_mastered: 2,
    })),
    getRecentXpTransactions().catch(() => []),
  ])

  const examDate = new Date('2027-06-12T09:00:00')
  const now = new Date()
  const diffMs = examDate.getTime() - now.getTime()
  const diffDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
  const diffMonths = Math.floor(diffDays / 30)
  const remainDays = diffDays % 30

  const levels = [
    { lvl: 1, title: 'مبتدئ', xp: '0 - 100' },
    { lvl: 2, title: 'متعلم', xp: '100 - 300' },
    { lvl: 3, title: 'متقدم', xp: '300 - 700' },
    { lvl: 4, title: 'محترف', xp: '700 - 1,500' },
    { lvl: 5, title: 'خبير', xp: '1,500 - 3,000' },
    { lvl: 6, title: 'أسطورة', xp: '3,000+' },
  ]

  const cleanLevelTitle = stripPresentationEmojis(profile.level_title) || 'متعلم'

  return (
    <main className="min-h-screen lg:pr-60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-24 lg:pb-10">
        {/* Header */}
        <header className="flex items-center justify-between gap-4 mb-7 pb-5 border-b border-[rgba(236,238,242,0.07)]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-[#12141C] hover:bg-[#191C25] border border-[rgba(236,238,242,0.10)] text-xs font-medium text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors min-h-[40px]"
          >
            <ArrowRight size={15} />
            <span>الرئيسية</span>
          </Link>
          <h1 className="text-sm sm:text-base font-bold text-[#ECEEF2]">الملف الشخصي والرتب</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Right Column (5 cols): Identity Dossier + Exam Countdown */}
          <div className="lg:col-span-5 space-y-5">
            {/* Profile Identity Card */}
            <section className="aegis-panel-elevated p-6 text-center">
              <ProfileAvatarSection
                level={profile.current_level}
                levelTitle={cleanLevelTitle}
                name={profile.name || 'عمر'}
              />

              <h2 className="font-editorial text-xl font-bold text-[#ECEEF2] mt-2">
                {profile.name || 'عمر'}
              </h2>
              <p className="text-xs font-semibold text-[#D4AF37] mt-0.5 inline-flex items-center gap-1.5">
                <RankIcon level={profile.current_level} size={13} />
                <span>{cleanLevelTitle}</span>
              </p>

              {/* Stats Ledger */}
              <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-[rgba(236,238,242,0.08)]">
                <div className="p-2">
                  <span dir="ltr" className="block text-base font-bold text-[#ECEEF2] font-tabular">
                    {profile.total_xp.toLocaleString('en-US')}
                  </span>
                  <span className="text-[11px] text-[#7D8594] flex items-center justify-center gap-1 mt-1">
                    <Zap size={11} className="text-[#D4AF37]" />
                    <span>نقاط XP</span>
                  </span>
                </div>
                <div className="p-2 border-x border-[rgba(236,238,242,0.08)]">
                  <span dir="ltr" className="block text-base font-bold text-[#C88A36] font-tabular">
                    {profile.current_streak}
                  </span>
                  <span className="text-[11px] text-[#7D8594] flex items-center justify-center gap-1 mt-1">
                    <Flame size={11} className="text-[#C88A36]" />
                    <span>أيام متصلة</span>
                  </span>
                </div>
                <div className="p-2">
                  <span dir="ltr" className="block text-base font-bold text-[#5D8AA8] font-tabular">
                    {profile.total_study_hours || 0}h
                  </span>
                  <span className="text-[11px] text-[#7D8594] flex items-center justify-center gap-1 mt-1">
                    <Clock size={11} className="text-[#5D8AA8]" />
                    <span>ساعات</span>
                  </span>
                </div>
              </div>
            </section>

            {/* Exam Countdown Card */}
            <section className="aegis-panel p-5 border border-[rgba(212,175,55,0.28)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-[10px] bg-[rgba(212,175,55,0.10)] border border-[rgba(212,175,55,0.32)] flex items-center justify-center text-[#D4AF37] shrink-0">
                  <Calendar size={20} strokeWidth={1.75} />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-medium text-[#7D8594] block">الهدف الأكاديمي الأكبر</span>
                  <h3 className="text-sm font-bold text-[#ECEEF2] mt-0.5">امتحانات نهاية العام</h3>
                  <span className="text-[11px] text-[#D4AF37] font-medium">12 يونيو 2027</span>
                </div>
              </div>
              <div className="px-4 py-2.5 rounded-[10px] bg-[#07080B] border border-[rgba(212,175,55,0.25)] min-w-[84px] text-center shrink-0">
                <span dir="ltr" className="block text-2xl font-bold text-[#D4AF37] font-tabular leading-none">
                  {diffDays}
                </span>
                <span className="block text-[10px] text-[#9CA3AF] font-medium mt-1">يوم متبقي</span>
                {diffMonths > 0 && (
                  <span dir="ltr" className="block text-[10px] text-[#7D8594] font-tabular mt-0.5">
                    {diffMonths}m {remainDays}d
                  </span>
                )}
              </div>
            </section>
          </div>

          {/* Left Column (7 cols): Rank Ledger + XP Audit History */}
          <div className="lg:col-span-7 space-y-5">
            {/* RPG Levels Road */}
            <section className="aegis-panel p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-[rgba(236,238,242,0.07)]">
                <div className="flex items-center gap-2">
                  <Trophy size={17} strokeWidth={1.75} className="text-[#D4AF37]" />
                  <h3 className="font-semibold text-sm sm:text-base text-[#ECEEF2]">مسار الرتب الأكاديمية</h3>
                </div>
                <Link
                  href="/rpg"
                  className="text-xs font-semibold text-[#D4AF37] hover:text-[#E0C058] flex items-center gap-1 py-1 px-2 rounded-[8px] hover:bg-[rgba(212,175,55,0.08)] transition-colors"
                >
                  <span>قاعة الأوسمة الـ 23</span>
                  <ChevronLeft size={14} />
                </Link>
              </div>

              <div className="space-y-2">
                {levels.map((lvl) => {
                  const isCurrent = lvl.lvl === profile.current_level
                  const isCompleted = lvl.lvl < profile.current_level

                  return (
                    <div
                      key={lvl.lvl}
                      className={`p-3.5 rounded-[10px] flex items-center justify-between border transition-colors ${
                        isCurrent
                          ? 'bg-[#191C25] border-[rgba(212,175,55,0.40)]'
                          : isCompleted
                          ? 'bg-[#12141C] border-[rgba(78,168,126,0.22)] opacity-80'
                          : 'bg-[#07080B] border-[rgba(236,238,242,0.06)] opacity-55'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-xs font-bold font-tabular border ${
                            isCurrent
                              ? 'bg-[#D4AF37] border-[#E0C058] text-[#0A0B0E]'
                              : isCompleted
                              ? 'bg-[rgba(78,168,126,0.14)] border-[rgba(78,168,126,0.32)] text-[#4EA87E]'
                              : 'bg-[#12141C] border-[rgba(236,238,242,0.08)] text-[#7D8594]'
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 size={15} /> : lvl.lvl}
                        </div>
                        <div className="flex items-center gap-2">
                          <RankIcon
                            level={lvl.lvl}
                            size={15}
                            className={isCurrent ? 'text-[#D4AF37]' : isCompleted ? 'text-[#4EA87E]' : 'text-[#6B7280]'}
                          />
                          <span className={`text-xs sm:text-sm font-semibold ${isCurrent ? 'text-[#ECEEF2]' : 'text-[#9CA3AF]'}`}>
                            {lvl.title}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[6px] bg-[rgba(212,175,55,0.12)] text-[#D4AF37]">
                              رتبتك الحالية
                            </span>
                          )}
                        </div>
                      </div>
                      <span dir="ltr" className="text-xs text-[#7D8594] font-tabular">
                        {lvl.xp} XP
                      </span>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Recent XP History */}
            {recentXp.length > 0 && (
              <section className="aegis-panel p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[rgba(236,238,242,0.07)]">
                  <TrendingUp size={16} strokeWidth={1.75} className="text-[#4EA87E]" />
                  <h3 className="font-semibold text-sm sm:text-base text-[#ECEEF2]">سجل نقاط الخبرة الأخيرة</h3>
                </div>
                <div className="divide-y divide-[rgba(236,238,242,0.06)]">
                  {recentXp.map((tx: any) => {
                    const sourceLabels: Record<string, string> = {
                      study_session: 'جلسة مذاكرة',
                      topic_mastered: 'إتقان موضوع',
                      task_completed: 'إتمام مهمة',
                      task_done: 'إنجاز مهمة',
                      exam_passed: 'نجاح امتحان',
                      streak_bonus: 'مكافأة الاستمرارية',
                      badge_earned: 'حصل على وسام',
                      manual: 'منحة XP',
                    }
                    const cleanReason = stripPresentationEmojis(sanitizeArabicText(tx.reason))
                    const displayText = cleanReason || sourceLabels[tx.source_type] || tx.source_type || 'نقاط خبرة'

                    const TxIcon =
                      tx.source_type === 'study_session'
                        ? BookOpen
                        : tx.source_type === 'topic_mastered'
                        ? Award
                        : tx.source_type === 'task_completed' || tx.source_type === 'task_done'
                        ? CheckSquare
                        : tx.source_type === 'exam_passed'
                        ? FileText
                        : tx.source_type === 'streak_bonus'
                        ? Flame
                        : Zap

                    return (
                      <div
                        key={tx.id}
                        className="py-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-[7px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] flex items-center justify-center text-[#9CA3AF] shrink-0">
                            <TxIcon size={13} />
                          </div>
                          <span className="text-xs sm:text-sm text-[#ECEEF2] font-medium truncate">
                            {displayText}
                          </span>
                        </div>
                        <span
                          dir="ltr"
                          className="text-xs font-bold text-[#D4AF37] font-tabular shrink-0 px-2 py-0.5 rounded-[6px] bg-[rgba(212,175,55,0.10)]"
                        >
                          +{tx.amount} XP
                        </span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
