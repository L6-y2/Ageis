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
  Award,
  Flame,
  Layers,
  Sparkles,
} from 'lucide-react'
import { SUBJECTS, SpacedReviewTopic } from '@/lib/types'

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
  // Selected Subject: null = كل المواد, or subject ID (6, 7, 8, 9)
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

  // Fetch tasks and spaced repetition reviews
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

  // Today's date string (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], [])

  // Filter items by selected subject
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

  // Spaced Repetition Due vs All (Only count studied topics: mastery_level > 0)
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

  // Calculate task counts per subject (REALISTIC: only true pending items + true due reviews)
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

    // Reviews: only count if mastery_level > 0 AND due today or overdue
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

  // Total pending tasks across all subjects
  const totalGlobalPending = useMemo(() => {
    return Object.values(subjectTaskCounts).reduce((acc, c) => acc + c.total, 0)
  }, [subjectTaskCounts])

  // Category counts for current view
  const categoryCounts = useMemo(() => {
    const a = subjectFiltered.assignments.filter((i) => i.status !== 'done').length
    const e = subjectFiltered.exams.filter((i) => i.status !== 'done').length
    const r = dueReviews.length
    const l = subjectFiltered.lectures.filter((i) => i.status !== 'done').length
    const b = subjectFiltered.backlog.filter((i) => i.status !== 'cleared').length
    const all = a + e + r + l + b
    return { all, assignments: a, exams: e, reviews: r, lectures: l, backlog: b }
  }, [subjectFiltered, dueReviews])

  // Toggle status of regular tasks
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

    // Optimistic update
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
      fetchTasks() // revert
    }
  }

  // Rate topic in Spaced Repetition (SM-2)
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
        // Trigger celebratory confetti
        try {
          const confetti = (await import('canvas-confetti')).default
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#10b981', '#34d399', '#06b6d4', '#f59e0b'],
          })
        } catch {}

        // Optimistically update topic review date & mastery in state
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

  // Create new task/exam/backlog/lecture
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
        // Optimistic update
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
        // Background sync
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

  // Open add modal pre-filtered to a specific subject
  const openAddModalForSubject = (subjectId?: number, category?: typeof formCategory) => {
    if (subjectId) setFormSubjectId(subjectId)
    else if (selectedSubjectId) setFormSubjectId(selectedSubjectId)
    if (category) setFormCategory(category)
    setCreateError(null)
    setShowAddModal(true)
  }

  return (
    <main className="min-h-screen pb-28 pt-8 px-4 sm:px-6 max-w-5xl mx-auto" dir="rtl">
      {/* ─── Top Main Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-gradient-to-b from-cyan-400 to-indigo-500 rounded-full inline-block shadow-[0_0_12px_#06b6d4]" />
            <h1 className="text-xl sm:text-2xl font-black text-white">مهام ومناهج المواد</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            اختر المادة لتصفح تكليفاتها ومواعيد امتحاناتها ومراجعات التكرار المتباعد
          </p>
        </div>

        <button
          onClick={() => openAddModalForSubject()}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>إضافة جديد</span>
        </button>
      </div>

      {/* ─── XP Toast Celebration ──────────────────────────────────────── */}
      <AnimatePresence>
        {earnedXpToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600/20 via-teal-500/20 to-indigo-600/20 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg shadow-emerald-600/10"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-base">
                ✨
              </span>
              <div>
                <p className="text-xs font-black text-emerald-300">أحسنت! تمت مراجعة التكرار المتباعد واحتساب نقاط الخبرة</p>
                <p className="text-[11px] text-slate-300 truncate max-w-[220px] sm:max-w-md">{earnedXpToast.topic}</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow-sm">
              +{earnedXpToast.xp} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Dynamic Responsive Subject Selector Grid ───────────────────── */}
      {/* 5 Distinct Cards - 100% visible on both mobile and desktop (NO HIDDEN SCROLL!) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <BookOpen size={14} className="text-indigo-400" />
            <span>قائمة المواد الدراسية:</span>
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {selectedSubjectId ? `محددة: ${currentSubject?.name}` : 'عرض كل المواد'}
          </span>
        </div>

        {/* 5-Column Grid on desktop, 3+2 or 5 on mobile */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-2.5">
          {/* 1. ALL SUBJECTS */}
          <button
            onClick={() => setSelectedSubjectId(null)}
            className={`p-3 rounded-2xl transition-all flex flex-col items-center justify-center gap-1.5 relative border text-center ${
              selectedSubjectId === null
                ? 'bg-gradient-to-b from-indigo-600/30 to-indigo-900/40 border-indigo-500/70 shadow-lg shadow-indigo-600/20 ring-1 ring-indigo-400/40 scale-[1.02]'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-850'
            }`}
          >
            <span className="text-2xl">🌟</span>
            <span className={`text-xs font-black ${selectedSubjectId === null ? 'text-white' : 'text-slate-300'}`}>
              كل المواد
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                selectedSubjectId === null
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {totalGlobalPending} مهام
            </span>
            {selectedSubjectId === null && (
              <span className="absolute -bottom-1 w-6 h-1 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]" />
            )}
          </button>

          {/* 2..5. DYNAMIC SUBJECTS (العربية -> الإنجليزية -> التاريخ -> البرمجة) */}
          {SUBJECTS.map((s) => {
            const isSelected = selectedSubjectId === s.id
            const count = subjectTaskCounts[s.id]?.total || 0

            const colorTheme: Record<number, { bgActive: string; textActive: string; badgeActive: string; dot: string }> = {
              6: {
                bgActive: 'bg-gradient-to-b from-emerald-600/30 to-teal-900/40 border-emerald-500/70 shadow-emerald-600/20 ring-emerald-400/40',
                textActive: 'text-emerald-300',
                badgeActive: 'bg-emerald-500 text-slate-950 font-black',
                dot: 'bg-emerald-500 shadow-[0_0_8px_#10b981]',
              },
              8: {
                bgActive: 'bg-gradient-to-b from-purple-600/30 to-violet-900/40 border-purple-500/70 shadow-purple-600/20 ring-purple-400/40',
                textActive: 'text-purple-300',
                badgeActive: 'bg-purple-500 text-white',
                dot: 'bg-purple-500 shadow-[0_0_8px_#a855f7]',
              },
              9: {
                bgActive: 'bg-gradient-to-b from-amber-600/30 to-orange-900/40 border-amber-500/70 shadow-amber-600/20 ring-amber-400/40',
                textActive: 'text-amber-300',
                badgeActive: 'bg-amber-500 text-slate-950 font-black',
                dot: 'bg-amber-500 shadow-[0_0_8px_#f59e0b]',
              },
              7: {
                bgActive: 'bg-gradient-to-b from-blue-600/30 to-indigo-900/40 border-blue-500/70 shadow-blue-600/20 ring-blue-400/40',
                textActive: 'text-blue-300',
                badgeActive: 'bg-blue-500 text-white',
                dot: 'bg-blue-500 shadow-[0_0_8px_#3b82f6]',
              },
            }

            const theme = colorTheme[s.id] || {
              bgActive: 'bg-indigo-600/30 border-indigo-500',
              textActive: 'text-indigo-300',
              badgeActive: 'bg-indigo-500 text-white',
              dot: 'bg-indigo-500 shadow-[0_0_8px_#6366f1]',
            }

            return (
              <button
                key={s.id}
                onClick={() => setSelectedSubjectId(s.id)}
                className={`p-3 rounded-2xl transition-all flex flex-col items-center justify-center gap-1.5 relative border text-center ${
                  isSelected
                    ? `${theme.bgActive} shadow-lg ring-1 scale-[1.02]`
                    : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <span className="text-2xl">{s.icon}</span>
                <span className={`text-xs font-black ${isSelected ? theme.textActive : 'text-slate-300'}`}>
                  {s.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isSelected ? theme.badgeActive : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {count} معلقة
                </span>
                {isSelected && (
                  <span className={`absolute -bottom-1 w-6 h-1 rounded-full ${theme.dot}`} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Selected Subject Focus Banner ──────────────────────────────── */}
      {currentSubject && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-4 sm:p-5 rounded-3xl glass-card border border-slate-800 relative overflow-hidden"
        >
          <div
            className={`absolute -top-12 -left-12 w-44 h-44 bg-gradient-to-br ${currentSubject.color} opacity-20 rounded-full blur-2xl pointer-events-none`}
          />
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentSubject.color} flex items-center justify-center text-2xl shadow-lg ring-1 ring-white/20`}
              >
                {currentSubject.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-white">{currentSubject.name}</h2>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700/60">
                    مساحة المادة
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 flex-wrap">
                  <span className="text-emerald-300 font-semibold">{`${subjectTaskCounts[currentSubject.id]?.assignments || 0} واجبات`}</span>
                  <span>•</span>
                  <span className="text-amber-300 font-semibold">{`${subjectTaskCounts[currentSubject.id]?.exams || 0} امتحانات`}</span>
                  <span>•</span>
                  <span className="text-purple-300 font-semibold">{`${subjectTaskCounts[currentSubject.id]?.reviews || 0} مراجعات تكرار`}</span>
                  <span>•</span>
                  <span className="text-cyan-300 font-semibold">{`${subjectTaskCounts[currentSubject.id]?.lectures || 0} محاضرات`}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => openAddModalForSubject(currentSubject.id)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-white border border-slate-700 text-xs font-bold transition-all shadow-sm"
            >
              <Plus size={14} className="text-emerald-400" />
              <span>إضافة للمادة</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── Dynamic Category Filter Tabs ───────────────────────────────── */}
      <div className="grid grid-cols-6 gap-1 p-1 rounded-2xl glass-card mb-5 border-slate-800 text-center">
        {/* All */}
        <button
          onClick={() => setCategoryFilter('all')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
            categoryFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="block text-[11px] sm:text-xs">الكل</span>
          {categoryCounts.all > 0 && (
            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-950 text-indigo-200 border border-indigo-400/30 font-mono">
              {categoryCounts.all}
            </span>
          )}
        </button>

        {/* Assignments */}
        <button
          onClick={() => setCategoryFilter('assignments')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
            categoryFilter === 'assignments'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="block text-[11px] sm:text-xs">الواجبات</span>
          {categoryCounts.assignments > 0 && (
            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-950 text-emerald-200 border border-emerald-400/30 font-mono">
              {categoryCounts.assignments}
            </span>
          )}
        </button>

        {/* Exams */}
        <button
          onClick={() => setCategoryFilter('exams')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
            categoryFilter === 'exams'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="block text-[11px] sm:text-xs">الامتحانات</span>
          {categoryCounts.exams > 0 && (
            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-amber-950 text-amber-200 border border-amber-400/30 font-mono">
              {categoryCounts.exams}
            </span>
          )}
        </button>

        {/* Spaced Repetition (Reviews) */}
        <button
          onClick={() => setCategoryFilter('reviews')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
            categoryFilter === 'reviews'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="block text-[11px] sm:text-xs">التكرار</span>
          {categoryCounts.reviews > 0 && (
            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-purple-950 text-purple-200 border border-purple-400/30 font-mono">
              {categoryCounts.reviews}
            </span>
          )}
        </button>

        {/* Lectures */}
        <button
          onClick={() => setCategoryFilter('lectures')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
            categoryFilter === 'lectures'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="block text-[11px] sm:text-xs">المحاضرات</span>
          {categoryCounts.lectures > 0 && (
            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-950 text-cyan-200 border border-cyan-400/30 font-mono">
              {categoryCounts.lectures}
            </span>
          )}
        </button>

        {/* Backlog */}
        <button
          onClick={() => setCategoryFilter('backlog')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${
            categoryFilter === 'backlog'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="block text-[11px] sm:text-xs">التراكمات</span>
          {categoryCounts.backlog > 0 && (
            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-rose-950 text-rose-200 border border-rose-400/30 font-mono">
              {categoryCounts.backlog}
            </span>
          )}
        </button>
      </div>

      {/* ─── Main Content Stream ────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-white/5 border border-white/5 p-4 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-6 h-6 rounded-lg bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-white/10 rounded" />
                  <div className="h-3 w-24 bg-white/5 rounded" />
                </div>
              </div>
              <div className="h-7 w-16 rounded-xl bg-white/5 shrink-0" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SECTION 1: SPACED REPETITION (REVIEWS)                         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {(categoryFilter === 'all' || categoryFilter === 'reviews') && (
            <div className="space-y-3">
              {categoryFilter === 'all' && dueReviews.length > 0 && (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2 text-xs font-black text-purple-400">
                    <Brain size={16} />
                    <span>مراجعات التكرار المتباعد المستحقة اليوم 🔥</span>
                  </div>
                  <span className="text-[10px] text-purple-300 font-mono bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-500/30">
                    {`${dueReviews.length} دروس مستحقة`}
                  </span>
                </div>
              )}

              {categoryFilter === 'reviews' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/20 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Brain size={18} className="text-purple-400" />
                      <h3 className="font-bold text-xs text-white">نظام التكرار المتباعد الخوارزمي (SM-2)</h3>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-purple-300 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30">
                      {reviewScope === 'due' ? `${dueReviews.length} مستحق اليوم` : `${allStudiedReviews.length} درس مجدول`}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                    المراجعة في المواعيد المحددة تمنع نسيان الدروس وتثبتها في الذاكرة الدائمة بدون جهد مضاعف.
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReviewScope('due')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        reviewScope === 'due'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      🔥 المستحق الآن ({dueReviews.length})
                    </button>
                    <button
                      onClick={() => setReviewScope('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        reviewScope === 'all'
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      📅 كل الدروس المفعلة ({allStudiedReviews.length})
                    </button>
                  </div>
                </div>
              )}

              {/* Render Reviews */}
              {(() => {
                const reviewsToRender = categoryFilter === 'reviews' && reviewScope === 'all' ? allStudiedReviews : dueReviews

                if (categoryFilter === 'reviews' && reviewsToRender.length === 0) {
                  return (
                    <EmptyState
                      title={reviewScope === 'due' ? 'عاش جداً! مفيش مراجعات مستحقة اليوم 🎉' : 'لا توجد دروس قيد المراجعة'}
                      subtitle="كل دروس المنهج تم مراجعتها في مواعيدها، عُد غداً لجلسة المراجعة القادمة"
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
                      className={`glass-interactive rounded-2xl p-4 flex items-center justify-between gap-3 border transition-all ${
                        isDue
                          ? 'border-purple-500/40 bg-purple-950/20 shadow-sm shadow-purple-900/10'
                          : 'border-slate-800/80 bg-slate-900/40'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {subject && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                              {subject.icon} {subject.name}
                            </span>
                          )}
                          {topic.chapter && (
                            <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {topic.chapter}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-sm text-slate-100 truncate">{topic.topic}</h4>

                        <div className="flex items-center gap-3 mt-1.5 text-[10px]">
                          {isDue ? (
                            <span className="text-amber-400 font-bold flex items-center gap-1">
                              <Flame size={12} className="text-orange-400" />
                              <span>مستحق المراجعة الآن!</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono flex items-center gap-1">
                              <Calendar size={11} />
                              <span>{`المراجعة: ${new Date(topic.next_review_date!).toLocaleDateString('ar-EG')}`}</span>
                            </span>
                          )}

                          <span className="text-slate-400 flex items-center gap-1">
                            <Star size={11} className={topic.mastery_level > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
                            <span>{`الإتقان: ${topic.mastery_level || 0}/5`}</span>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setReviewModalTopic(topic)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all shrink-0 flex items-center gap-1"
                      >
                        <Brain size={14} />
                        <span>مراجعة</span>
                      </button>
                    </div>
                  )
                })
              })()}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SECTION 2: EXAMS                                               */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {(categoryFilter === 'all' || categoryFilter === 'exams') && (
            <div className="space-y-3">
              {categoryFilter === 'all' && subjectFiltered.exams.filter((e) => e.status !== 'done').length > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-400">
                    <Calendar size={16} />
                    <span>الامتحانات القادمة 🎯</span>
                  </div>
                </div>
              )}

              {categoryFilter === 'exams' && subjectFiltered.exams.length === 0 ? (
                <EmptyState
                  title={currentSubject ? `مفيش امتحانات مسجلة في ${currentSubject.name}` : 'مفيش امتحانات مسجلة'}
                  subtitle="سجل مواعيد الامتحانات والـ Quizzes عشان ترتب جدولك بدري"
                  onAdd={() => openAddModalForSubject(selectedSubjectId || undefined, 'exams')}
                />
              ) : (
                subjectFiltered.exams.map((item) => {
                  const subject = SUBJECTS.find((s) => s.id === item.subject_id)
                  const isDone = item.status === 'done'

                  return (
                    <div
                      key={`exam-${item.id}`}
                      className={`glass-interactive rounded-2xl p-4 flex items-center justify-between gap-3 border-slate-800/80 ${
                        isDone ? 'opacity-60 bg-slate-900/40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleStatus('exams', item.id, item.status)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : 'border-2 border-slate-600 hover:border-amber-400 text-transparent'
                          }`}
                        >
                          <CheckCircle2 size={16} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm text-slate-100 truncate ${isDone ? 'line-through' : ''}`}>
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {subject && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                                {subject.icon} {subject.name}
                              </span>
                            )}
                            {item.exam_date && (
                              <span className="text-[10px] text-amber-400 flex items-center gap-1 font-bold">
                                <Calendar size={11} />
                                <span>{new Date(item.exam_date).toLocaleDateString('ar-EG')}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        {item.exam_type || 'اختبار'}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SECTION 3: ASSIGNMENTS                                         */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {(categoryFilter === 'all' || categoryFilter === 'assignments') && (
            <div className="space-y-3">
              {categoryFilter === 'all' && subjectFiltered.assignments.filter((a) => a.status !== 'done').length > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
                    <CheckSquare size={16} />
                    <span>الواجبات والتكليفات 📝</span>
                  </div>
                </div>
              )}

              {categoryFilter === 'assignments' && subjectFiltered.assignments.length === 0 ? (
                <EmptyState
                  title={currentSubject ? `مفيش واجبات في ${currentSubject.name}` : 'مفيش واجبات مسجلة حالياً'}
                  subtitle="اضغط على زر إضافة جديد عشان تسجل واجب جديد"
                  onAdd={() => openAddModalForSubject(selectedSubjectId || undefined, 'assignments')}
                />
              ) : (
                subjectFiltered.assignments.map((item) => {
                  const subject = SUBJECTS.find((s) => s.id === item.subject_id)
                  const isDone = item.status === 'done'

                  return (
                    <div
                      key={`assign-${item.id}`}
                      className={`glass-interactive rounded-2xl p-4 flex items-center justify-between gap-3 border-slate-800/80 transition-all ${
                        isDone ? 'opacity-60 bg-slate-900/40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleStatus('assignments', item.id, item.status)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                            isDone
                              ? 'bg-emerald-500 text-white'
                              : 'border-2 border-slate-600 hover:border-emerald-400 text-transparent'
                          }`}
                        >
                          <CheckCircle2 size={16} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-bold text-sm text-slate-100 truncate ${
                              isDone ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {subject && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                                {subject.icon} {subject.name}
                              </span>
                            )}
                            {item.due_date && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                                <Clock size={11} className="text-amber-400" />
                                <span>{new Date(item.due_date).toLocaleDateString('ar-EG')}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border ${
                          item.priority === 'high'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            : item.priority === 'medium'
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {item.priority === 'high' ? 'عاجل' : item.priority === 'medium' ? 'متوسط' : 'عادي'}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SECTION 4: LECTURES                                            */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {(categoryFilter === 'all' || categoryFilter === 'lectures') && (
            <div className="space-y-3">
              {categoryFilter === 'all' && subjectFiltered.lectures.filter((l) => l.status !== 'done').length > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs font-black text-cyan-400">
                    <BookOpen size={16} />
                    <span>المحاضرات والحصص 📚</span>
                  </div>
                </div>
              )}

              {categoryFilter === 'lectures' && subjectFiltered.lectures.length === 0 ? (
                <EmptyState
                  title={currentSubject ? `مفيش محاضرات في ${currentSubject.name}` : 'مفيش محاضرات مسجلة'}
                  subtitle="سجل مواعيد حصصك والسناتر أو المنصات هنا"
                  onAdd={() => openAddModalForSubject(selectedSubjectId || undefined, 'lectures')}
                />
              ) : (
                subjectFiltered.lectures.map((item) => {
                  const subject = SUBJECTS.find((s) => s.id === item.subject_id)
                  const isAttended = item.status === 'done'

                  return (
                    <div
                      key={`lec-${item.id}`}
                      className={`glass-interactive rounded-2xl p-4 flex items-center justify-between gap-3 border-slate-800/80 ${
                        isAttended ? 'opacity-60 bg-slate-900/40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleStatus('lectures', item.id, item.status)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                            isAttended
                              ? 'bg-cyan-500 text-white'
                              : item.status === 'missed'
                              ? 'bg-rose-500/40 text-rose-300 border-2 border-rose-500'
                              : 'border-2 border-slate-600 hover:border-cyan-400 text-transparent'
                          }`}
                        >
                          <CheckCircle2 size={16} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm text-slate-100 truncate ${isAttended ? 'line-through' : ''}`}>
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {subject && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                                {subject.icon} {subject.name}
                              </span>
                            )}
                            {item.date && (
                              <span className="text-[10px] text-cyan-400 flex items-center gap-1 font-bold">
                                <Calendar size={11} />
                                <span>{new Date(item.date).toLocaleDateString('ar-EG')}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {isAttended ? 'تم الحضور ✅' : item.status === 'missed' ? 'غائب ❌' : 'قادمة 📅'}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SECTION 5: BACKLOG                                             */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {(categoryFilter === 'all' || categoryFilter === 'backlog') && (
            <div className="space-y-3">
              {categoryFilter === 'all' && subjectFiltered.backlog.filter((b) => b.status !== 'cleared').length > 0 && (
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs font-black text-rose-400">
                    <Clock size={16} />
                    <span>التراكمات الدراسية ⏳</span>
                  </div>
                </div>
              )}

              {categoryFilter === 'backlog' && subjectFiltered.backlog.length === 0 ? (
                <EmptyState
                  title="عاش! مفيش أي تراكمات مسجلة"
                  subtitle="لو فيه درس متراكم حطه هنا عشان نجدوله في جلسات المذاكرة"
                  onAdd={() => openAddModalForSubject(selectedSubjectId || undefined, 'backlog')}
                />
              ) : (
                subjectFiltered.backlog.map((item) => {
                  const subject = SUBJECTS.find((s) => s.id === item.subject_id)
                  const isCleared = item.status === 'cleared'

                  return (
                    <div
                      key={`back-${item.id}`}
                      className={`glass-interactive rounded-2xl p-4 flex items-center justify-between gap-3 border-slate-800/80 ${
                        isCleared ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleToggleStatus('backlog', item.id, item.status)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                            isCleared
                              ? 'bg-emerald-500 text-white'
                              : 'border-2 border-slate-600 hover:border-rose-400 text-transparent'
                          }`}
                        >
                          <CheckCircle2 size={16} />
                        </button>

                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm text-slate-100 truncate ${isCleared ? 'line-through' : ''}`}>
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {subject && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                                {subject.icon} {subject.name}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                              <Clock size={11} className="text-rose-400" />
                              <span>{`${item.estimated_hours || 1} ساعة تقديرية`}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border ${
                          isCleared
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {isCleared ? 'تم التصفية ✅' : 'متراكم ⚠️'}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* EMPTY OVERALL STATE                                            */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {categoryFilter === 'all' && categoryCounts.all === 0 && (
            <EmptyState
              title={currentSubject ? `لا توجد مهام أو مراجعات معلقة في ${currentSubject.name}` : 'لا توجد مهام معلقة إطلاقاً! 🎉'}
              subtitle="أنت في قمة التميز، اضغط على زر إضافة لتسجيل واجب أو محاضرة جديدة"
              onAdd={() => openAddModalForSubject(selectedSubjectId || undefined)}
            />
          )}
        </div>
      )}

      {/* ─── Spaced Repetition (SM-2) Interactive Recall Modal ─────────── */}
      <AnimatePresence>
        {reviewModalTopic && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-[#0e1424] border border-purple-500/30 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                    <Brain size={18} />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm">تقييم استرجاع المعلومة</h3>
                    <span className="text-[10px] text-purple-300 font-bold">خوارزمية SM-2 للتكرار المتباعد</span>
                  </div>
                </div>
                <button
                  onClick={() => setReviewModalTopic(null)}
                  className="p-1.5 rounded-xl glass text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Topic Card Info */}
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
                <p className="text-[10px] text-slate-400 mb-0.5">{reviewModalTopic.chapter || 'الدرس المستهدف'}</p>
                <h4 className="font-black text-sm text-white">{reviewModalTopic.topic}</h4>
              </div>

              <p className="text-xs text-slate-300 mb-3 font-medium">
                قيم مدى سهولة تذكرك للدرس لتحديد موعد التكرار المتباعد القادم:
              </p>

              {/* 4 SM-2 Recall Grade Buttons */}
              <div className="space-y-2">
                {/* Grade 5: Perfect */}
                <button
                  disabled={reviewSubmitting}
                  onClick={() => handleRateReview(reviewModalTopic.id, 5)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition-all active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>متقن وسهل جداً (درجة 5)</span>
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 px-2 py-0.5 rounded-lg text-emerald-200">
                    +15 XP • تكرار ممتد
                  </span>
                </button>

                {/* Grade 4: Good */}
                <button
                  disabled={reviewSubmitting}
                  onClick={() => handleRateReview(reviewModalTopic.id, 4)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 font-bold text-xs transition-all active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    <Check size={16} className="text-teal-400" />
                    <span>تذكرت بعد تفكير بسيط (درجة 4)</span>
                  </span>
                  <span className="text-[10px] font-mono bg-teal-500/20 px-2 py-0.5 rounded-lg text-teal-200">
                    +10 XP • مراجعة عادية
                  </span>
                </button>

                {/* Grade 3: Hard */}
                <button
                  disabled={reviewSubmitting}
                  onClick={() => handleRateReview(reviewModalTopic.id, 3)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-400" />
                    <span>تذكرت بصعوبة (درجة 3)</span>
                  </span>
                  <span className="text-[10px] font-mono bg-amber-500/20 px-2 py-0.5 rounded-lg text-amber-200">
                    +5 XP • مراجعة قريبة
                  </span>
                </button>

                {/* Grade 1: Forgotten */}
                <button
                  disabled={reviewSubmitting}
                  onClick={() => handleRateReview(reviewModalTopic.id, 1)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs transition-all active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle size={16} className="text-rose-400" />
                    <span>نسيان تام أو خطأ (درجة 1)</span>
                  </span>
                  <span className="text-[10px] font-mono bg-rose-500/20 px-2 py-0.5 rounded-lg text-rose-200">
                    +2 XP • إعادة غداً
                  </span>
                </button>
              </div>

              {reviewSubmitting && (
                <div className="absolute inset-0 bg-slate-950/85 rounded-t-3xl sm:rounded-3xl flex items-center justify-center gap-2 text-purple-400 text-xs font-bold">
                  <Loader2 size={20} className="animate-spin" />
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
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-[#0e1424] border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h3 className="font-black text-white text-base">إضافة مهمة جديدة</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setCreateError(null)
                  }}
                  className="p-1.5 rounded-xl glass text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateItem} className="space-y-4">
                {/* Category Type Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">نوع المهمة</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { key: 'assignments', label: 'واجب', icon: '📝' },
                      { key: 'exams', label: 'امتحان', icon: '🎯' },
                      { key: 'lectures', label: 'محاضرة', icon: '📚' },
                      { key: 'backlog', label: 'متراكم', icon: '⏳' },
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setFormCategory(cat.key as any)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                          formCategory === cat.key
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-900 border border-slate-800 text-slate-400'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5">المادة المخصصة</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SUBJECTS.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => setFormSubjectId(s.id)}
                        className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all ${
                          formSubjectId === s.id
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-white/30'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-750'
                        }`}
                      >
                        <span>{s.icon}</span>
                        <span>{s.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">عنوان المهمة / التكليف</label>
                  <input
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                    dir="auto"
                  />
                </div>

                {/* Category-specific fields */}
                {formCategory === 'backlog' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      الوقت المقدر للإنجاز (بالساعات)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={formHours}
                      onChange={(e) => setFormHours(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      {formCategory === 'exams' ? 'موعد الامتحان' : 'تاريخ التسليم / الموعد'}
                    </label>
                    <input
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                )}

                {/* Priority Selector for Assignments */}
                {formCategory === 'assignments' && (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">الأولوية</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'high', label: 'عاجل 🔥' },
                        { key: 'medium', label: 'متوسط ⚡' },
                        { key: 'low', label: 'عادي 📘' },
                      ].map((p) => (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => setFormPriority(p.key)}
                          className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                            formPriority === p.key
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-900 border border-slate-800 text-slate-400'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {createError && (
                  <div className="w-full p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
                    ❌ {createError}
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting || !formTitle.trim()}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <span>حفظ في مساحة المادة</span>
                  )}
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
    <div className="glass-card rounded-3xl p-8 text-center border-slate-800/80">
      <div className="w-12 h-12 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto text-slate-400 mb-3">
        <CheckSquare size={24} />
      </div>
      <h3 className="font-bold text-sm text-slate-200">{title}</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">{subtitle}</p>
      <button
        onClick={onAdd}
        className="mt-4 px-4 py-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold hover:bg-indigo-600/40 transition-colors"
      >
        إضافة الآن +
      </button>
    </div>
  )
}
