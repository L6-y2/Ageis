export const dynamic = 'force-dynamic'
export const revalidate = 15

import BottomNav from '@/components/BottomNav'
import DashboardOverview from '@/components/DashboardOverview'
import HomeHeader from '@/components/HomeHeader'
import { getUserProfile, getDashboardAnalytics } from '@/lib/api'

export default async function HomePage() {
  const profile = await getUserProfile().catch(() => ({
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
  }))

  const analytics = await getDashboardAnalytics(profile).catch(() => ({
    totalHours: 3.9,
    todayHours: 0,
    dailyGoalHours: 4,
    weeklyHours: 3.9,
    monthlyHours: 3.9,
    streakDays: 6,
    weeklyActivity: [],
    subjects: [],
  }))

  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <main className="min-h-screen pb-28 pt-6 px-4 sm:px-6">
      {/* ─── Top Brand Header ──────────────────────────────────────────────── */}
      <HomeHeader
        today={today}
        name={profile.name || 'عمر'}
        streak={profile.current_streak}
      />

      {/* ─── Main Analytics & Subjects Dashboard ─────────────────────────────── */}
      <DashboardOverview analytics={analytics} profile={profile} />

      <BottomNav />
    </main>
  )
}
