'use client'

import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import { SUBJECTS } from '@/lib/types'

type ActiveTab = 'assignments' | 'exams' | 'backlog' | 'lectures'

export default function TasksPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('assignments')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{
    assignments: any[]
    exams: any[]
    backlog: any[]
    lectures: any[]
  }>({
    assignments: [],
    exams: [],
    backlog: [],
    lectures: [],
  })

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [formSubjectId, setFormSubjectId] = useState<number>(SUBJECTS[0].id)
  const [formTitle, setFormTitle] = useState('')
  const [formDueDate, setFormDueDate] = useState('')
  const [formPriority, setFormPriority] = useState('medium')
  const [formHours, setFormHours] = useState('1')
  const [formExamType, setFormExamType] = useState('quiz')
  const [formNotes, setFormNotes] = useState('')

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/tasks?t=${Date.now()}`, { cache: 'no-store' })
      const json = await res.json()
      setData({
        assignments: json.assignments || [],
        exams: json.exams || [],
        backlog: json.backlog || [],
        lectures: json.lectures || [],
      })
    } catch (e) {
      console.error('Fetch tasks error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleToggleStatus = async (table: string, id: number, currentStatus: string) => {
    let newStatus = 'done'
    if (table === 'assignments') {
      newStatus = currentStatus === 'done' ? 'pending' : 'done'
    } else if (table === 'exams') {
      newStatus = currentStatus === 'done' ? 'upcoming' : 'done'
    } else if (table === 'backlog') {
      newStatus = currentStatus === 'cleared' ? 'pending' : 'cleared'
    } else if (table === 'lectures') {
      newStatus = currentStatus === 'done' ? 'pending' : 'done'  // القيم الصح: pending, done, missed
    }

    // Optimistic update
    setData((prev) => ({
      ...prev,
      [table]: (prev as any)[table].map((item: any) =>
        item.id === id ? { ...item, status: newStatus } : item
      ),
    }))

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

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) return
    setSubmitting(true)
    setCreateError(null)
    try {
      let payload: any = {
        table: activeTab,
        subject_id: formSubjectId,
        title: formTitle.trim(),
      }

      if (activeTab === 'assignments') {
        payload.due_date = formDueDate || null
        payload.priority = formPriority
        payload.notes = formNotes
        payload.status = 'pending'
      } else if (activeTab === 'exams') {
        payload.exam_date = formDueDate || null
        payload.exam_type = formExamType
        payload.syllabus_coverage = formNotes
        payload.status = 'upcoming'
      } else if (activeTab === 'backlog') {
        payload.estimated_hours = parseFloat(formHours) || 1
        payload.status = 'pending'
      } else if (activeTab === 'lectures') {
        payload.date = formDueDate || null
        payload.notes = formNotes
        payload.status = 'pending'  // القيم المسموح بيها: pending, missed, done
      }

      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const resData = await res.json()

      if (res.ok && resData.success) {
        // Optimistic update — add immediately to UI
        const newItem = resData.data?.[0] || { ...payload, id: Date.now(), created_at: new Date().toISOString() }
        setData((prev) => ({
          ...prev,
          [activeTab]: [newItem, ...(prev as any)[activeTab]],
        }))
        setShowAddModal(false)
        setFormTitle('')
        setFormNotes('')
        setFormDueDate('')
        // Also refetch to sync
        setTimeout(() => fetchTasks(), 500)
      } else {
        const errMsg = resData?.error || 'حدث خطأ غير متوقع'
        setCreateError(errMsg)
        console.error('Create item API error:', errMsg)
      }
    } catch (e: any) {
      console.error('Create item error:', e)
      setCreateError(e?.message || 'فشل الاتصال بالسيرفر')
    } finally {
      setSubmitting(false)
    }
  }

  const tabCounts = {
    assignments: data.assignments.filter((a) => a.status !== 'done').length,
    exams: data.exams.filter((e) => e.status !== 'done').length,
    backlog: data.backlog.filter((b) => b.status !== 'cleared').length,
    lectures: data.lectures.filter((l) => l.status !== 'done').length,
  }

  return (
    <main className="min-h-screen pb-28 pt-8 px-4 sm:px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-cyan-500 rounded-full inline-block shadow-[0_0_8px_#06b6d4]" />
            <h1 className="text-xl sm:text-2xl font-black text-white">إدارة المهام والواجبات</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">تتبع التكليفات والامتحانات والتراكمات الدراسية</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 hover:brightness-110 active:scale-95 transition-all"
        >
          <Plus size={16} />
          <span>إضافة جديد</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1.5 rounded-2xl glass-card mb-5 border-slate-800">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'assignments'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>الواجبات</span>
          {tabCounts.assignments > 0 && (
            <span className="mr-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-900/80 text-emerald-200 border border-emerald-400/30">
              {tabCounts.assignments}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('exams')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'exams'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>الامتحانات</span>
          {tabCounts.exams > 0 && (
            <span className="mr-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-900/80 text-amber-200 border border-amber-400/30">
              {tabCounts.exams}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('backlog')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'backlog'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>التراكمات</span>
          {tabCounts.backlog > 0 && (
            <span className="mr-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-900/80 text-rose-200 border border-rose-400/30">
              {tabCounts.backlog}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('lectures')}
          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'lectures'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>المحاضرات</span>
        </button>
      </div>

      {/* Tab Content List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-2">
          <Loader2 size={24} className="animate-spin text-emerald-400" />
          <span className="text-xs">جاري تحميل البيانات...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* ASSIGNMENTS TAB */}
          {activeTab === 'assignments' && (
            <>
              {data.assignments.length === 0 ? (
                <EmptyState
                  title="مفيش واجبات مسجلة حالياً"
                  subtitle="اضغط على زر إضافة جديد عشان تسجل واجب جديد"
                  onAdd={() => setShowAddModal(true)}
                />
              ) : (
                data.assignments.map((item) => {
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
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Calendar size={11} className="text-indigo-400" />
                                <span>{new Date(item.due_date).toLocaleDateString('ar-EG')}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {item.priority && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.priority === 'high'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : item.priority === 'medium'
                              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {item.priority === 'high' ? 'أولوية عالية' : item.priority === 'medium' ? 'متوسط' : 'عادي'}
                        </span>
                      )}
                    </div>
                  )
                })
              )}
            </>
          )}

          {/* EXAMS TAB */}
          {activeTab === 'exams' && (
            <>
              {data.exams.length === 0 ? (
                <EmptyState
                  title="مفيش امتحانات قادمة مسجلة"
                  subtitle="سجل كويزاتك وامتحانات الشهور عشان تراجع قبلها"
                  onAdd={() => setShowAddModal(true)}
                />
              ) : (
                data.exams.map((item) => {
                  const subject = SUBJECTS.find((s) => s.id === item.subject_id)
                  const isDone = item.status === 'done'

                  return (
                    <div
                      key={item.id}
                      className={`glass-interactive rounded-2xl p-4 flex items-center justify-between gap-3 border-slate-800/80 ${
                        isDone ? 'opacity-60' : ''
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

          {/* BACKLOG TAB */}
          {activeTab === 'backlog' && (
            <>
              {data.backlog.length === 0 ? (
                <EmptyState
                  title="عاش! مفيش أي تراكمات مسجلة"
                  subtitle="لو فيه درس متراكم حطه هنا عشان نجدوله في جلسات المذاكرة"
                  onAdd={() => setShowAddModal(true)}
                />
              ) : (
                data.backlog.map((item) => {
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

          {/* LECTURES TAB */}
          {activeTab === 'lectures' && (
            <>
              {data.lectures.length === 0 ? (
                <EmptyState
                  title="مفيش محاضرات مسجلة"
                  subtitle="سجل مواعيد حصصك والسناتر أو المنصات هنا"
                  onAdd={() => setShowAddModal(true)}
                />
              ) : (
                data.lectures.map((item) => {
                  const subject = SUBJECTS.find((s) => s.id === item.subject_id)
                  const isAttended = item.status === 'done'

                  return (
                    <div
                      key={item.id}
                      className={`glass-interactive rounded-2xl p-4 flex items-center justify-between gap-3 border-slate-800/80 ${
                        isAttended ? 'opacity-60' : ''
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
        </div>
      )}

      {/* Quick Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-[#0e1424] border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h3 className="font-black text-white text-base">
                  {activeTab === 'assignments'
                    ? 'إضافة واجب جديد'
                    : activeTab === 'exams'
                    ? 'إضافة موعد امتحان'
                    : activeTab === 'backlog'
                    ? 'تسجيل درس متراكم'
                    : 'إضافة محاضرة / حصة'}
                </h3>
                <button
                  onClick={() => { setShowAddModal(false); setCreateError(null) }}
                  className="p-1.5 rounded-xl glass text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateItem} className="space-y-3.5">
                {/* Subject Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">المادة</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SUBJECTS.map((s) => (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => setFormSubjectId(s.id)}
                        className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-bold transition-all ${
                          formSubjectId === s.id
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                            : 'bg-slate-900 border border-slate-800 text-slate-400'
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
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">العنوان</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={
                      activeTab === 'assignments'
                        ? 'مثال: حل تدريبات البلاغة ص 45'
                        : activeTab === 'exams'
                        ? 'مثال: امتحان شامل على الفصل الأول'
                        : 'مثال: مراجعة قانون أوم للدوائر المغلقة'
                    }
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
                    dir="auto"
                  />
                </div>

                {/* Date or Hours based on tab */}
                {activeTab === 'backlog' ? (
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      الوقت المقدر لإنهاء التراكم (بالساعات)
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
                      {activeTab === 'exams' ? 'موعد الامتحان' : 'تاريخ التسليم / الموعد'}
                    </label>
                    <input
                      type="date"
                      value={formDueDate}
                      onChange={(e) => setFormDueDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-indigo-500 font-mono"
                    />
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
                    <span>حفظ في قاعدة البيانات</span>
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
