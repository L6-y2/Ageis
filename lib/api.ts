import { supabase } from './supabase'
import type {
  UserProfile,
  UserBadge,
  Badge,
  RpcMasteryReport,
  DashboardAnalytics,
  SubjectDetailedProgress,
  DayActivity,
} from './types'
import { SUBJECTS } from './types'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crbfhqpklruvbgcanuoo.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYmZocXBrbHJ1dmJnY2FudW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0Mjc4NTcsImV4cCI6MjEwOTAwMzg1N30.W8YLY_kiGqHvLs5LFDxHP0goL0vRJ18HtzdPLa0mXjY'

const headers = {
  'Content-Type': 'application/json',
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
}

// ─── Helper: Supabase RPC (server-side) ─────────────────────────────────────
async function rpc<T = any>(funcName: string, params: Record<string, unknown> = {}): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${funcName}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(params),
    cache: 'no-store',
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`RPC ${funcName} failed: ${err}`)
  }
  return res.json()
}

export const LEVEL_TITLES: Record<number, string> = {
  1: 'مبتدئ 🛡️',
  2: 'متعلم 📘',
  3: 'متقدم ⚔️',
  4: 'محترف ⚡',
  5: 'خبير 🔮',
  6: 'أسطورة 👑',
}

export function getCleanLevelTitle(level: number, rawTitle?: string): string {
  if (rawTitle && !rawTitle.includes('ط') && !rawTitle.includes('ظ') && !rawTitle.includes('')) {
    return rawTitle
  }
  return LEVEL_TITLES[level] || `المستوى ${level} 🛡️`
}

export function sanitizeArabicText(text?: string): string {
  if (!text) return ''

  // خريطة تحويل النصوص المكسورة (CP1256 mojibake) → نصوص عربية سليمة
  const mojibakeMap: [RegExp, string][] = [
    [/ط¥ظ†ط¬ط§ط²/g, 'إنجاز'],
    [/ظ…ظ‡ظ…ط©/g, 'مهمة'],
    [/ط¬ظ„ط³ط© ظ…ط°ط§ظƒط±ط©/g, 'جلسة مذاكرة'],
    [/ط¬ظ„ط³ط©/g, 'جلسة'],
    [/ظ…ط°ط§ظƒط±ط©/g, 'مذاكرة'],
    [/ط¯ظ‚ظٹظ‚ط©/g, 'دقيقة'],
    [/ط¯ظ‚ط§ط¦ظ‚/g, 'دقائق'],
    [/ط³ط§ط¹ط©/g, 'ساعة'],
    [/ط¥طھظ‚ط§ظ† ظ…ظˆط¶ظˆط¹/g, 'إتقان موضوع'],
    [/ط¥طھظ‚ط§ظ†/g, 'إتقان'],
    [/ظ…ظˆط¶ظˆط¹/g, 'موضوع'],
    [/ط­ظ„ طھط¯ط±ظٹط¨ط§طھ/g, 'حل تدريبات'],
    [/ظˆط§ط¬ط¨ ط§ظ„ط¯ط±ط³/g, 'واجب الدرس'],
    [/ط§ظ„ظ„ط؛ط© ط§ظ„ط¹ط±ط¨ظٹط©/g, 'اللغة العربية'],
    [/ط§ظ„ط¨ط±ظ…ط¬ط©/g, 'البرمجة'],
    [/ط§ظ„طھط§ط±ظٹط®/g, 'التاريخ'],
    [/ط§ظ„ط¥ظ†ط¬ظ„ظٹط²ظٹط©/g, 'الإنجليزية'],
    [/ط·ط§ظ„ط¨ ط¬ط§ط¯/g, 'طالب جاد'],
    [/ظ…طھط¹ظ„ظ…/g, 'متعلم'],
    [/ط§ظ„ظ‚ط§ظ‡ط±/g, 'القاهر'],
    [/ظƒط§ظ†/g, 'كان'],
    [/ظˆط£ط®ظˆط§طھظ‡ط§/g, 'وأخواتها'],
    [/ط§ظ„ط«ط§ظ†ظٹ/g, 'الثاني'],
    [/ط§ظ„ط£ظˆظ„/g, 'الأول'],
    [/ًں“™/g, '📘'],
    [/ًں”¥/g, '🔥'],
    [/ًں’ھ/g, '💪'],
    [/â–ˆ/g, '█'],
    [/â–‘/g, '░']
  ]

  let result = text
  for (const [regex, replacement] of mojibakeMap) {
    result = result.replace(regex, replacement)
  }

  // إذا تبقى أي حروف كود مكسورة (ط أو ظ متصلة بحروف لاتينية غير مقروءة)، استبدالها بشكل نظيف
  if (/[طظ][^\s\w\u0600-\u06FF]/.test(result)) {
    // محاولة تنظيف ما تبقى من الحروف المتكسرة
    result = result.replace(/[طظ][\u00A0-\u00FF\u2000-\u203F]+/g, '').trim()
  }

  return result
}

// ─── User Profile ─────────────────────────────────────────────────────────
export async function getUserProfile(): Promise<UserProfile> {
  try {
    const player = await rpc('rpc_get_player_profile')
    if (player && typeof player === 'object') {
      const level = player.level ?? player.current_level ?? 1
      return {
        id: 1,
        name: player.name || 'عمر',
        total_xp: player.total_xp ?? 0,
        current_level: level,
        xp_to_next: player.xp_to_next ?? 500,
        progress_pct: player.progress_pct ?? 0,
        level_title: getCleanLevelTitle(level, player.level_title),
        current_streak: player.current_streak ?? 0,
        longest_streak: player.longest_streak ?? 0,
        last_study_date: player.last_study_date ?? null,
        total_study_hours: player.total_hours ?? 0,
        daily_goal_hours: 4,
        total_reviews: player.total_reviews ?? 0,
        tasks_completed: player.tasks_completed ?? 0,
        topics_mastered: player.topics_mastered ?? 0,
      }
    }
  } catch (err) {
    console.warn('rpc_get_player_profile fallback to user_profile table', err)
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/user_profile?select=*&limit=1`, {
    headers,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Failed to fetch user_profile')
  const data = await res.json()
  const raw = data[0] || {}
  const level = raw.current_level ?? 1
  return {
    ...raw,
    current_level: level,
    level_title: getCleanLevelTitle(level, raw.level_title),
  }
}

// ─── Mastery Report ──────────────────────────────────────────────────────────
export async function getMasteryReport(subjectId?: number): Promise<RpcMasteryReport> {
  return rpc<RpcMasteryReport>('rpc_get_mastery_report', subjectId ? { p_subject_id: subjectId } : {})
}

// ─── SM-2 Spaced Repetition Review (p_grade: 0-5) ───────────────────────────
export async function reviewTopic(topicId: number, grade: number) {
  return rpc('rpc_sm2_update', { p_topic_id: topicId, p_grade: grade })
}

// ─── Update Mastery Level Directly (0: لم يقرأ, 1: قراءة, 2: تلخيص, 3: تمارين, 4: مراجعة, 5: متقن)
export async function updateTopicMastery(topicId: number, masteryLevel: number) {
  return rpc('rpc_update_mastery', { p_topic_id: topicId, p_mastery_level: masteryLevel })
}

// ─── Study Session Lifecycle (Start, End, Cancel, Active) ─────────────────
export async function startStudySession(
  subjectId: number,
  notes?: string,
  energyLevel?: string,
  taskRefId?: number,
  taskRefType?: string
) {
  try {
    return await rpc('rpc_start_study_session', {
      p_subject_id: subjectId,
      p_notes: notes || null,
      p_energy_level: energyLevel || 'medium',
      p_task_ref_id: taskRefId || null,
      p_task_ref_type: taskRefType || 'general',
    })
  } catch (err) {
    console.error('startStudySession RPC failed, fallback to direct insert:', err)
    // Fallback: direct insert active session
    const res = await fetch(`${SUPABASE_URL}/rest/v1/study_sessions`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({
        subject_id: subjectId,
        notes: notes || null,
        energy_level: energyLevel || 'medium',
        task_ref_id: taskRefId || null,
        task_ref_type: taskRefType || 'general',
        status: 'active',
        start_time: new Date().toISOString(),
      }),
    })
    const data = await res.json()
    return { success: true, session_id: data?.[0]?.id, status: 'active' }
  }
}

export async function endStudySession(sessionId?: number, notes?: string, energyLevel?: string) {
  try {
    return await rpc('rpc_end_study_session', {
      p_session_id: sessionId || null,
      p_notes: notes || null,
      p_energy_level: energyLevel || null,
    })
  } catch (err) {
    console.error('endStudySession RPC failed:', err)
    return { success: false, error: String(err) }
  }
}

export async function getActiveStudySession() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/study_sessions?status=eq.active&order=start_time.desc&limit=1`, {
      headers,
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data[0] || null
  } catch (err) {
    console.error('getActiveStudySession failed:', err)
    return null
  }
}

export async function cancelStudySession(sessionId?: number) {
  try {
    const filter = sessionId ? `?id=eq.${sessionId}&status=eq.active` : `?status=eq.active`
    const res = await fetch(`${SUPABASE_URL}/rest/v1/study_sessions${filter}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        status: 'cancelled',
        end_time: new Date().toISOString(),
      }),
    })
    return res.ok
  } catch (err) {
    console.error('cancelStudySession failed:', err)
    return false
  }
}

// ─── Record Completed Study Session & Award XP (Legacy Fallback) ────────────
export async function recordStudySession(subjectId: number, durationMinutes: number, topicId?: number) {
  try {
    // Start and immediately end to trigger full XP, streak, and hours calculation
    const startRes = await startStudySession(subjectId, 'جلسة بومودورو مكتملة', 'high', topicId, 'topic')
    const sessionId = startRes?.session_id || startRes?.session?.id
    if (sessionId) {
      return await endStudySession(sessionId, 'تمت بنجاح')
    }

    const res = await fetch(`${SUPABASE_URL}/rest/v1/study_sessions`, {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        subject_id: subjectId,
        topic_id: topicId || null,
        duration_minutes: durationMinutes,
        status: 'completed',
        ended_at: new Date().toISOString(),
      }),
    })
    return res.json()
  } catch (err) {
    console.error('Failed to record session:', err)
    return null
  }
}

// ─── Comprehensive Dashboard Analytics ──────────────────────────────────────
export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  const [profile, sessionsRes, topicsRes] = await Promise.all([
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
    fetch(`${SUPABASE_URL}/rest/v1/study_sessions?select=*&status=eq.completed`, {
      headers,
      cache: 'no-store',
    }).then((r) => (r.ok ? r.json() : [])),
    fetch(`${SUPABASE_URL}/rest/v1/curriculum_topics?select=subject_id,mastery_level`, {
      headers,
      cache: 'no-store',
    }).then((r) => (r.ok ? r.json() : [])),
  ])

  // 1. Calculate hours per subject from sessions
  const subjectHoursMap: Record<number, number> = {}
  let totalMinutes = 0
  let todayMinutes = 0
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  // Week days calculation (last 7 days ending today)
  const arabicDayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
  const arabicShortDays = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']

  const dayMinutesMap: Record<string, number> = {}
  sessionsRes.forEach((sess: any) => {
    const mins = sess.duration_minutes || 0
    totalMinutes += mins

    const sId = sess.subject_id
    if (sId) {
      subjectHoursMap[sId] = (subjectHoursMap[sId] || 0) + mins
    }

    const sessDateStr = sess.start_time ? sess.start_time.split('T')[0] : null
    if (sessDateStr) {
      dayMinutesMap[sessDateStr] = (dayMinutesMap[sessDateStr] || 0) + mins
      if (sessDateStr === todayStr) {
        todayMinutes += mins
      }
    }
  })

  // Build 7-day activity sequence (Saturday -> Friday or last 7 days)
  const weeklyActivity: DayActivity[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const dayOfWeek = d.getDay()
    const dayMins = dayMinutesMap[dateStr] || 0

    weeklyActivity.push({
      dayName: arabicDayNames[dayOfWeek],
      shortDay: arabicShortDays[dayOfWeek],
      date: dateStr,
      hours: Math.round((dayMins / 60) * 10) / 10,
      isToday: dateStr === todayStr,
    })
  }

  // 2. Calculate topic stages per subject
  const subjectTopicsMap: Record<number, { not_started: number; read: number; summarized: number; reviewing: number; mastered: number; total: number }> = {}

  SUBJECTS.forEach((s) => {
    subjectTopicsMap[s.id] = { not_started: 0, read: 0, summarized: 0, reviewing: 0, mastered: 0, total: 0 }
  })

  topicsRes.forEach((t: any) => {
    const sId = t.subject_id
    if (!subjectTopicsMap[sId]) {
      subjectTopicsMap[sId] = { not_started: 0, read: 0, summarized: 0, reviewing: 0, mastered: 0, total: 0 }
    }
    const lvl = t.mastery_level || 0
    subjectTopicsMap[sId].total++

    if (lvl >= 5) subjectTopicsMap[sId].mastered++
    else if (lvl === 4) subjectTopicsMap[sId].reviewing++
    else if (lvl === 2 || lvl === 3) subjectTopicsMap[sId].summarized++
    else if (lvl === 1) subjectTopicsMap[sId].read++
    else subjectTopicsMap[sId].not_started++
  })

  // 3. Assemble detailed subject cards
  const subjects: SubjectDetailedProgress[] = SUBJECTS.map((s) => {
    const tData = subjectTopicsMap[s.id] || { not_started: 0, read: 0, summarized: 0, reviewing: 0, mastered: 0, total: 0 }
    const sMins = subjectHoursMap[s.id] || 0
    const sHours = Math.round((sMins / 60) * 10) / 10

    // Weighted progress percentage
    // mastered=1.0, reviewing=0.75, summarized=0.5, read=0.25
    const weightedPoints =
      tData.mastered * 1.0 +
      tData.reviewing * 0.75 +
      tData.summarized * 0.5 +
      tData.read * 0.25
    const pct = tData.total ? Math.round((weightedPoints / tData.total) * 100) : 0

    return {
      id: s.id,
      name: s.name,
      icon: s.icon,
      color: s.color,
      study_hours: sHours,
      total_topics: tData.total,
      stages: {
        not_started: tData.not_started,
        read: tData.read,
        summarized: tData.summarized,
        reviewing: tData.reviewing,
        mastered: tData.mastered,
      },
      mastery_percentage: pct,
    }
  })

  const totalHours = Math.max(profile.total_study_hours || 0, Math.round((totalMinutes / 60) * 10) / 10)
  const todayHours = Math.round((todayMinutes / 60) * 10) / 10
  const weeklyHours = Math.round(weeklyActivity.reduce((acc, d) => acc + d.hours, 0) * 10) / 10

  return {
    totalHours,
    todayHours,
    dailyGoalHours: profile.daily_goal_hours || 4,
    weeklyHours,
    monthlyHours: totalHours,
    streakDays: profile.current_streak || 0,
    weeklyActivity,
    subjects,
  }
}

// ─── Badges ──────────────────────────────────────────────────────────────────
export async function getAllBadges(): Promise<Badge[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/badges?select=*&order=id`, {
    headers,
    cache: 'no-store',
  })
  if (!res.ok) return []
  return res.json()
}

export async function getEarnedBadgeIds(): Promise<number[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/user_badges?select=badge_id`, {
    headers,
    cache: 'no-store',
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.map((r: { badge_id: number }) => r.badge_id)
}
