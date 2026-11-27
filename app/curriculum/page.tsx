export const dynamic = 'force-dynamic'
export const revalidate = 30

import BottomNav from '@/components/BottomNav'
import SubjectCard from '@/components/SubjectCard'
import { SUBJECTS } from '@/lib/types'
import { BookOpen, CheckCircle2 } from 'lucide-react'

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
          next: { revalidate: 30, tags: ['curriculum'] },
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
  const overallPct = totalLessons ? Math.round((totalMastered / totalLessons) * 100) : 0

  return (
    <main className="min-h-screen lg:pr-60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-24 lg:pb-10">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-7 pb-5 border-b border-[rgba(236,238,242,0.07)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[10px] bg-[#191C25] border border-[rgba(212,175,55,0.32)] flex items-center justify-center text-[#D4AF37]">
              <BookOpen size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#ECEEF2]">شجرة المناهج</h1>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                <span dir="ltr" className="font-tabular text-[#ECEEF2]">{totalLessons}</span> درساً موزعة عبر 4 مواد رئيسية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2 rounded-[10px] bg-[#12141C] border border-[rgba(236,238,242,0.08)]">
            <CheckCircle2 size={16} strokeWidth={1.75} className="text-[#4EA87E]" />
            <div>
              <span className="block text-xs font-bold text-[#ECEEF2] font-tabular">
                <span dir="ltr">{totalMastered}</span> متقن
              </span>
              <span className="block text-[10px] text-[#7D8594] font-tabular">
                إجمالي الإنجاز <span dir="ltr">{overallPct}%</span>
              </span>
            </div>
          </div>
        </header>

        {/* 2x2 Editorial Subject Folio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      </div>

      <BottomNav />
    </main>
  )
}
