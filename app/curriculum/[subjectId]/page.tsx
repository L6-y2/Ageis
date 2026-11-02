export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import CurriculumTree from '@/components/CurriculumTree'
import { SUBJECTS } from '@/lib/types'
import { ArrowRight, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://crbfhqpklruvbgcanuoo.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyYmZocXBrbHJ1dmJnY2FudW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0Mjc4NTcsImV4cCI6MjEwOTAwMzg1N30.W8YLY_kiGqHvLs5LFDxHP0goL0vRJ18HtzdPLa0mXjY'

async function getMasteryReport(subjectId: number) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/rpc_get_mastery_report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
      body: JSON.stringify({ p_subject_id: subjectId }),
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function CurriculumSubjectPage({
  params,
}: {
  params: Promise<{ subjectId: string }>
}) {
  const { subjectId } = await params
  const id = parseInt(subjectId)
  const subject = SUBJECTS.find((s) => s.id === id)
  if (!subject) notFound()

  const report = await getMasteryReport(id)
  const subjectData = report?.subjects?.[0]
  const pct = Math.round(subjectData?.mastery_pct ?? 0)

  return (
    <main className="min-h-screen pb-28 pt-6 px-4 sm:px-6">
      {/* Subject Hero Card */}
      <div className="glass-card rounded-3xl p-5 mb-5 relative overflow-hidden border border-slate-800/80">
        <div
          className={`absolute -top-12 -left-12 w-44 h-44 bg-gradient-to-br ${subject.color} opacity-20 rounded-full blur-3xl pointer-events-none`}
        />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <Link
            href="/curriculum"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass text-xs font-bold text-slate-300 hover:text-white transition-colors"
          >
            <ArrowRight size={15} />
            <span>كل المواد</span>
          </Link>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-700/60 text-slate-300">
            {`${subjectData?.total_topics ?? 0} درس`}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.color} flex items-center justify-center text-3xl shadow-xl ring-1 ring-white/20`}
            >
              {subject.icon}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">{subject.name}</h1>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-400" />
                <span>{`${subjectData?.mastered_topics ?? 0} درس متقن`}</span>
                <span className="text-slate-600">•</span>
                <span>{`${(subjectData?.total_topics ?? 0) - (subjectData?.mastered_topics ?? 0) - (subjectData?.not_started ?? 0)} قيد المراجعة`}</span>
              </p>
            </div>
          </div>

          {/* Radial / Percentage Badge */}
          <div className="text-center bg-slate-950/70 border border-slate-800 p-2.5 rounded-2xl">
            <span className="block text-xl font-black text-white tracking-tight">{`${pct}%`}</span>
            <span className="text-[10px] text-slate-500 font-bold">إتقان</span>
          </div>
        </div>
      </div>

      {/* Topics Syllabus Timeline Tree */}
      {report ? (
        <CurriculumTree report={report} subjectColor={subject.color} />
      ) : (
        <div className="text-center text-slate-500 py-20 glass-card rounded-3xl">
          <p>تعذر تحميل بيانات المنهج حالياً</p>
        </div>
      )}

      <BottomNav />
    </main>
  )
}
