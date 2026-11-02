// Supabase Database Types & App Interfaces
export type SubjectId = 6 | 7 | 8 | 9

export interface Subject {
  id: number
  name: string
  icon: string
  color: string
}

export interface UserProfile {
  id?: number
  name: string
  total_xp: number
  current_level: number
  xp_to_next: number
  progress_pct?: number
  level_title?: string
  current_streak: number
  longest_streak: number
  last_study_date: string | null
  total_study_hours: number
  daily_goal_hours: number
  total_reviews: number
  tasks_completed: number
  topics_mastered: number
}

export interface Badge {
  id: number
  code: string
  name: string
  description: string
  icon: string
  rarity: string
}

export interface UserBadge {
  id: number
  badge_id: number
  earned_at: string
  badge?: Badge
}

export interface TopicData {
  id: number
  topic: string
  weight: number
  next_review: string | null
  mastery_level: number
  mastery_label?: string
}

export interface ChapterData {
  chapter_id: number
  chapter_num: number
  chapter_name: string
  mastery_pct: number
  topics: TopicData[]
}

export interface SubjectMasteryData {
  subject_id: number
  subject_name: string
  mastery_pct: number
  total_topics: number
  mastered_topics: number
  not_started: number
  color?: string
  chapters: ChapterData[]
}

export interface RpcMasteryReport {
  subjects: SubjectMasteryData[]
  overall_mastery_pct: number
  generated_at: string
}

export interface StudySession {
  id: number
  subject_id: number
  topic_id: number | null
  duration_minutes: number
  xp_earned: number
  session_type: string
  started_at: string
  ended_at: string | null
}

export interface DayActivity {
  dayName: string
  shortDay: string
  date: string
  hours: number
  isToday: boolean
}

export interface SubjectDetailedProgress {
  id: number
  name: string
  icon: string
  color: string
  study_hours: number
  total_topics: number
  stages: {
    not_started: number  // 0: لم يبدأ
    read: number         // 1: تمت القراءة
    summarized: number   // 2+3: تم التلخيص والحل
    reviewing: number    // 4: تحت المراجعة
    mastered: number     // 5: متقن تماماً
  }
  mastery_percentage: number
}

export interface DashboardAnalytics {
  totalHours: number
  todayHours: number
  dailyGoalHours: number
  weeklyHours: number
  monthlyHours: number
  streakDays: number
  weeklyActivity: DayActivity[]
  subjects: SubjectDetailedProgress[]
}

// Subjects configuration
export const SUBJECTS: Subject[] = [
  { id: 6, name: 'اللغة العربية', icon: '📖', color: 'from-emerald-500 to-teal-600' },
  { id: 7, name: 'البرمجة', icon: '💻', color: 'from-blue-500 to-indigo-600' },
  { id: 8, name: 'اللغة الإنجليزية', icon: '🌍', color: 'from-purple-500 to-violet-600' },
  { id: 9, name: 'التاريخ', icon: '🏛️', color: 'from-amber-500 to-orange-600' },
]
