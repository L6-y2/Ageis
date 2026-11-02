export const dynamic = 'force-dynamic'

import BottomNav from '@/components/BottomNav'
import DashboardOverview from '@/components/DashboardOverview'
import HomeHeader from '@/components/HomeHeader'
import { getUserProfile, getDashboardAnalytics } from '@/lib/api'

export default async function HomePage() {
  const [profile, analytics] = await Promise.all([
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
    getDashboardAnalytics().catch(() => ({
      totalHours: 2.2,
      todayHours: 0,
      dailyGoalHours: 4,
      weeklyHours: 2.2,
      monthlyHours: 2.2,
      streakDays: 2,
      weeklyActivity: [],
      subjects: [],
    })),
  ])

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
