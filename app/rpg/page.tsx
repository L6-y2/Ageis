export const dynamic = 'force-dynamic'

import BottomNav from '@/components/BottomNav'
import { getUserProfile } from '@/lib/api'
import type { UserProfile } from '@/lib/types'
import { Star, Trophy, Lock } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function getAllBadges() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/badges?select=*&order=id`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    cache: 'no-store',
  })
  if (!res.ok) return []
  return res.json()
}

async function getEarnedBadgeIds(): Promise<number[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/user_badges?select=badge_id`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    cache: 'no-store',
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
  const locked  = (allBadges as any[]).filter((b) => !earnedIds.includes(b.id))

  return (
    <main className="min-h-screen pb-24">
      <div className="px-4 pt-12 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <Trophy size={24} className="text-amber-400" />
          <h1 className="text-2xl font-black text-white">{'الأوسمة والمستوى'}</h1>
        </div>
        <p className="text-slate-400 text-sm">{`${earned.length} وسام من أصل ${allBadges.length}`}</p>
      </div>

      <div className="px-4 space-y-6">
        {/* Level card */}
        <div className="glass rounded-3xl p-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-3 shadow-xl">
            {'🏆'}
          </div>
          <h2 className="text-3xl font-black text-white">{`المستوى ${profile.current_level}`}</h2>
          <p className="text-amber-400 font-bold text-sm mt-1">{profile.level_title || 'مستوى التحدي'}</p>
          <div className="mt-4 flex items-center justify-center gap-6">
            <div>
              <p className="text-2xl font-bold text-indigo-400">{profile.total_xp.toLocaleString('ar-EG')}</p>
              <p className="text-xs text-slate-400">{'نقطة خبرة'}</p>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div>
              <p className="text-2xl font-bold text-orange-400">{profile.current_streak}</p>
              <p className="text-xs text-slate-400">{'يوم متتالي'}</p>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div>
              <p className="text-2xl font-bold text-emerald-400">{earned.length}</p>
              <p className="text-xs text-slate-400">{'وسام'}</p>
            </div>
          </div>
        </div>

        {/* Earned */}
        {earned.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2">
              <Star size={14} className="text-amber-400" />
              {`أوسمة حصلت عليها (${earned.length})`}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {earned.map((badge: any) => (
                <div key={badge.id} className="glass rounded-2xl p-3 text-center">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <p className="text-xs font-bold text-slate-200 leading-tight">{badge.name}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{badge.rarity}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
              <Lock size={14} />
              {`أوسمة لسه مقفولة (${locked.length})`}
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {locked.map((badge: any) => (
                <div key={badge.id} className="glass rounded-2xl p-3 text-center opacity-40">
                  <div className="text-3xl mb-2 grayscale">{badge.icon}</div>
                  <p className="text-xs font-bold text-slate-400 leading-tight">{badge.name}</p>
                  <p className="text-[10px] text-slate-600 mt-1">{badge.description}</p>
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
