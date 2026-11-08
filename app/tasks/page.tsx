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
  Circle,
  Flag,
  FileText,
  Bookmark,
  Sparkles,
  Brain,
  LayoutGrid,
  ListFilter,
  Check,
  HelpCircle,
  Trophy,
  Star,
  Award,
  Flame,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { SUBJECTS, SpacedReviewTopic } from '@/lib/types'

type ActiveCategoryTab = 'assignments' | 'exams' | 'reviews' | 'lectures' | 'backlog'
type ViewMode = 'categories' | 'subjects'

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
  const [activeTab, setActiveTab] = useState<ActiveCategoryTab>('assignments')
  const [viewMode, setViewMode] = useState<ViewMode>('categories')
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
  const [reviewFilter, setReviewFilter] = useState<'due' | 'all'>('due')

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

  // Expanded subjects in "subjects" view mode
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<Record<number, boolean>>({
    6: true,
    7: true,
    8: true,
    9: true,
  })

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

  // Filter items by subject (if selectedSubjectId is set)
  const filteredData = useMemo(() => {
    const filterBySub = (items: any[]) =>
      selectedSubjectId ? items.filter((item) => item.subject_id === selectedSubjectId) : items

    return {
      assignments: filterBySub(data.assignments),
      exams: filterBySub(data.exams),
      backlog: filterBySub(data.backlog),
      lectures: filterBySub(data.lectures),
      reviews: filterBySub(data.reviews),
    }
  }, [data, selectedSubjectId])

  // Spaced Repetition Due vs All
  const displayedReviews = useMemo(() => {
    if (reviewFilter === 'due') {
      return filteredData.reviews.filter((r) => {
        if (!r.next_review_date) return true
        const reviewDate = r.next_review_date.split('T')[0]
        return reviewDate <= todayStr
      })
    }
    return filteredData.reviews
  }, [filteredData.reviews, reviewFilter, todayStr])

  // Calculate task counts per subject
  const subjectTaskCounts = useMemo(() => {
    const counts: Record<number, { assignments: number; exams: number; backlog: number; lectures: number; reviews: number; total: number }> = {}

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
      const isDue = !r.next_review_date || r.next_review_date.split('T')[0] <= todayStr
      if (isDue && counts[r.subject_id]) {
        counts[r.subject_id].reviews++
        counts[r.subject_id].total++
      }
    })

    return counts
  }, [data, todayStr])

  // Tab counts for current subject filter
  const currentTabCounts = useMemo(() => {
    const dueReviewsCount = filteredData.reviews.filter((r) => {
      if (!r.next_review_date) return true
      return r.next_review_date.split('T')[0] <= todayStr
    }).length

    return {
      assignments: filteredData.assignments.filter((a) => a.status !== 'done').length,
      exams: filteredData.exams.filter((e) => e.status !== 'done').length,
      reviews: dueReviewsCount,
      lectures: filteredData.lectures.filter((l) => l.status !== 'done').length,
      backlog: filteredData.backlog.filter((b) => b.status !== 'cleared').length,
    }
  }, [filteredData, todayStr])

  // Total active tasks across all subjects
  const totalActiveTasks = useMemo(() => {
    return (
      data.assignments.filter((a) => a.status !== 'done').length +
      data.exams.filter((e) => e.status !== 'done').length +
      data.lectures.filter((l) => l.status !== 'done').length +
      data.backlog.filter((b) => b.status !== 'cleared').length +
      data.reviews.filter((r) => !r.next_review_date || r.next_review_date.split('T')[0] <= todayStr).length
    )
  }, [data, todayStr])

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
    else if (activeTab !== 'reviews') setFormCategory(activeTab)
    setCreateError(null)
    setShowAddModal(true)
  }

  const selectedSubjectObj = SUBJECTS.find((s) => s.id === selectedSubjectId)

  return (
    <main className="min-h-screen pb-28 pt-8 px-4 sm:px-6" dir="rtl">
      {/* ─── Top Main Header ────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-5 bg-gradient-to-b from-cyan-400 to-indigo-500 rounded-full inline-block shadow-[0_0_10px_#06b6d4]" />
            <h1 className="text-xl sm:text-2xl font-black text-white">مهام ومناهج المواد</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            مساحة مخصصة لكل مادة: واجبات، امتحانات، ومراجعات تكرار متباعد ذكية
          </p>
        </div>

        <button
          onClick={() => openAddModalForSubject()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 hover:brightness-110 active:scale-95 transition-all"
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
            className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-600/20 via-teal-500/20 to-indigo-600/20 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg shadow-emerald-600/10"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-base">
                ✨
              </span>
              <div>
                <p className="text-xs font-black text-emerald-300">أحسنت! تمت مراجعة التكرار المتباعد بنجاح</p>
                <p className="text-[11px] text-slate-300 truncate max-w-[220px] sm:max-w-xs">{earnedXpToast.topic}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow-sm">
              +{earnedXpToast.xp} XP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Primary Subject Filter Bar (شريط المواد الذكي) ─────────────── */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
            <BookOpen size={13} className="text-indigo-400" />
            <span>اختر المادة لتصفح مهامها:</span>
          </span>

          {/* View Mode Toggle Button */}
          <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setViewMode('categories')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                viewMode === 'categories'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="عرض حسب التصنيف"
            >
              <ListFilter size={12} />
              <span>حسب النوع</span>
            </button>
            <button
              onClick={() => {
                setViewMode('subjects')
                setSelectedSubjectId(null)
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                viewMode === 'subjects'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="عرض مجمّع لكل مادة"
            >
              <LayoutGrid size={12} />
              <span>مساحات المواد</span>
            </button>
          </div>
        </div>

        {/* Scrollable Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
          {/* ALL SUBJECTS PILL */}
          <button
            onClick={() => setSelectedSubjectId(null)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
              selectedSubjectId === null
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-400/50 shadow-md shadow-indigo-600/25 scale-[1.02]'
                : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
            }`}
          >
            <span>🌟</span>
            <span>كل المواد</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                selectedSubjectId === null ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {totalActiveTasks}
            </span>
          </button>

          {/* INDIVIDUAL SUBJECT PILLS */}
          {SUBJECTS.map((s) => {
            const isSelected = selectedSubjectId === s.id
            const count = subjectTaskCounts[s.id]?.total || 0

            return (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedSubjectId(s.id)
                  setViewMode('categories')
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border ${
                  isSelected
                    ? `bg-gradient-to-r ${s.color} text-white border-white/30 shadow-lg scale-[1.02]`
                    : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.name}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-black/30 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Selected Subject Focus Banner (When a single subject is picked) ─ */}
      {selectedSubjectObj && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-4 rounded-3xl glass-card border border-slate-800 relative overflow-hidden"
        >
          <div
            className={`absolute -top-12 -left-12 w-36 h-36 bg-gradient-to-br ${selectedSubjectObj.color} opacity-20 rounded-full blur-2xl pointer-events-none`}
          />
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${selectedSubjectObj.color} flex items-center justify-center text-2xl shadow-lg ring-1 ring-white/20`}
              >
                {selectedSubjectObj.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black text-white">{selectedSubjectObj.name}</h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                    مساحة المادة
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                  <span>{`${subjectTaskCounts[selectedSubjectObj.id]?.assignments || 0} واجب`}</span>
                  <span>•</span>
                  <span>{`${subjectTaskCounts[selectedSubjectObj.id]?.exams || 0} امتحان`}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">{`${subjectTaskCounts[selectedSubjectObj.id]?.reviews || 0} مراجعة تكرار`}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => openAddModalForSubject(selectedSubjectObj.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all shadow-sm"
            >
              <Plus size={14} />
              <span>إضافة للمادة</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODE 1: CATEGORY TABS VIEW (الواجبات، الامتحانات، التكرار المتباعد...) */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {viewMode === 'categories' && (
        <>
          {/* Category Tabs Switcher (5 Tabs) */}
          <div className="grid grid-cols-5 gap-1 p-1 rounded-2xl glass-card mb-5 border-slate-800 text-center">
            {/* 1. Assignments */}
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === 'assignments'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="block text-[11px] sm:text-xs">الواجبات</span>
              {currentTabCounts.assignments > 0 && (
                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-emerald-950 text-emerald-200 border border-emerald-400/30 font-mono">
                  {currentTabCounts.assignments}
                </span>
              )}
            </button>

            {/* 2. Exams */}
            <button
              onClick={() => setActiveTab('exams')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === 'exams'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="block text-[11px] sm:text-xs">الامتحانات</span>
              {currentTabCounts.exams > 0 && (
                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-amber-950 text-amber-200 border border-amber-400/30 font-mono">
                  {currentTabCounts.exams}
                </span>
              )}
            </button>

            {/* 3. Spaced Repetition (SM-2) */}
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === 'reviews'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="block text-[11px] sm:text-xs">التكرار</span>
              {currentTabCounts.reviews > 0 && (
                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-purple-950 text-purple-200 border border-purple-400/30 font-mono">
                  {currentTabCounts.reviews}
                </span>
              )}
            </button>

            {/* 4. Lectures */}
            <button
              onClick={() => setActiveTab('lectures')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === 'lectures'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="block text-[11px] sm:text-xs">المحاضرات</span>
              {currentTabCounts.lectures > 0 && (
                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-cyan-950 text-cyan-200 border border-cyan-400/30 font-mono">
                  {currentTabCounts.lectures}
                </span>
              )}
            </button>

            {/* 5. Backlog */}
            <button
              onClick={() => setActiveTab('backlog')}
              className={`py-2 px-1 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === 'backlog'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="block text-[11px] sm:text-xs">التراكمات</span>
              {currentTabCounts.backlog > 0 && (
                <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] bg-rose-950 text-rose-200 border border-rose-400/30 font-mono">
                  {currentTabCounts.backlog}
                </span>
              )}
            </button>
          </div>

          {/* Loading Skeleton */}
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
            <div className="space-y-3">
              {/* ────────────────── 1. ASSIGNMENTS TAB ────────────────── */}
              {activeTab === 'assignments' && (
                <>
                  {filteredData.assignments.length === 0 ? (
                    <EmptyState
                      title={selectedSubjectObj ? `مفيش واجبات في ${selectedSubjectObj.name}` : 'مفيش واجبات مسجلة حالياً'}
                      subtitle="اضغط على زر إضافة جديد عشان تسجل واجب جديد"
                      onAdd={() => openAddModalForSubject(selectedSubjectId || undefined, 'assignments')}
                    />
                  ) : (
                    filteredData.assignments.map((item) => {
                      const subject = SUBJECTS.find((s) => s.id === item.subject_id)
                      const isDone = item.status === 'done'

                      return (
                        <div
                          key={item.id}
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
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
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
                </>
              )}

              {/* ────────────────── 2. EXAMS TAB ──────────────────────── */}
              {activeTab === 'exams' && (
                <>
                  {filteredData.exams.length === 0 ? (
                    <EmptyState
                      title={selectedSubjectObj ? `مفيش امتحانات في ${selectedSubjectObj.name}` : 'مفيش امتحانات مسجلة'}
                      subtitle="سجل مواعيد الامتحانات والـ Quizzes عشان ترتب جدولك بدري"
                      onAdd={() => openAddModalForSubject(selectedSubjectId || undefined, 'exams')}
                    />
                  ) : (
                    filteredData.exams.map((item) => {
                      const subject = SUBJECTS.find((s) => s.id === item.subject_id)
                      const isDone = item.status === 'done'

                      return (
                        <div
                          key={item.id}
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

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                            {item.exam_type || 'اختبار'}
                          </span>
                        </div>
                      )
                    })
                  )}
                </>
              )}

              {/* ────────────────── 3. SPACED REPETITION TAB (التكرار المتباعد) ─── */}
              {activeTab === 'reviews' && (
                <>
                  {/* Spaced Repetition Intro & Subfilter */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/20 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Brain size={18} className="text-purple-400" />
                        <h3 className="font-bold text-xs text-white">نظام التكرار المتباعد الخوارزمي (SM-2)</h3>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-purple-300 px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30">
                        {`${displayedReviews.length} درس`}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                      تكرار الدروس على فترات متباعدة يرسخ المعلومات في الذاكرة طويلة المدى ويمنع النسيان.
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setReviewFilter('due')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          reviewFilter === 'due'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        🔥 المستحق الآن ({currentTabCounts.reviews})
                      </button>
                      <button
                        onClick={() => setReviewFilter('all')}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                          reviewFilter === 'all'
                            ? 'bg-purple-600 text-white shadow-sm'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        📅 كل الدروس المجدولة ({filteredData.reviews.length})
                      </button>
                    </div>
                  </div>

                  {displayedReviews.length === 0 ? (
                    <div className="glass-card rounded-3xl p-8 text-center border-slate-800/80">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto text-purple-300 mb-3 border border-purple-500/30">
                        <CheckCircle2 size={24} />
                      </div>
                      <h3 className="font-bold text-sm text-slate-200">
                        {reviewFilter === 'due' ? 'ممتاز! مفيش مراجعات مستحقة الآن' : 'لا توجد دروس مسجلة'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                        كل المراجعات في موعدها المضبوط، عُد لاحقاً لمتابعة جدول التكرار المتباعد
                      </p>
                    </div>
                  ) : (
                    displayedReviews.map((topic) => {
                      const subject = SUBJECTS.find((s) => s.id === topic.subject_id)
                      const isDue = !topic.next_review_date || topic.next_review_date.split('T')[0] <= todayStr

                      return (
                        <div
                          key={topic.id}
                          className={`glass-interactive rounded-2xl p-4 flex items-center justify-between gap-3 border transition-all ${
                            isDue
                              ? 'border-purple-500/40 bg-purple-950/15 shadow-sm shadow-purple-900/10'
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
                              {/* Due Date Indicator */}
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

                              {/* Mastery Stars */}
                              <span className="text-slate-400 flex items-center gap-1">
                                <Star size={11} className={topic.mastery_level > 0 ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
                                <span>{`المستوى: ${topic.mastery_level || 0}/5`}</span>
                              </span>
                            </div>
                          </div>

                          {/* Rate Recall Button */}
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
                  )}
                </>
              )}

              {/* ────────────────── 4. LECTURES TAB ───────────────────── */}
              {activeTab === 'lectures' && (
                <>
                  {filteredData.lectures.length === 0 ? (
                    <EmptyState
                      title={selectedSubjectObj ? `مفيش محاضرات في ${selectedSubjectObj.name}` : 'مفيش محاضرات مسجلة'}
                      subtitle="سجل مواعيد حصصك والسناتر أو المنصات هنا"
                      onAdd={() => openAddModalForSubject(selectedSubjectId || undefined, 'lectures')}
                    />
                  ) : (
                    filteredData.lectures.map((item) => {
                      const subject = SUBJECTS.find((s) => s.id === item.subject_id)
                      const isAttended = item.status === 'done'

                      return (
                        <div
                          key={item.id}
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

                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                            {isAttended ? 'تم الحضور ✅' : item.status === 'missed' ? 'غائب ❌' : 'قادمة 📅'}
                          </span>
                        </div>
                      )
                    })
                  )}
                </>
              )}

              {/* ────────────────── 5. BACKLOG TAB ────────────────────── */}
              {activeTab === 'backlog' && (
                <>
                  {filteredData.backlog.length === 0 ? (
                    <EmptyState
                      title="عاش! مفيش أي تراكمات مسجلة"
                      subtitle="لو فيه درس متراكم حطه هنا عشان نجدوله في جلسات المذاكرة"
                      onAdd={() => openAddModalForSubject(selectedSubjectId || undefined, 'backlog')}
                    />
                  ) : (
                    filteredData.backlog.map((item) => {
                      const subject = SUBJECTS.find((s) => s.id === item.subject_id)
                      const isCleared = item.status === 'cleared'

                      return (
                        <div
                          key={item.id}
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
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MODE 2: SUBJECT WORKSPACES MATRIX (مساحات مخصصة لكل مادة بمهامها)   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {viewMode === 'subjects' && (
        <div className="space-y-5">
          {SUBJECTS.map((s) => {
            const isExpanded = expandedSubjectIds[s.id] ?? true
            const subAssignments = data.assignments.filter((a) => a.subject_id === s.id && a.status !== 'done')
            const subExams = data.exams.filter((e) => e.subject_id === s.id && e.status !== 'done')
            const subLectures = data.lectures.filter((l) => l.subject_id === s.id && l.status !== 'done')
            const subBacklog = data.backlog.filter((b) => b.subject_id === s.id && b.status !== 'cleared')
            const subReviews = data.reviews.filter((r) => r.subject_id === s.id && (!r.next_review_date || r.next_review_date.split('T')[0] <= todayStr))
            const totalPending = subAssignments.length + subExams.length + subLectures.length + subBacklog.length + subReviews.length

            return (
              <div
                key={s.id}
                className="glass-card rounded-3xl border border-slate-800/90 overflow-hidden shadow-xl"
              >
                {/* Subject Header Banner */}
                <div className={`p-4 bg-gradient-to-r ${s.color} bg-opacity-20 flex items-center justify-between`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-black/30 backdrop-blur flex items-center justify-center text-xl shadow-inner">
                      {s.icon}
                    </div>
                    <div>
                      <h3 className="font-black text-white text-base">{s.name}</h3>
                      <p className="text-[11px] text-white/80 font-medium">
                        {totalPending === 0 ? 'لا توجد مهام معلقة' : `${totalPending} مهام ومراجعات متبقية`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openAddModalForSubject(s.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Plus size={13} />
                      <span>إضافة</span>
                    </button>
                    <button
                      onClick={() =>
                        setExpandedSubjectIds((prev) => ({ ...prev, [s.id]: !prev[s.id] }))
                      }
                      className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Subject Content */}
                {isExpanded && (
                  <div className="p-4 space-y-4">
                    {/* Category Summary Badges */}
                    <div className="grid grid-cols-4 gap-1.5 text-center">
                      <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="block text-xs font-bold text-emerald-400 font-mono">{subAssignments.length}</span>
                        <span className="text-[9px] text-slate-400">واجبات</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="block text-xs font-bold text-amber-400 font-mono">{subExams.length}</span>
                        <span className="text-[9px] text-slate-400">امتحانات</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="block text-xs font-bold text-purple-400 font-mono">{subReviews.length}</span>
                        <span className="text-[9px] text-slate-400">تكرار</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="block text-xs font-bold text-cyan-400 font-mono">{subLectures.length}</span>
                        <span className="text-[9px] text-slate-400">محاضرات</span>
                      </div>
                    </div>

                    {/* Due Spaced Repetitions for this subject */}
                    {subReviews.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                          <Brain size={14} />
                          <span>مراجعات التكرار المتباعد المستحقة:</span>
                        </div>
                        {subReviews.map((r) => (
                          <div
                            key={r.id}
                            className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between gap-2"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-white truncate">{r.topic}</p>
                              <span className="text-[10px] text-amber-400 font-bold">مستحق المراجعة الآن 🔥</span>
                            </div>
                            <button
                              onClick={() => setReviewModalTopic(r)}
                              className="px-2.5 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] transition-colors"
                            >
                              مراجعة
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pending Assignments for this subject */}
                    {subAssignments.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                          <CheckSquare size={14} />
                          <span>الواجبات والتكليفات:</span>
                        </div>
                        {subAssignments.map((a) => (
                          <div
                            key={a.id}
                            className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <button
                                onClick={() => handleToggleStatus('assignments', a.id, a.status)}
                                className="w-5 h-5 rounded-md border-2 border-slate-600 hover:border-emerald-400 flex items-center justify-center text-transparent"
                              >
                                <Check size={12} />
                              </button>
                              <p className="font-bold text-xs text-slate-200 truncate">{a.title}</p>
                            </div>
                            {a.due_date && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(a.due_date).toLocaleDateString('ar-EG')}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pending Exams */}
                    {subExams.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                          <Calendar size={14} />
                          <span>الامتحانات القادمة:</span>
                        </div>
                        {subExams.map((e) => (
                          <div
                            key={e.id}
                            className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between gap-2"
                          >
                            <p className="font-bold text-xs text-slate-200 truncate">{e.title}</p>
                            <span className="text-[10px] text-amber-400 font-bold">
                              {new Date(e.exam_date).toLocaleDateString('ar-EG')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Pending Lectures */}
                    {subLectures.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                          <BookOpen size={14} />
                          <span>المحاضرات والحصص:</span>
                        </div>
                        {subLectures.map((l) => (
                          <div
                            key={l.id}
                            className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                              <button
                                onClick={() => handleToggleStatus('lectures', l.id, l.status)}
                                className="w-5 h-5 rounded-md border-2 border-slate-600 hover:border-cyan-400 flex items-center justify-center text-transparent"
                              >
                                <Check size={12} />
                              </button>
                              <p className="font-bold text-xs text-slate-200 truncate">{l.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* If no items at all for this subject */}
                    {totalPending === 0 && (
                      <p className="text-center text-xs text-slate-500 py-3">
                        كل شيء منجز في هذه المادة! 🎉 اضغط &quot;إضافة&quot; لتسجيل تكليف جديد.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
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
