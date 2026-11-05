export const dynamic = 'force-dynamic'
export const revalidate = 0

import BottomNav from '@/components/BottomNav'
import SubjectCard from '@/components/SubjectCard'
import { SUBJECTS } from '@/lib/types'
import { BookOpen, Sparkles, CheckCircle2 } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crbfhqpklruvbgcanuoo.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYmZocXBrbHJ1dmJnY2FudW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0Mjc4NTcsImV4cCI6MjEwOTAwMzg1N30.W8YLY_kiGqHvLs5LFDxHP0goL0vRJ18HtzdPLa0mXjY'

async function getAllSummaries() {
  return Promise.all(
    SUBJECTS.map(async (subject) => {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/rpc_get_mastery_report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SERVICE_KEY,
            Authorization: `Bearer ${SERVICE_KEY}`,
          },
          body: JSON.stringify({ p_subject_id: subject.id }),
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('fail')
        const data = await res.json()
        const s = data?.subjects?.[0]
        return {
          subjectId: subject.id,
          mastered: s?.mastered_topics ?? 0,
          total: s?.total_topics ?? 0,
          percentage: Math.round(s?.mastery_pct ?? 0),
        }
      } catch {
        return { subjectId: subject.id, mastered: 0, total: 0, percentage: 0 }
      }
    })
  )
}

export default async function CurriculumPage() {
  const summaries = await getAllSummaries()
  const totalLessons = summaries.reduce((acc, s) => acc + s.total, 0)
  const totalMastered = summaries.reduce((acc, s) => acc + s.mastered, 0)

  return (
    <main className="min-h-screen pb-28 pt-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-400 border border-indigo-500/30">
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">شجرة المناهج</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {`${totalLessons} درساً عبر 4 مواد رئيسية`}
              </p>
            </div>
          </div>
          <div className="text-left px-3 py-1.5 rounded-xl glass-card border border-emerald-500/30">
            <span className="block text-xs font-black text-emerald-400">{`${totalMastered} متقن`}</span>
            <span className="text-[10px] text-slate-400">إجمالي</span>
          </div>
        </div>
      </div>

      {/* Cards list */}
      <div className="space-y-3.5">
        {summaries.map((s: any) => (
          <SubjectCard
            key={s.subjectId}
            subjectId={s.subjectId}
            mastered={s.mastered}
            total={s.total}
            percentage={s.percentage}
          />
        ))}
      </div>

      <BottomNav />
    </main>
  )
}
