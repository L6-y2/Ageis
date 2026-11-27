export const dynamic = 'force-dynamic'
export const revalidate = 60

import BottomNav from '@/components/BottomNav'
import { getUserProfile } from '@/lib/api'
import type { UserProfile } from '@/lib/types'
import { Star, Trophy, Lock, ArrowRight, Flame, Zap, Award } from 'lucide-react'
import Link from 'next/link'
import { RankIcon, stripPresentationEmojis } from '@/components/AcademicIcons'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crbfhqpklruvbgcanuoo.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYmZocXBrbHJ1dmJnY2FudW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0Mjc4NTcsImV4cCI6MjEwOTAwMzg1N30.W8YLY_kiGqHvLs5LFDxHP0goL0vRJ18HtzdPLa0mXjY'

async function getAllBadges() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/badges?select=*&order=id`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    next: { revalidate: 60, tags: ['rpg'] },
  })
  if (!res.ok) return []
  return res.json()
}

async function getEarnedBadgeIds(): Promise<number[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/user_badges?select=badge_id`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    next: { revalidate: 60, tags: ['rpg'] },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.map((r: { badge_id: number }) => r.badge_id)
}

export default async function RpgPage() {
  const [profile, allBadges, earnedIds] = await Promise.all([
    getUserProfile().catch((): UserProfile => ({
      id: 1, name: 'Student', total_xp: 0, current_level: 1, xp_to_next: 500,
      progress_pct: 0, level_title: 'مبتدئ',
      current_streak: 0, longest_streak: 0, last_study_date: null,
      total_study_hours: 0, daily_goal_hours: 4, total_reviews: 0,
      tasks_completed: 0, topics_mastered: 0,
    })),
    getAllBadges().catch((): any[] => []),
    getEarnedBadgeIds().catch((): number[] => []),
  ])

  const earned = (allBadges as any[]).filter((b) => earnedIds.includes(b.id))
  const locked = (allBadges as any[]).filter((b) => !earnedIds.includes(b.id))
  const cleanTitle = stripPresentationEmojis(profile.level_title) || 'مستوى التحدي'

  return (
    <main className="min-h-screen lg:pr-60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-24 lg:pb-10">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-7 pb-5 border-b border-[rgba(236,238,242,0.07)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[10px] bg-[#191C25] border border-[rgba(212,175,55,0.32)] flex items-center justify-center text-[#D4AF37]">
              <Trophy size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#ECEEF2]">قاعة الأوسمة والمستوى</h1>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                <span dir="ltr" className="font-tabular text-[#D4AF37] font-semibold">{earned.length}</span> وسام مكتسب من أصل{' '}
                <span dir="ltr" className="font-tabular text-[#ECEEF2]">{allBadges.length}</span>
              </p>
            </div>
          </div>

          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-[#12141C] hover:bg-[#191C25] border border-[rgba(236,238,242,0.10)] text-xs font-medium text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors min-h-[40px]"
          >
            <ArrowRight size={14} />
            <span>الملف الشخصي</span>
          </Link>
        </header>

        <div className="space-y-7">
          {/* Level Prestige Card */}
          <section className="aegis-panel-elevated p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-[#07080B] border-2 border-[rgba(212,175,55,0.45)] rounded-[14px] flex items-center justify-center mx-auto mb-4">
              <RankIcon level={profile.current_level} size={28} />
            </div>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#ECEEF2]">
              المستوى <span dir="ltr" className="font-tabular">{profile.current_level}</span>
            </h2>
            <p className="text-[#D4AF37] font-semibold text-sm mt-1">{cleanTitle}</p>

            <div className="mt-6 pt-5 border-t border-[rgba(236,238,242,0.08)] flex items-center justify-center gap-6 sm:gap-10">
              <div>
                <p dir="ltr" className="text-xl sm:text-2xl font-bold text-[#ECEEF2] font-tabular flex items-center justify-center gap-1.5">
                  <Zap size={16} className="text-[#D4AF37]" />
                  <span>{profile.total_xp.toLocaleString('en-US')}</span>
                </p>
                <p className="text-xs text-[#7D8594] mt-1">نقطة خبرة</p>
              </div>
              <div className="w-px h-10 bg-[rgba(236,238,242,0.08)]" />
              <div>
                <p dir="ltr" className="text-xl sm:text-2xl font-bold text-[#C88A36] font-tabular flex items-center justify-center gap-1.5">
                  <Flame size={16} className="text-[#C88A36]" />
                  <span>{profile.current_streak}</span>
                </p>
                <p className="text-xs text-[#7D8594] mt-1">أيام متتالية</p>
              </div>
              <div className="w-px h-10 bg-[rgba(236,238,242,0.08)]" />
              <div>
                <p dir="ltr" className="text-xl sm:text-2xl font-bold text-[#4EA87E] font-tabular flex items-center justify-center gap-1.5">
                  <Award size={16} className="text-[#4EA87E]" />
                  <span>{earned.length}</span>
                </p>
                <p className="text-xs text-[#7D8594] mt-1">وسام</p>
              </div>
            </div>
          </section>

          {/* Earned Distinction Cabinet */}
          {earned.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-[#ECEEF2] mb-3.5 flex items-center gap-2">
                <Star size={15} className="text-[#D4AF37] fill-[#D4AF37]" />
                <span>أوسمة التميز المكتسبة (<span dir="ltr" className="font-tabular">{earned.length}</span>)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {earned.map((badge: any) => (
                  <article
                    key={badge.id}
                    className="aegis-panel p-4 text-center border-[rgba(212,175,55,0.30)] flex flex-col items-center justify-between gap-2"
                  >
                    <div className="w-11 h-11 rounded-[10px] bg-[rgba(212,175,55,0.10)] border border-[rgba(212,175,55,0.28)] flex items-center justify-center text-[#D4AF37]">
                      <Award size={20} strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-[#ECEEF2] leading-snug">
                        {stripPresentationEmojis(badge.name) || badge.name}
                      </p>
                      {badge.description && (
                        <p className="text-[11px] text-[#9CA3AF] mt-1 leading-relaxed line-clamp-2">
                          {badge.description}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-[6px] bg-[#07080B] border border-[rgba(212,175,55,0.22)] text-[#D4AF37] uppercase">
                      {badge.rarity}
                    </span>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Locked Badges */}
          {locked.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-[#9CA3AF] mb-3.5 flex items-center gap-2">
                <Lock size={15} className="text-[#7D8594]" />
                <span>أوسمة قيد الإنجاز (<span dir="ltr" className="font-tabular">{locked.length}</span>)</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {locked.map((badge: any) => (
                  <article
                    key={badge.id}
                    className="aegis-panel p-4 text-center opacity-60 flex flex-col items-center justify-between gap-2"
                  >
                    <div className="w-11 h-11 rounded-[10px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] flex items-center justify-center text-[#7D8594]">
                      <Lock size={18} strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-[#ECEEF2] leading-snug">
                        {stripPresentationEmojis(badge.name) || badge.name}
                      </p>
                      {badge.description && (
                        <p className="text-[11px] text-[#9CA3AF] mt-1 leading-relaxed line-clamp-2">
                          {badge.description}
                        </p>
                      )}
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-[6px] bg-[#07080B] border border-[rgba(236,238,242,0.07)] text-[#7D8594] uppercase">
                      {badge.rarity}
                    </span>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  )
}
