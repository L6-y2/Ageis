export const dynamic = 'force-dynamic'
export const revalidate = 30

import { notFound } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import CurriculumTree from '@/components/CurriculumTree'
import { SUBJECTS } from '@/lib/types'
import { ArrowRight, CheckCircle2, CheckSquare, Timer } from 'lucide-react'
import { SubjectIcon, getSubjectTheme } from '@/components/AcademicIcons'

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
      next: { revalidate: 30, tags: ['curriculum'] },
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

  const theme = getSubjectTheme(id)
  const report = await getMasteryReport(id)
  const subjectData = report?.subjects?.[0]
  if (subjectData?.chapters) {
    subjectData.chapters.sort((a: any, b: any) => (a.chapter_num ?? 0) - (b.chapter_num ?? 0))
    subjectData.chapters.forEach((c: any) => {
      if (c.topics) {
        c.topics.sort((a: any, b: any) => a.id - b.id)
      }
    })
  }
  const pct = Math.round(subjectData?.mastery_pct ?? 0)
  const reviewingCount = Math.max(
    0,
    (subjectData?.total_topics ?? 0) -
      (subjectData?.mastered_topics ?? 0) -
      (subjectData?.not_started ?? 0)
  )

  return (
    <main className="min-h-screen lg:pr-60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-24 lg:pb-10">
        {/* Subject Hero Card */}
        <section className="aegis-panel-elevated p-5 sm:p-6 mb-5">
          <div className="flex items-center justify-between gap-3 mb-5">
            <Link
              href="/curriculum"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-[10px] bg-[#12141C] hover:bg-[#202430] border border-[rgba(236,238,242,0.10)] text-xs font-medium text-[#9CA3AF] hover:text-[#ECEEF2] transition-colors min-h-[40px]"
            >
              <ArrowRight size={15} />
              <span>كل المواد</span>
            </Link>

            <span className="text-xs font-tabular px-3 py-1 rounded-[8px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] text-[#9CA3AF]">
              <span dir="ltr" className="text-[#ECEEF2] font-semibold">{subjectData?.total_topics ?? 0}</span> درس
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div
                className={`w-14 h-14 rounded-[12px] ${theme.bgSubtle} border ${theme.border} flex items-center justify-center shrink-0`}
              >
                <SubjectIcon subjectId={id} size={26} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-[#ECEEF2] truncate">{subject.name}</h1>
                <p className="text-xs text-[#9CA3AF] mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-[#4EA87E]" />
                    <span dir="ltr" className="font-tabular text-[#ECEEF2] font-medium">
                      {subjectData?.mastered_topics ?? 0}
                    </span>
                    <span>متقن</span>
                  </span>
                  <span className="text-[#6B7280]">•</span>
                  <span>
                    <span dir="ltr" className="font-tabular text-[#ECEEF2] font-medium">
                      {reviewingCount}
                    </span>{' '}
                    قيد المراجعة والدراسة
                  </span>
                </p>
              </div>
            </div>

            <div className="px-4 py-2.5 rounded-[10px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] text-center min-w-[84px]">
              <span dir="ltr" className={`block text-xl font-bold font-tabular leading-none ${theme.text}`}>
                {pct}%
              </span>
              <span className="block text-[10px] text-[#7D8594] mt-1 font-medium">نسبة الإتقان</span>
            </div>
          </div>
        </section>

        {/* Quick Subject Actions Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <Link
            href="/tasks"
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] bg-[#12141C] hover:bg-[#191C25] border border-[rgba(236,238,242,0.10)] hover:border-[rgba(236,238,242,0.20)] text-xs font-semibold text-[#ECEEF2] transition-colors min-h-[44px]"
          >
            <CheckSquare size={15} className="text-[#4EA87E]" />
            <span>مهام وتكليفات المادة</span>
          </Link>
          <Link
            href={`/focus?subject=${id}`}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-[10px] bg-[#D4AF37] hover:bg-[#E0C058] text-xs font-semibold text-[#0A0B0E] transition-colors min-h-[44px]"
          >
            <Timer size={15} strokeWidth={2} />
            <span>بدء جلسة مذاكرة وبومودورو</span>
          </Link>
        </div>

        {/* Topics Syllabus Timeline Tree */}
        {report ? (
          <CurriculumTree report={report} subjectColor={subject.color} />
        ) : (
          <div className="aegis-panel p-12 text-center text-[#7D8594]">
            <p className="text-sm font-medium">تعذر تحميل بيانات المنهج حالياً</p>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}
