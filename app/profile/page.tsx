export const dynamic = 'force-dynamic'

import BottomNav from '@/components/BottomNav'
import { getUserProfile, sanitizeArabicText } from '@/lib/api'
import ProfileAvatarSection from '@/components/ProfileAvatarSection'
import {
  User,
  Shield,
  Zap,
  Flame,
  Clock,
  Trophy,
  Calendar,
  Sparkles,
  Download,
  CheckCircle2,
  ChevronLeft,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function getRecentXpTransactions() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/xp_transactions?select=*&order=earned_at.desc&limit=6`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      cache: 'no-store',
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
      total_xp: 118,
      current_level: 2,
      xp_to_next: 182,
      progress_pct: 9,
      level_title: 'متعلم 📘',
      current_streak: 2,
      longest_streak: 2,
      last_study_date: null,
      total_study_hours: 2.2,
      daily_goal_hours: 4,
      total_reviews: 0,
      tasks_completed: 0,
      topics_mastered: 0,
    })),
    getRecentXpTransactions().catch(() => []),
  ])

  // Exam Target countdown (15 June 2027 or target date)
  const examDate = new Date('2027-06-15T09:00:00')
  const now = new Date()
  const diffDays = Math.max(0, Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

  const levels = [
    { lvl: 1, title: 'مبتدئ 🛡️', xp: '0 - 100' },
    { lvl: 2, title: 'متعلم 📘', xp: '100 - 300' },
    { lvl: 3, title: 'متقدم ⚔️', xp: '300 - 700' },
    { lvl: 4, title: 'محترف ⚡', xp: '700 - 1,500' },
    { lvl: 5, title: 'خبير 🔮', xp: '1,500 - 3,000' },
    { lvl: 6, title: 'أسطورة 👑', xp: '3,000+' },
  ]

  return (
    <main className="min-h-screen pb-28 pt-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs font-bold text-slate-300 hover:text-white transition-colors"
        >
          <ArrowRight size={15} />
          <span>الرئيسية</span>
        </Link>
        <span className="text-xs font-black text-indigo-400">الملف الشخصي والـ RPG</span>
      </div>

      <div className="space-y-5">
        {/* Profile Identity Card */}
        <div className="panel p-6 relative overflow-hidden border border-slate-800 shadow-2xl text-center">
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Interactive User & Aegis Avatar Manager */}
          <ProfileAvatarSection
            level={profile.current_level}
            levelTitle={profile.level_title || 'متعلم 📘'}
            name={profile.name || 'عمر'}
          />

          <h2 className="text-xl font-black text-white">{profile.name || 'عمر'}</h2>
          <p className="text-xs font-bold text-emerald-300 mt-0.5">{profile.level_title || 'متعلم 📘'}</p>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-800/80">
            <div className="p-2">
              <span className="block text-base font-black text-white">{profile.total_xp.toLocaleString('ar-EG')}</span>
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                <Zap size={11} className="text-amber-400" />
                <span>إجمالي الـ XP</span>
              </span>
            </div>
            <div className="p-2 border-x border-slate-800">
              <span className="block text-base font-black text-orange-400">{profile.current_streak}</span>
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                <Flame size={11} className="text-orange-400" />
                <span>أيام مستمرة</span>
              </span>
            </div>
            <div className="p-2">
              <span className="block text-base font-black text-cyan-400">{profile.total_study_hours || 0}h</span>
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 mt-0.5">
                <Clock size={11} className="text-cyan-400" />
                <span>ساعات المذاكرة</span>
              </span>
            </div>
          </div>
        </div>

        {/* Exam Countdown Card */}
        <div className="glass-card rounded-3xl p-5 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 flex items-center justify-center text-amber-400 border border-amber-500/30">
              <Calendar size={22} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400">الهدف الأكبر</span>
              <h3 className="text-sm font-black text-white">امتحانات نهاية العام</h3>
            </div>
          </div>
          <div className="text-left px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <span className="block text-xl font-black text-amber-400 font-mono">{diffDays}</span>
            <span className="text-[10px] text-slate-400 font-bold">يوم متبقي</span>
          </div>
        </div>

        {/* RPG Levels Road */}
        <div className="glass-card rounded-3xl p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-amber-400" />
              <h3 className="font-black text-sm text-white">خريطة الرتب ومسار الـ RPG</h3>
            </div>
            <Link href="/rpg" className="text-xs font-bold text-indigo-400 flex items-center gap-0.5">
              <span>الأوسمة الـ 23</span>
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
                  className={`p-3 rounded-2xl flex items-center justify-between transition-all ${
                    isCurrent
                      ? 'bg-indigo-600/20 border border-indigo-500/50 shadow-md shadow-indigo-600/10'
                      : isCompleted
                      ? 'bg-slate-900/50 border border-slate-800 opacity-60'
                      : 'bg-slate-900/30 border border-slate-800/50 opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                        isCurrent
                          ? 'bg-indigo-600 text-white'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 size={14} /> : lvl.lvl}
                    </div>
                    <span className="text-xs font-bold text-slate-200">{lvl.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{lvl.xp} XP</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent XP History */}
        {recentXp.length > 0 && (
          <div className="glass-card rounded-3xl p-5 border border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-emerald-400" />
              <h3 className="font-black text-sm text-white">سجل نقاط الخبرة الأخيرة</h3>
            </div>
            <div className="space-y-2">
              {recentXp.map((tx: any) => (
                <div
                  key={tx.id}
                  className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
                >
                  <span className="text-xs text-slate-300 font-medium">{sanitizeArabicText(tx.reason)}</span>
                  <span className="text-xs font-black text-indigo-400 font-mono">{`+${tx.amount} XP`}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
