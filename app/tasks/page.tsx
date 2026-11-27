'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BottomNav from '@/components/BottomNav'
import {
  CheckSquare,
  Calendar,
  AlertCircle,
  Clock,
  Plus,
  BookOpen,
  X,
  Loader2,
  CheckCircle2,
  Check,
  HelpCircle,
  Brain,
  Star,
  Flame,
  Layers,
  Sparkles,
  Target,
} from 'lucide-react'
import { SUBJECTS, SpacedReviewTopic } from '@/lib/types'
import { SubjectIcon, getSubjectTheme } from '@/components/AcademicIcons'

type CategoryFilter = 'all' | 'assignments' | 'exams' | 'reviews' | 'lectures' | 'backlog'

// In-memory client cache for instantaneous tab switching and navigation
let cachedTasksData: {
  assignments: any[]
  exams: any[]
  backlog: any[]
  lectures: any[]
  reviews: SpacedReviewTopic[]
} | null = null

export default function TasksPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [loading, setLoading] = useState(!cachedTasksData)
  const [data, setData] = useState<{
    assignments: any[]
    exams: any[]
    backlog: any[]
    lectures: any[]
    reviews: SpacedReviewTopic[]
  }>(
    cachedTasksData || {
      assignments: [],
      exams: [],
      backlog: [],
      lectures: [],
      reviews: [],
    }
  )

  // Spaced Repetition (SM-2) Modal State
  const [reviewModalTopic, setReviewModalTopic] = useState<SpacedReviewTopic | null>(null)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [earnedXpToast, setEarnedXpToast] = useState<{ xp: number; topic: string } | null>(null)
  const [reviewScope, setReviewScope] = useState<'due' | 'all'>('due')

  // Add Item Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [formCategory, setFormCategory] = useState<'assignments' | 'exams' | 'lectures' | 'backlog'>('assignments')
  const [formSubjectId, setFormSubjectId] = useState<number>(SUBJECTS[0].id)
  const [formTitle, setFormTitle] = useState('')
  const [formDueDate, setFormDueDate] = useState('')
  const [formPriority, setFormPriority] = useState('medium')
  const [formHours, setFormHours] = useState('1')
  const [formExamType, setFormExamType] = useState('quiz')
  const [formNotes, setFormNotes] = useState('')

  const fetchTasks = async (showLoading = !cachedTasksData) => {
    try {
      if (showLoading) setLoading(true)
      const res = await fetch(`/api/tasks`, { cache: 'no-store' })
      const json = await res.json()
      const freshData = {
        assignments: json.assignments || [],
        exams: json.exams || [],
        backlog: json.backlog || [],
        lectures: json.lectures || [],
        reviews: json.reviews || [],
      }
      cachedTasksData = freshData
      setData(freshData)
    } catch (e) {
      console.error('Fetch tasks error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  const currentSubject = useMemo(
    () => SUBJECTS.find((s) => s.id === selectedSubjectId),
    [selectedSubjectId]
  )

  const subjectFiltered = useMemo(() => {
    const filterSub = (items: any[]) =>
      selectedSubjectId ? items.filter((item) => item.subject_id === selectedSubjectId) : items

    return {
      assignments: filterSub(data.assignments),
      exams: filterSub(data.exams),
      backlog: filterSub(data.backlog),
      lectures: filterSub(data.lectures),
      reviews: filterSub(data.reviews),
    }
  }, [data, selectedSubjectId])

  const dueReviews = useMemo(() => {
    return subjectFiltered.reviews.filter((r) => {
      const isStudied = (r.mastery_level || 0) > 0
      const isDue = !r.next_review_date || r.next_review_date.split('T')[0] <= todayStr
      return isStudied && isDue
    })
  }, [subjectFiltered.reviews, todayStr])

  const allStudiedReviews = useMemo(() => {
    return subjectFiltered.reviews.filter((r) => (r.mastery_level || 0) > 0)
  }, [subjectFiltered.reviews])

  const subjectTaskCounts = useMemo(() => {
    const counts: Record<
      number,
      { assignments: number; exams: number; backlog: number; lectures: number; reviews: number; total: number }
    > = {}

    SUBJECTS.forEach((s) => {
      counts[s.id] = { assignments: 0, exams: 0, backlog: 0, lectures: 0, reviews: 0, total: 0 }
    })

    data.assignments.filter((a) => a.status !== 'done').forEach((a) => {
      if (counts[a.subject_id]) {
        counts[a.subject_id].assignments++
        counts[a.subject_id].total++
      }
    })

    data.exams.filter((e) => e.status !== 'done').forEach((e) => {
      if (counts[e.subject_id]) {
        counts[e.subject_id].exams++
        counts[e.subject_id].total++
      }
    })

    data.backlog.filter((b) => b.status !== 'cleared').forEach((b) => {
      if (counts[b.subject_id]) {
        counts[b.subject_id].backlog++
        counts[b.subject_id].total++
      }
    })

    data.lectures.filter((l) => l.status !== 'done').forEach((l) => {
      if (counts[l.subject_id]) {
        counts[l.subject_id].lectures++
        counts[l.subject_id].total++
      }
    })

    data.reviews.forEach((r) => {
      const isStudied = (r.mastery_level || 0) > 0
      const isDue = isStudied && (!r.next_review_date || r.next_review_date.split('T')[0] <= todayStr)
      if (isDue && counts[r.subject_id]) {
        counts[r.subject_id].reviews++
        counts[r.subject_id].total++
      }
    })

    return counts
  }, [data, todayStr])

  const totalGlobalPending = useMemo(() => {
    return Object.values(subjectTaskCounts).reduce((acc, c) => acc + c.total, 0)
  }, [subjectTaskCounts])

  const categoryCounts = useMemo(() => {
    const a = subjectFiltered.assignments.filter((i) => i.status !== 'done').length
    const e = subjectFiltered.exams.filter((i) => i.status !== 'done').length
    const r = dueReviews.length
    const l = subjectFiltered.lectures.filter((i) => i.status !== 'done').length
    const b = subjectFiltered.backlog.filter((i) => i.status !== 'cleared').length
    const all = a + e + r + l + b
    return { all, assignments: a, exams: e, reviews: r, lectures: l, backlog: b }
  }, [subjectFiltered, dueReviews])

  const handleToggleStatus = async (table: string, id: number, currentStatus: string) => {
    let newStatus = 'done'
    if (table === 'assignments') {
      newStatus = currentStatus === 'done' ? 'pending' : 'done'
    } else if (table === 'exams') {
      newStatus = currentStatus === 'done' ? 'upcoming' : 'done'
    } else if (table === 'backlog') {
      newStatus = currentStatus === 'cleared' ? 'pending' : 'cleared'
    } else if (table === 'lectures') {
      newStatus = currentStatus === 'done' ? 'pending' : 'done'
    }

    setData((prev) => {
      const updated = {
        ...prev,
        [table]: (prev as any)[table].map((item: any) =>
          item.id === id ? { ...item, status: newStatus } : item
        ),
      }
      cachedTasksData = updated
      return updated
    })

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table, id, status: newStatus }),
      })
    } catch (e) {
      console.error('Update status error:', e)
      fetchTasks()
    }
  }

  const handleRateReview = async (topicId: number, grade: number) => {
    setReviewSubmitting(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: 'reviews', topicId, grade }),
      })
      const json = await res.json()
      if (json.success) {
        try {
          const confetti = (await import('canvas-confetti')).default
          confetti({
            particleCount: 75,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#D4AF37', '#4EA87E', '#ECEEF2', '#C88A36'],
          })
        } catch {}

        const sm2 = json.data
        setData((prev) => {
          const updated = {
            ...prev,
            reviews: prev.reviews.map((r) =>
              r.id === topicId
                ? {
                    ...r,
                    next_review_date: sm2?.next_review_date || new Date(Date.now() + 86400000).toISOString(),
                    mastery_level: sm2?.new_status === 'mastered' ? 5 : Math.min(5, (r.mastery_level || 0) + (grade >= 4 ? 1 : 0)),
                    repetitions: sm2?.repetitions ?? ((r.repetitions || 0) + 1),
                  }
                : r
            ),
          }
          cachedTasksData = updated
          return updated
        })

        const topicName = reviewModalTopic?.topic || ''
        setReviewModalTopic(null)
        setEarnedXpToast({ xp: json.earnedXp || 15, topic: topicName })
        setTimeout(() => setEarnedXpToast(null), 4000)
      }
    } catch (e) {
      console.error('SM-2 review error:', e)
    } finally {
      setReviewSubmitting(false)
    }
  }

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) return
    setSubmitting(true)
    setCreateError(null)

    try {
      const targetTable = formCategory
      let payload: any = {
        table: targetTable,
        subject_id: formSubjectId,
        title: formTitle.trim(),
      }

      if (targetTable === 'assignments') {
        payload.due_date = formDueDate || null
        payload.priority = formPriority
        payload.notes = formNotes
        payload.status = 'pending'
      } else if (targetTable === 'exams') {
        payload.exam_date = formDueDate || null
        payload.exam_type = formExamType
        payload.syllabus_coverage = formNotes
        payload.status = 'upcoming'
      } else if (targetTable === 'backlog') {
        payload.estimated_hours = parseFloat(formHours) || 1
        payload.status = 'pending'
      } else if (targetTable === 'lectures') {
        payload.date = formDueDate || null
        payload.notes = formNotes
        payload.status = 'pending'
      }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const resData = await res.json()

      if (res.ok && resData.success) {
        const newItem = resData.data?.[0] || { ...payload, id: Date.now(), created_at: new Date().toISOString() }
        setData((prev) => {
          const updated = {
            ...prev,
            [targetTable]: [newItem, ...(prev as any)[targetTable]],
          }
          cachedTasksData = updated
          return updated
        })
        setShowAddModal(false)
        setFormTitle('')
        setFormNotes('')
        setFormDueDate('')
        setTimeout(() => fetchTasks(), 500)
      } else {
        const errMsg = resData?.error || 'حدث خطأ أثناء الحفظ'
        setCreateError(errMsg)
      }
    } catch (e: any) {
      console.error('Create item error:', e)
      setCreateError(e?.message || 'فشل الاتصال بالسيرفر')
    } finally {
      setSubmitting(false)
    }
  }

  const openAddModalForSubject = (subjectId?: number, category?: typeof formCategory) => {
    if (subjectId) setFormSubjectId(subjectId)
    else if (selectedSubjectId) setFormSubjectId(selectedSubjectId)
    if (category) setFormCategory(category)
    setCreateError(null)
    setShowAddModal(true)
  }

  return (
    <main className="min-h-screen lg:pr-60" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8 pb-24 lg:pb-10">
        {/* ─── Top Main Header ────────────────────────────────────────────── */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-5 border-b border-[rgba(236,238,242,0.07)]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[10px] bg-[#191C25] border border-[rgba(212,175,55,0.32)] flex items-center justify-center text-[#D4AF37]">
              <CheckSquare size={20} strokeWidth={1.75} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#ECEEF2]">مهام ومناهج المواد</h1>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                إدارة التكليفات ومواعيد الامتحانات ومراجعات التكرار المتباعد
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openAddModalForSubject()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#D4AF37] hover:bg-[#E0C058] text-[#0A0B0E] font-semibold text-xs transition-colors min-h-[44px]"
          >
            <Plus size={16} strokeWidth={2} />
            <span>إضافة مهمة</span>
          </button>
        </header>

        {/* ─── XP Toast Celebration ──────────────────────────────────────── */}
        <AnimatePresence>
          {earnedXpToast && (
            <motion.div
              role="status"
              aria-live="polite"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="mb-5 p-4 rounded-[12px] bg-[#191C25] border border-[rgba(78,168,126,0.38)] border-r-4 border-r-[#4EA87E] flex items-center justify-between gap-3 shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-[8px] bg-[rgba(78,168,126,0.14)] text-[#4EA87E] flex items-center justify-center shrink-0">
                  <Sparkles size={17} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#ECEEF2]">
                    تم تسجيل مراجعة التكرار المتباعد واحتساب نقاط الخبرة
                  </p>
                  <p className="text-[11px] text-[#9CA3AF] truncate">{earnedXpToast.topic}</p>
                </div>
              </div>
              <span
                dir="ltr"
                className="px-3 py-1 rounded-[8px] bg-[rgba(212,175,55,0.14)] border border-[rgba(212,175,55,0.35)] text-[#D4AF37] font-bold font-tabular text-xs shrink-0"
              >
                +{earnedXpToast.xp} XP
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Subject Selector Strip (5-Card Responsive Grid) ─────────────── */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-[#9CA3AF] flex items-center gap-1.5">
              <BookOpen size={14} className="text-[#D4AF37]" />
              <span>تصفية حسب المادة</span>
            </span>
            <span className="text-[11px] text-[#7D8594]">
              {selectedSubjectId ? `المحددة: ${currentSubject?.name}` : 'جميع المواد'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {/* ALL SUBJECTS */}
            <button
              type="button"
              onClick={() => setSelectedSubjectId(null)}
              className={`col-span-2 sm:col-span-1 p-3.5 rounded-[12px] transition-colors flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-2 border text-right sm:text-center min-h-[56px] ${
                selectedSubjectId === null
                  ? 'bg-[#191C25] border-[rgba(212,175,55,0.45)] text-[#ECEEF2]'
                  : 'bg-[#12141C] border-[rgba(236,238,242,0.08)] text-[#9CA3AF] hover:text-[#ECEEF2] hover:border-[rgba(236,238,242,0.18)]'
              }`}
            >
              <div className="flex sm:flex-col items-center gap-2.5 sm:gap-1.5">
                <div
                  className={`w-8 h-8 rounded-[8px] flex items-center justify-center border ${
                    selectedSubjectId === null
                      ? 'bg-[rgba(212,175,55,0.12)] border-[rgba(212,175,55,0.32)] text-[#D4AF37]'
                      : 'bg-[#07080B] border-[rgba(236,238,242,0.08)] text-[#7D8594]'
                  }`}
                >
                  <Layers size={16} />
                </div>
                <span className="text-xs font-semibold">كل المواد</span>
              </div>
              <span
                dir="ltr"
                className={`px-2 py-0.5 rounded-[6px] text-[11px] font-tabular font-semibold ${
                  selectedSubjectId === null
                    ? 'bg-[rgba(212,175,55,0.14)] text-[#D4AF37]'
                    : 'bg-[#07080B] text-[#7D8594]'
                }`}
              >
                {totalGlobalPending}
              </span>
            </button>

            {/* DYNAMIC SUBJECTS */}
            {SUBJECTS.map((s) => {
              const isSelected = selectedSubjectId === s.id
              const count = subjectTaskCounts[s.id]?.total || 0
              const theme = getSubjectTheme(s.id)

              return (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => setSelectedSubjectId(s.id)}
                  className={`p-3.5 rounded-[12px] transition-colors flex flex-col items-center justify-center gap-2 border text-center min-h-[86px] ${
                    isSelected
                      ? `bg-[#191C25] ${theme.border} text-[#ECEEF2]`
                      : 'bg-[#12141C] border-[rgba(236,238,242,0.08)] text-[#9CA3AF] hover:text-[#ECEEF2] hover:border-[rgba(236,238,242,0.18)]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-[8px] flex items-center justify-center border ${
                      isSelected
                        ? `${theme.bgSubtle} ${theme.border}`
                        : 'bg-[#07080B] border-[rgba(236,238,242,0.08)]'
                    }`}
                  >
                    <SubjectIcon subjectId={s.id} size={16} />
                  </div>
                  <span className="text-xs font-semibold leading-tight">{s.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-[6px] text-[10px] font-tabular font-semibold ${
                      isSelected ? `${theme.bgSubtle} ${theme.text}` : 'bg-[#07080B] text-[#7D8594]'
                    }`}
                  >
                    <span dir="ltr">{count}</span> معلقة
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* ─── Selected Subject Focus Banner ──────────────────────────────── */}
        {currentSubject && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="mb-5 p-4 sm:p-5 rounded-[14px] aegis-panel-elevated flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div
                className={`w-11 h-11 rounded-[10px] ${getSubjectTheme(currentSubject.id).bgSubtle} border ${getSubjectTheme(currentSubject.id).border} flex items-center justify-center shrink-0`}
              >
                <SubjectIcon subjectId={currentSubject.id} size={20} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#ECEEF2]">{currentSubject.name}</h2>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-[6px] bg-[#07080B] text-[#9CA3AF] border border-[rgba(236,238,242,0.08)]">
                    مساحة المادة
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-[#9CA3AF] flex-wrap">
                  <span className="text-[#4EA87E] font-medium">
                    <span dir="ltr" className="font-tabular">{subjectTaskCounts[currentSubject.id]?.assignments || 0}</span> واجبات
                  </span>
                  <span className="text-[#6B7280]">•</span>
                  <span className="text-[#C88A36] font-medium">
                    <span dir="ltr" className="font-tabular">{subjectTaskCounts[currentSubject.id]?.exams || 0}</span> امتحانات
                  </span>
                  <span className="text-[#6B7280]">•</span>
                  <span className="text-[#937CB8] font-medium">
                    <span dir="ltr" className="font-tabular">{subjectTaskCounts[currentSubject.id]?.reviews || 0}</span> مراجعات
                  </span>
                  <span className="text-[#6B7280]">•</span>
                  <span className="text-[#5D8AA8] font-medium">
                    <span dir="ltr" className="font-tabular">{subjectTaskCounts[currentSubject.id]?.lectures || 0}</span> محاضرات
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openAddModalForSubject(currentSubject.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] bg-[#12141C] hover:bg-[#202430] text-[#ECEEF2] border border-[rgba(236,238,242,0.14)] text-xs font-semibold transition-colors min-h-[40px]"
            >
              <Plus size={14} className="text-[#D4AF37]" />
              <span>إضافة للمادة</span>
            </button>
          </motion.div>
        )}

        {/* ─── Category Filter Tabs (3x2 Mobile, 6-Col Desktop) ─────────────── */}
        <div
          role="tablist"
          aria-label="تصنيف المهام"
          className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1.5 rounded-[12px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] mb-6"
        >
          {[
            { id: 'all', label: 'الكل', count: categoryCounts.all },
            { id: 'assignments', label: 'الواجبات', count: categoryCounts.assignments },
            { id: 'exams', label: 'الامتحانات', count: categoryCounts.exams },
            { id: 'reviews', label: 'التكرار', count: categoryCounts.reviews },
            { id: 'lectures', label: 'المحاضرات', count: categoryCounts.lectures },
            { id: 'backlog', label: 'التراكمات', count: categoryCounts.backlog },
          ].map((tab) => {
            const isActive = categoryFilter === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setCategoryFilter(tab.id as CategoryFilter)}
                className={`py-2 px-2 rounded-[8px] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 min-h-[42px] border ${
                  isActive
                    ? 'bg-[#191C25] text-[#ECEEF2] border-[rgba(212,175,55,0.35)]'
                    : 'text-[#9CA3AF] hover:text-[#ECEEF2] border-transparent'
                }`}
              >
                <span className="truncate">{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    dir="ltr"
                    className={`px-1.5 py-0.5 rounded-[6px] text-[10px] font-tabular ${
                      isActive
                        ? 'bg-[rgba(212,175,55,0.14)] text-[#D4AF37]'
                        : 'bg-[#12141C] text-[#7D8594]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ─── Main Content Stream ────────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-[12px] bg-[#12141C] border border-[rgba(236,238,242,0.07)]" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* SECTION 1: SPACED REPETITION (REVIEWS) */}
            {(categoryFilter === 'all' || categoryFilter === 'reviews') && (
              <section className="space-y-3">
                {categoryFilter === 'all' && dueReviews.length > 0 && (
                  <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-xs font-bold text-[#937CB8]">
                      <Brain size={15} />
                      <span>مراجعات التكرار المتباعد المستحقة اليوم</span>
                    </h2>
                    <span className="text-[11px] text-[#937CB8] font-tabular bg-[rgba(147,124,184,0.10)] px-2.5 py-0.5 rounded-[6px] border border-[rgba(147,124,184,0.28)]">
                      <span dir="ltr">{dueReviews.length}</span> مستحق
                    </span>
                  </div>
                )}

                {categoryFilter === 'reviews' && (
                  <div className="aegis-panel p-5 mb-3 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Brain size={17} className="text-[#937CB8]" />
                        <h2 className="font-semibold text-sm text-[#ECEEF2]">نظام التكرار المتباعد الخوارزمي (SM-2)</h2>
                      </div>
                      <span className="text-[11px] font-tabular font-semibold text-[#937CB8] px-2.5 py-0.5 rounded-[6px] bg-[rgba(147,124,184,0.10)] border border-[rgba(147,124,184,0.28)]">
                        {reviewScope === 'due' ? `${dueReviews.length} مستحق` : `${allStudiedReviews.length} مجدول`}
                      </span>
                    </div>
                    <p className="text-xs text-[#9CA3AF] leading-relaxed">
                      المراجعة في مواعيد الاستحقاق تثبّت الدروس في الذاكرة طويلة المدى بأقل مجهود ممكن.
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setReviewScope('due')}
                        className={`px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-colors min-h-[40px] border flex items-center gap-1.5 ${
                          reviewScope === 'due'
                            ? 'bg-[#191C25] border-[rgba(147,124,184,0.45)] text-[#ECEEF2]'
                            : 'bg-[#07080B] border-[rgba(236,238,242,0.08)] text-[#9CA3AF] hover:text-[#ECEEF2]'
                        }`}
                      >
                        <Flame size={13} className="text-[#C88A36]" />
                        <span>المستحق الآن (<span dir="ltr" className="font-tabular">{dueReviews.length}</span>)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setReviewScope('all')}
                        className={`px-3.5 py-2 rounded-[10px] text-xs font-semibold transition-colors min-h-[40px] border flex items-center gap-1.5 ${
                          reviewScope === 'all'
                            ? 'bg-[#191C25] border-[rgba(147,124,184,0.45)] text-[#ECEEF2]'
                            : 'bg-[#07080B] border-[rgba(236,238,242,0.08)] text-[#9CA3AF] hover:text-[#ECEEF2]'
                        }`}
                      >
                        <Calendar size={13} className="text-[#937CB8]" />
                        <span>كل الدروس المفعلة (<span dir="ltr" className="font-tabular">{allStudiedReviews.length}</span>)</span>
                      </button>
                    </div>
                  </div>
                )}

                {(() => {
                  const reviewsToRender = categoryFilter === 'reviews' && reviewScope === 'all' ? allStudiedReviews : dueReviews

                  if (categoryFilter === 'reviews' && reviewsToRender.length === 0) {
                    return (
                      <EmptyState
                        title={reviewScope === 'due' ? 'لا توجد مراجعات مستحقة اليوم' : 'لا توجد دروس قيد المراجعة'}
                        subtitle="جميع الدروس المجدولة تمت مراجعتها في موعدها، يمكنك إضافة مهام أخرى أو العودة غداً"
                        onAdd={() => openAddModalForSubject()}
                      />
                    )
                  }

                  return reviewsToRender.map((topic) => {
                    const subject = SUBJECTS.find((s) => s.id === topic.subject_id)
                    const isDue = !topic.next_review_date || topic.next_review_date.split('T')[0] <= todayStr

                    return (
                      <div
                        key={`review-${topic.id}`}
                        className={`aegis-panel p-4 flex items-center justify-between gap-3 ${
                          isDue ? 'border-[rgba(147,124,184,0.35)]' : ''
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            {subject && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] text-[#9CA3AF]">
                                <SubjectIcon subjectId={subject.id} size={11} />
                                <span>{subject.name}</span>
                              </span>
                            )}
                            {topic.chapter && (
                              <span className="text-[11px] text-[#7D8594] truncate max-w-[180px]">
                                {topic.chapter}
                              </span>
                            )}
                          </div>

                          <h3 className="font-semibold text-sm text-[#ECEEF2] truncate">{topic.topic}</h3>

                          <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                            {isDue ? (
                              <span className="text-[#C88A36] font-semibold flex items-center gap-1">
                                <Flame size={12} />
                                <span>مستحق المراجعة</span>
                              </span>
                            ) : (
                              <span className="text-[#9CA3AF] flex items-center gap-1">
                                <Calendar size={11} />
                                <span>{`الموعد: ${new Date(topic.next_review_date!).toLocaleDateString('ar-EG')}`}</span>
                              </span>
                            )}

                            <span className="text-[#9CA3AF] flex items-center gap-1 font-tabular">
                              <Star size={11} className={topic.mastery_level > 0 ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-[#6B7280]'} />
                              <span>الإتقان <span dir="ltr">{topic.mastery_level || 0}/5</span></span>
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setReviewModalTopic(topic)}
                          className="px-3.5 py-2 rounded-[10px] bg-[#191C25] hover:bg-[#202430] border border-[rgba(147,124,184,0.40)] text-[#ECEEF2] font-semibold text-xs shrink-0 flex items-center gap-1.5 transition-colors min-h-[42px]"
                        >
                          <Brain size={14} className="text-[#937CB8]" />
                          <span>مراجعة</span>
                        </button>
                      </div>
                    )
                  })
                })()}
              </section>
            )}

            {/* SECTION 2: EXAMS */}
            {(categoryFilter === 'all' || categoryFilter === 'exams') && (
              <section className="space-y-3">
                {categoryFilter === 'all' && subjectFiltered.exams.filter((e) => e.status !== 'done').length > 0 && (
                  <h2 className="flex items-center gap-2 text-xs font-bold text-[#C88A36]">
                    <Target size={15} />
                    <span>الامتحانات القادمة</span>
                  </h2>
                )}

                {categoryFilter === 'exams' && subjectFiltered.exams.length === 0 ? (
                  <EmptyState
                    title={currentSubject ? `لا توجد امتحانات مسجلة في ${currentSubject.name}` : 'لا توجد امتحانات مسجلة'}
                    subtitle="سجّل مواعيد الامتحانات والاختبارات القصيرة لترتيب خطة المذاكرة مبكراً"
                    onAdd={() => openAddModalForSubject(selectedSubjectId || undefined, 'exams')}
                  />
                ) : (
                  subjectFiltered.exams.map((item) => {
                    const subject = SUBJECTS.find((s) => s.id === item.subject_id)
                    const isDone = item.status === 'done'

                    return (
                      <div
                        key={`exam-${item.id}`}
                        className={`aegis-panel p-4 flex items-center justify-between gap-3 transition-opacity ${
                          isDone ? 'opacity-55' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus('exams', item.id, item.status)}
                            aria-label={isDone ? `إلغاء إتمام ${item.title}` : `تحديد ${item.title} كمكتمل`}
                            className="w-11 h-11 -mr-2 flex items-center justify-center shrink-0 rounded-[10px]"
                          >
                            <span
                              className={`w-6 h-6 rounded-[7px] flex items-center justify-center transition-colors border ${
                                isDone
                                  ? 'bg-[#4EA87E] border-[#4EA87E] text-[#0A0B0E]'
                                  : 'bg-[#07080B] border-[rgba(236,238,242,0.22)] hover:border-[#C88A36] text-transparent'
                              }`}
                            >
                              <Check size={14} strokeWidth={2.5} />
                            </span>
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm text-[#ECEEF2] truncate ${isDone ? 'line-through text-[#7D8594]' : ''}`}>
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {subject && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] text-[#9CA3AF]">
                                  <SubjectIcon subjectId={subject.id} size={11} />
                                  <span>{subject.name}</span>
                                </span>
                              )}
                              {item.exam_date && (
                                <span className="text-[11px] text-[#C88A36] flex items-center gap-1 font-medium">
                                  <Calendar size={11} />
                                  <span>{new Date(item.exam_date).toLocaleDateString('ar-EG')}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-[8px] bg-[rgba(200,138,54,0.10)] text-[#C88A36] border border-[rgba(200,138,54,0.28)] shrink-0">
                          {item.exam_type || 'اختبار'}
                        </span>
                      </div>
                    )
                  })
                )}
              </section>
            )}

            {/* SECTION 3: ASSIGNMENTS */}
            {(categoryFilter === 'all' || categoryFilter === 'assignments') && (
              <section className="space-y-3">
                {categoryFilter === 'all' && subjectFiltered.assignments.filter((a) => a.status !== 'done').length > 0 && (
                  <h2 className="flex items-center gap-2 text-xs font-bold text-[#4EA87E]">
                    <CheckSquare size={15} />
                    <span>الواجبات والتكليفات</span>
                  </h2>
                )}

                {categoryFilter === 'assignments' && subjectFiltered.assignments.length === 0 ? (
                  <EmptyState
                    title={currentSubject ? `لا توجد واجبات في ${currentSubject.name}` : 'لا توجد واجبات مسجلة حالياً'}
                    subtitle="اضغط على زر إضافة مهمة لتسجيل واجب أو تكليف جديد"
                    onAdd={() => openAddModalForSubject(selectedSubjectId || undefined, 'assignments')}
                  />
                ) : (
                  subjectFiltered.assignments.map((item) => {
                    const subject = SUBJECTS.find((s) => s.id === item.subject_id)
                    const isDone = item.status === 'done'

                    return (
                      <div
                        key={`assign-${item.id}`}
                        className={`aegis-panel p-4 flex items-center justify-between gap-3 transition-opacity ${
                          isDone ? 'opacity-55' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus('assignments', item.id, item.status)}
                            aria-label={isDone ? `إلغاء إتمام ${item.title}` : `تحديد ${item.title} كمكتمل`}
                            className="w-11 h-11 -mr-2 flex items-center justify-center shrink-0 rounded-[10px]"
                          >
                            <span
                              className={`w-6 h-6 rounded-[7px] flex items-center justify-center transition-colors border ${
                                isDone
                                  ? 'bg-[#4EA87E] border-[#4EA87E] text-[#0A0B0E]'
                                  : 'bg-[#07080B] border-[rgba(236,238,242,0.22)] hover:border-[#4EA87E] text-transparent'
                              }`}
                            >
                              <Check size={14} strokeWidth={2.5} />
                            </span>
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm text-[#ECEEF2] truncate ${isDone ? 'line-through text-[#7D8594]' : ''}`}>
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {subject && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] text-[#9CA3AF]">
                                  <SubjectIcon subjectId={subject.id} size={11} />
                                  <span>{subject.name}</span>
                                </span>
                              )}
                              {item.due_date && (
                                <span className="text-[11px] text-[#9CA3AF] flex items-center gap-1">
                                  <Clock size={11} className="text-[#C88A36]" />
                                  <span>{new Date(item.due_date).toLocaleDateString('ar-EG')}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-[8px] border shrink-0 ${
                            item.priority === 'high'
                              ? 'bg-[rgba(201,91,102,0.10)] text-[#E58992] border-[rgba(201,91,102,0.28)]'
                              : item.priority === 'medium'
                              ? 'bg-[rgba(200,138,54,0.10)] text-[#C88A36] border-[rgba(200,138,54,0.28)]'
                              : 'bg-[#07080B] text-[#9CA3AF] border-[rgba(236,238,242,0.08)]'
                          }`}
                        >
                          {item.priority === 'high' ? 'عاجل' : item.priority === 'medium' ? 'متوسط' : 'عادي'}
                        </span>
                      </div>
                    )
                  })
                )}
              </section>
            )}

            {/* SECTION 4: LECTURES */}
            {(categoryFilter === 'all' || categoryFilter === 'lectures') && (
              <section className="space-y-3">
                {categoryFilter === 'all' && subjectFiltered.lectures.filter((l) => l.status !== 'done').length > 0 && (
                  <h2 className="flex items-center gap-2 text-xs font-bold text-[#5D8AA8]">
                    <BookOpen size={15} />
                    <span>المحاضرات والحصص</span>
                  </h2>
                )}

                {categoryFilter === 'lectures' && subjectFiltered.lectures.length === 0 ? (
                  <EmptyState
                    title={currentSubject ? `لا توجد محاضرات في ${currentSubject.name}` : 'لا توجد محاضرات مسجلة'}
                    subtitle="سجّل مواعيد حصصك ومحاضراتك القادمة لمتابعة الحضور"
                    onAdd={() => openAddModalForSubject(selectedSubjectId || undefined, 'lectures')}
                  />
                ) : (
                  subjectFiltered.lectures.map((item) => {
                    const subject = SUBJECTS.find((s) => s.id === item.subject_id)
                    const isAttended = item.status === 'done'

                    return (
                      <div
                        key={`lec-${item.id}`}
                        className={`aegis-panel p-4 flex items-center justify-between gap-3 transition-opacity ${
                          isAttended ? 'opacity-55' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus('lectures', item.id, item.status)}
                            aria-label={isAttended ? `إلغاء حضور ${item.title}` : `تأكيد حضور ${item.title}`}
                            className="w-11 h-11 -mr-2 flex items-center justify-center shrink-0 rounded-[10px]"
                          >
                            <span
                              className={`w-6 h-6 rounded-[7px] flex items-center justify-center transition-colors border ${
                                isAttended
                                  ? 'bg-[#5D8AA8] border-[#5D8AA8] text-[#0A0B0E]'
                                  : item.status === 'missed'
                                  ? 'bg-[rgba(201,91,102,0.18)] border-[#C95B66] text-[#E58992]'
                                  : 'bg-[#07080B] border-[rgba(236,238,242,0.22)] hover:border-[#5D8AA8] text-transparent'
                              }`}
                            >
                              <Check size={14} strokeWidth={2.5} />
                            </span>
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm text-[#ECEEF2] truncate ${isAttended ? 'line-through text-[#7D8594]' : ''}`}>
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {subject && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] text-[#9CA3AF]">
                                  <SubjectIcon subjectId={subject.id} size={11} />
                                  <span>{subject.name}</span>
                                </span>
                              )}
                              {item.date && (
                                <span className="text-[11px] text-[#5D8AA8] flex items-center gap-1 font-medium">
                                  <Calendar size={11} />
                                  <span>{new Date(item.date).toLocaleDateString('ar-EG')}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-[8px] border shrink-0 ${
                            isAttended
                              ? 'bg-[rgba(78,168,126,0.10)] text-[#4EA87E] border-[rgba(78,168,126,0.28)]'
                              : item.status === 'missed'
                              ? 'bg-[rgba(201,91,102,0.10)] text-[#E58992] border-[rgba(201,91,102,0.28)]'
                              : 'bg-[rgba(93,138,168,0.10)] text-[#5D8AA8] border-[rgba(93,138,168,0.28)]'
                          }`}
                        >
                          {isAttended ? 'تم الحضور' : item.status === 'missed' ? 'فائتة' : 'قادمة'}
                        </span>
                      </div>
                    )
                  })
                )}
              </section>
            )}

            {/* SECTION 5: BACKLOG */}
            {(categoryFilter === 'all' || categoryFilter === 'backlog') && (
              <section className="space-y-3">
                {categoryFilter === 'all' && subjectFiltered.backlog.filter((b) => b.status !== 'cleared').length > 0 && (
                  <h2 className="flex items-center gap-2 text-xs font-bold text-[#E58992]">
                    <Clock size={15} />
                    <span>التراكمات الدراسية</span>
                  </h2>
                )}

                {categoryFilter === 'backlog' && subjectFiltered.backlog.length === 0 ? (
                  <EmptyState
                    title="لا توجد تراكمات مسجلة"
                    subtitle="إذا تأخر عليك درس أو مراجعة يمكنك تسجيله هنا لجدولته لاحقاً"
                    onAdd={() => openAddModalForSubject(selectedSubjectId || undefined, 'backlog')}
                  />
                ) : (
                  subjectFiltered.backlog.map((item) => {
                    const subject = SUBJECTS.find((s) => s.id === item.subject_id)
                    const isCleared = item.status === 'cleared'

                    return (
                      <div
                        key={`back-${item.id}`}
                        className={`aegis-panel p-4 flex items-center justify-between gap-3 transition-opacity ${
                          isCleared ? 'opacity-55' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus('backlog', item.id, item.status)}
                            aria-label={isCleared ? `إعادة فتح ${item.title}` : `تصفية ${item.title}`}
                            className="w-11 h-11 -mr-2 flex items-center justify-center shrink-0 rounded-[10px]"
                          >
                            <span
                              className={`w-6 h-6 rounded-[7px] flex items-center justify-center transition-colors border ${
                                isCleared
                                  ? 'bg-[#4EA87E] border-[#4EA87E] text-[#0A0B0E]'
                                  : 'bg-[#07080B] border-[rgba(236,238,242,0.22)] hover:border-[#C95B66] text-transparent'
                              }`}
                            >
                              <Check size={14} strokeWidth={2.5} />
                            </span>
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm text-[#ECEEF2] truncate ${isCleared ? 'line-through text-[#7D8594]' : ''}`}>
                              {item.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {subject && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-[6px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] text-[#9CA3AF]">
                                  <SubjectIcon subjectId={subject.id} size={11} />
                                  <span>{subject.name}</span>
                                </span>
                              )}
                              <span className="text-[11px] text-[#9CA3AF] flex items-center gap-1 font-tabular">
                                <Clock size={11} className="text-[#E58992]" />
                                <span><span dir="ltr">{item.estimated_hours || 1}h</span> تقديرية</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-[8px] border shrink-0 ${
                            isCleared
                              ? 'bg-[rgba(78,168,126,0.10)] text-[#4EA87E] border-[rgba(78,168,126,0.28)]'
                              : 'bg-[rgba(201,91,102,0.10)] text-[#E58992] border-[rgba(201,91,102,0.28)]'
                          }`}
                        >
                          {isCleared ? 'تمت التصفية' : 'متراكم'}
                        </span>
                      </div>
                    )
                  })
                )}
              </section>
            )}

            {/* EMPTY OVERALL STATE */}
            {categoryFilter === 'all' && categoryCounts.all === 0 && (
              <EmptyState
                title={currentSubject ? `لا توجد مهام معلقة في ${currentSubject.name}` : 'لا توجد مهام معلقة حالياً'}
                subtitle="سجل مهامك أو مواعيد امتحاناتك القادمة لتبقى خطتك الدراسية منظمة"
                onAdd={() => openAddModalForSubject(selectedSubjectId || undefined)}
              />
            )}
          </div>
        )}
      </div>

      {/* ─── Spaced Repetition (SM-2) Interactive Recall Modal ─────────── */}
      <AnimatePresence>
        {reviewModalTopic && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[rgba(6,7,10,0.82)] backdrop-blur-md">
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="sm2-modal-title"
              className="w-full max-w-md bg-[#191C25] border border-[rgba(236,238,242,0.14)] rounded-t-[18px] sm:rounded-[16px] p-5 sm:p-6 shadow-[0_20px_48px_-8px_rgba(0,0,0,0.8)] relative"
            >
              <div className="sm:hidden w-10 h-1 rounded-full bg-[rgba(236,238,242,0.18)] mx-auto mb-3" />

              <div className="flex items-center justify-between pb-4 border-b border-[rgba(236,238,242,0.08)] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[10px] bg-[rgba(147,124,184,0.14)] border border-[rgba(147,124,184,0.32)] text-[#937CB8] flex items-center justify-center">
                    <Brain size={18} />
                  </div>
                  <div>
                    <h3 id="sm2-modal-title" className="font-bold text-[#ECEEF2] text-sm">تقييم استرجاع المعلومة</h3>
                    <span className="text-[11px] text-[#937CB8] font-medium">خوارزمية SM-2 للتكرار المتباعد</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewModalTopic(null)}
                  aria-label="إغلاق التقييم"
                  className="w-9 h-9 rounded-[10px] bg-[#12141C] border border-[rgba(236,238,242,0.10)] text-[#9CA3AF] hover:text-[#ECEEF2] flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-3.5 rounded-[10px] bg-[#07080B] border border-[rgba(236,238,242,0.08)] mb-4">
                <p className="text-[11px] text-[#7D8594] mb-0.5">{reviewModalTopic.chapter || 'الدرس المستهدف'}</p>
                <h4 className="font-semibold text-sm text-[#ECEEF2]">{reviewModalTopic.topic}</h4>
              </div>

              <p className="text-xs text-[#9CA3AF] mb-3">
                قيّم مدى سهولة استرجاعك للدرس لتحديد موعد التكرار القادم:
              </p>

              <div className="space-y-2">
                <button
                  type="button"
                  disabled={reviewSubmitting}
                  onClick={() => handleRateReview(reviewModalTopic.id, 5)}
                  className="w-full flex items-center justify-between p-3.5 rounded-[10px] bg-[rgba(78,168,126,0.10)] hover:bg-[rgba(78,168,126,0.16)] border border-[rgba(78,168,126,0.30)] text-[#4EA87E] font-semibold text-xs transition-colors min-h-[46px]"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>متقن وسهل جداً (درجة 5)</span>
                  </span>
                  <span dir="ltr" className="text-[11px] font-tabular px-2 py-0.5 rounded-[6px] bg-[rgba(78,168,126,0.14)]">
                    +15 XP
                  </span>
                </button>

                <button
                  type="button"
                  disabled={reviewSubmitting}
                  onClick={() => handleRateReview(reviewModalTopic.id, 4)}
                  className="w-full flex items-center justify-between p-3.5 rounded-[10px] bg-[rgba(93,138,168,0.10)] hover:bg-[rgba(93,138,168,0.16)] border border-[rgba(93,138,168,0.30)] text-[#5D8AA8] font-semibold text-xs transition-colors min-h-[46px]"
                >
                  <span className="flex items-center gap-2">
                    <Check size={16} />
                    <span>تذكرت بعد تفكير بسيط (درجة 4)</span>
                  </span>
                  <span dir="ltr" className="text-[11px] font-tabular px-2 py-0.5 rounded-[6px] bg-[rgba(93,138,168,0.14)]">
                    +10 XP
                  </span>
                </button>

                <button
                  type="button"
                  disabled={reviewSubmitting}
                  onClick={() => handleRateReview(reviewModalTopic.id, 3)}
                  className="w-full flex items-center justify-between p-3.5 rounded-[10px] bg-[rgba(200,138,54,0.10)] hover:bg-[rgba(200,138,54,0.16)] border border-[rgba(200,138,54,0.30)] text-[#C88A36] font-semibold text-xs transition-colors min-h-[46px]"
                >
                  <span className="flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>تذكرت بصعوبة (درجة 3)</span>
                  </span>
                  <span dir="ltr" className="text-[11px] font-tabular px-2 py-0.5 rounded-[6px] bg-[rgba(200,138,54,0.14)]">
                    +5 XP
                  </span>
                </button>

                <button
                  type="button"
                  disabled={reviewSubmitting}
                  onClick={() => handleRateReview(reviewModalTopic.id, 1)}
                  className="w-full flex items-center justify-between p-3.5 rounded-[10px] bg-[rgba(201,91,102,0.10)] hover:bg-[rgba(201,91,102,0.16)] border border-[rgba(201,91,102,0.30)] text-[#E58992] font-semibold text-xs transition-colors min-h-[46px]"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle size={16} />
                    <span>نسيان تام أو خطأ (درجة 1)</span>
                  </span>
                  <span dir="ltr" className="text-[11px] font-tabular px-2 py-0.5 rounded-[6px] bg-[rgba(201,91,102,0.14)]">
                    +2 XP
                  </span>
                </button>
              </div>

              {reviewSubmitting && (
                <div
                  role="status"
                  aria-live="polite"
                  className="absolute inset-0 bg-[#0A0B0E]/85 rounded-t-[18px] sm:rounded-[16px] flex items-center justify-center gap-2 text-[#D4AF37] text-xs font-semibold"
                >
                  <Loader2 size={18} className="animate-spin" />
                  <span>جاري تحديث خوارزمية التكرار واحتساب الـ XP...</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Quick Add Item Modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[rgba(6,7,10,0.82)] backdrop-blur-md">
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="add-task-title"
              className="w-full max-w-lg bg-[#191C25] border border-[rgba(236,238,242,0.14)] rounded-t-[18px] sm:rounded-[16px] p-5 sm:p-6 shadow-[0_20px_48px_-8px_rgba(0,0,0,0.8)] relative max-h-[90vh] overflow-y-auto"
            >
              <div className="sm:hidden w-10 h-1 rounded-full bg-[rgba(236,238,242,0.18)] mx-auto mb-3" />

              <div className="flex items-center justify-between pb-4 border-b border-[rgba(236,238,242,0.08)] mb-4">
                <h3 id="add-task-title" className="font-bold text-[#ECEEF2] text-base">إضافة مهمة جديدة</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setCreateError(null)
                  }}
                  aria-label="إغلاق النموذج"
                  className="w-9 h-9 rounded-[10px] bg-[#12141C] border border-[rgba(236,238,242,0.10)] text-[#9CA3AF] hover:text-[#ECEEF2] flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateItem} className="space-y-4">
                {/* Category Type Selector */}
                <div>
                  <span className="block text-xs font-semibold text-[#9CA3AF] mb-2">نوع المهمة</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: 'assignments', label: 'واجب', Icon: CheckSquare },
                      { key: 'exams', label: 'امتحان', Icon: Target },
                      { key: 'lectures', label: 'محاضرة', Icon: BookOpen },
                      { key: 'backlog', label: 'متراكم', Icon: Clock },
                    ].map(({ key, label, Icon }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormCategory(key as any)}
                        className={`p-2.5 rounded-[10px] text-xs font-semibold transition-colors flex flex-col items-center gap-1.5 min-h-[56px] border ${
                          formCategory === key
                            ? 'bg-[rgba(212,175,55,0.12)] border-[rgba(212,175,55,0.40)] text-[#ECEEF2]'
                            : 'bg-[#07080B] border-[rgba(236,238,242,0.08)] text-[#9CA3AF] hover:text-[#ECEEF2]'
                        }`}
                      >
                        <Icon size={16} className={formCategory === key ? 'text-[#D4AF37]' : ''} />
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Selector */}
                <div>
                  <span className="block text-xs font-semibold text-[#9CA3AF] mb-2">المادة الدراسية</span>
                  <div className="grid grid-cols-2 gap-2">
                    {SUBJECTS.map((s) => {
                      const theme = getSubjectTheme(s.id)
                      const isSel = formSubjectId === s.id
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => setFormSubjectId(s.id)}
                          className={`flex items-center gap-2.5 p-2.5 rounded-[10px] text-xs font-semibold transition-colors min-h-[44px] border ${
                            isSel
                              ? `bg-[#12141C] ${theme.border} text-[#ECEEF2]`
                              : 'bg-[#07080B] border-[rgba(236,238,242,0.08)] text-[#9CA3AF] hover:text-[#ECEEF2]'
                          }`}
                        >
                          <SubjectIcon subjectId={s.id} size={15} />
                          <span>{s.name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label htmlFor="task-title-input" className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">
                    عنوان المهمة / التكليف
                  </label>
                  <input
                    id="task-title-input"
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={
                      formCategory === 'assignments'
                        ? 'مثال: حل تدريبات النحو ص 45'
                        : formCategory === 'exams'
                        ? 'مثال: امتحان شامل على الباب الثاني'
                        : formCategory === 'lectures'
                        ? 'مثال: ورشة عمل وحل تدريبات'
                        : 'مثال: مراجعة الوحدة الأولى وحل أسئلتها'
                    }
                    className="w-full bg-[#07080B] border border-[rgba(236,238,242,0.12)] rounded-[10px] px-3.5 h-11 text-sm text-[#ECEEF2] placeholder-[#6B7280] focus:border-[#D4AF37]"
                    dir="auto"
                  />
                </div>

                {/* Category-specific fields */}
                {formCategory === 'backlog' ? (
                  <div>
                    <label htmlFor="task-hours-input" className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">
                      الوقت المقدر للإنجاز (بالساعات)
                    </label>
                    <input
                      id="task-hours-input"
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={formHours}
                      onChange={(e) => setFormHours(e.target.value)}
                      className="w-full bg-[#07080B] border border-[rgba(236,238,242,0.12)] rounded-[10px] px-3.5 h-11 text-sm text-[#ECEEF2] font-tabular focus:border-[#D4AF37]"
                    />
                  </div>
                ) : (
                  <div>
                    <label htmlFor="task-date-input" className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">
                      {formCategory === 'exams' ? 'موعد الامتحان' : 'تاريخ التسليم / الموعد'}
                    </label>
                    <input
                      id="task-date-input"
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full bg-[#07080B] border border-[rgba(236,238,242,0.12)] rounded-[10px] px-3.5 h-11 text-sm text-[#ECEEF2] font-tabular focus:border-[#D4AF37]"
                    />
                  </div>
                )}

                {/* Priority Selector for Assignments */}
                {formCategory === 'assignments' && (
                  <div>
                    <span className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">الأولوية</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'high', label: 'عاجل' },
                        { key: 'medium', label: 'متوسط' },
                        { key: 'low', label: 'عادي' },
                      ].map((p) => (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => setFormPriority(p.key)}
                          className={`py-2 rounded-[10px] text-xs font-semibold transition-colors min-h-[40px] border ${
                            formPriority === p.key
                              ? 'bg-[rgba(200,138,54,0.14)] border-[rgba(200,138,54,0.40)] text-[#C88A36]'
                              : 'bg-[#07080B] border-[rgba(236,238,242,0.08)] text-[#9CA3AF]'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {createError && (
                  <div
                    role="alert"
                    className="w-full p-3 rounded-[10px] bg-[rgba(201,91,102,0.12)] border border-[rgba(201,91,102,0.32)] text-[#E58992] text-xs font-semibold text-center"
                  >
                    {createError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !formTitle.trim()}
                  className="w-full py-3 rounded-[10px] bg-[#D4AF37] hover:bg-[#E0C058] disabled:opacity-45 text-[#0A0B0E] font-semibold text-xs transition-colors flex items-center justify-center gap-2 min-h-[44px] mt-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <span>حفظ في مساحة المادة</span>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </main>
  )
}

function EmptyState({
  title,
  subtitle,
  onAdd,
}: {
  title: string
  subtitle: string
  onAdd: () => void
}) {
  return (
    <div className="aegis-panel p-8 sm:p-10 text-center">
      <div className="w-12 h-12 rounded-[12px] bg-[#191C25] border border-[rgba(236,238,242,0.10)] flex items-center justify-center mx-auto text-[#7D8594] mb-3.5">
        <CheckSquare size={22} strokeWidth={1.75} />
      </div>
      <h3 className="font-semibold text-sm text-[#ECEEF2]">{title}</h3>
      <p className="text-xs text-[#9CA3AF] mt-1.5 max-w-sm mx-auto leading-relaxed">{subtitle}</p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#191C25] hover:bg-[#202430] border border-[rgba(212,175,55,0.32)] text-[#ECEEF2] text-xs font-semibold transition-colors min-h-[40px]"
      >
        <Plus size={14} className="text-[#D4AF37]" />
        <span>إضافة الآن</span>
      </button>
    </div>
  )
}
