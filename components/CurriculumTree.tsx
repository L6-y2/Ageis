'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  CheckCircle2,
  Circle,
  BookOpen,
  Clock,
  Search,
  Calendar,
  X,
  Sparkles,
  Check,
  AlertCircle,
  HelpCircle,
  Loader2,
  Bookmark,
  FileText,
} from 'lucide-react'
import type { RpcMasteryReport, ChapterData, TopicData } from '@/lib/types'

interface Props {
  report: RpcMasteryReport
  subjectColor: string
}

type FilterStatus = 'all' | 'mastered' | 'reviewing' | 'read' | 'not_started'

export default function CurriculumTree({ report, subjectColor }: Props) {
  const subject = report?.subjects?.[0]
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all')
  const [selectedTopic, setSelectedTopic] = useState<TopicData | null>(null)
  const [activeModalTab, setActiveModalTab] = useState<'stages' | 'sm2'>('stages')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localTopics, setLocalTopics] = useState<Record<number, Partial<TopicData>>>({})

  // Flattened topics for counters
  const allTopics = useMemo(() => {
    if (!subject?.chapters) return []
    return subject.chapters.flatMap((c) => c.topics)
  }, [subject])

  const counts = useMemo(() => {
    let mastered = 0
    let reviewing = 0
    let read = 0
    let not_started = 0
    allTopics.forEach((t) => {
      const level = localTopics[t.id]?.mastery_level ?? t.mastery_level
      if (level >= 5) mastered++
      else if (level === 4) reviewing++
      else if (level >= 1) read++
      else not_started++
    })
    return { all: allTopics.length, mastered, reviewing, read, not_started }
  }, [allTopics, localTopics])

  if (!subject?.chapters?.length) {
    return (
      <div className="panel p-12 text-center text-slate-500">
        <BookOpen size={40} className="mx-auto text-slate-600 mb-3" />
        <p className="text-sm font-bold text-slate-400">لا توجد دروس متاحة حالياً لهذه المادة</p>
      </div>
    )
  }

  // 1. Direct Stage Update
  const handleSetStage = async (topicId: number, level: number) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, masteryLevel: level }),
      })
      const data = await res.json()
      if (data.success) {
        setLocalTopics((prev) => ({
          ...prev,
          [topicId]: {
            mastery_level: level,
          },
        }))
      }
      setSelectedTopic(null)
    } catch (e) {
      console.error('Update stage error:', e)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 2. SM-2 Rating Update
  const handleRateTopic = async (topicId: number, grade: number) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, grade }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        setLocalTopics((prev) => ({
          ...prev,
          [topicId]: {
            mastery_level: grade >= 5 ? 5 : grade >= 4 ? 4 : grade >= 2 ? 2 : 1,
            next_review: data.data.next_review_date || new Date().toISOString(),
          },
        }))
      }
      setSelectedTopic(null)
    } catch (e) {
      console.error('Rate topic error:', e)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن أي درس أو مفهوم بالاسم..."
            className="w-full bg-[#111624] border border-slate-800 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500/80 transition-all"
            dir="auto"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'panel text-slate-400 hover:text-slate-200'
            }`}
          >
            {`الكل (${counts.all})`}
          </button>
          <button
            onClick={() => setActiveFilter('mastered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'mastered'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'panel text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <CheckCircle2 size={13} />
            {`متقن (${counts.mastered})`}
          </button>
          <button
            onClick={() => setActiveFilter('reviewing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'reviewing'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'panel text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <Clock size={13} />
            {`تحت المراجعة (${counts.reviewing})`}
          </button>
          <button
            onClick={() => setActiveFilter('read')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'read'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'panel text-sky-400/80 hover:text-sky-300'
            }`}
          >
            <BookOpen size={13} />
            {`تمت القراءة والتلخيص (${counts.read})`}
          </button>
          <button
            onClick={() => setActiveFilter('not_started')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
              activeFilter === 'not_started'
                ? 'bg-slate-700 text-white shadow-md shadow-slate-700/30'
                : 'panel text-slate-400 hover:text-slate-200'
            }`}
          >
            <Circle size={13} />
            {`لم يبدأ (${counts.not_started})`}
          </button>
        </div>
      </div>

      {/* Chapters Timeline List */}
      <div className="space-y-4">
        {subject.chapters.map((chapter) => {
          const filteredTopics = chapter.topics.filter((t) => {
            const level = localTopics[t.id]?.mastery_level ?? t.mastery_level
            const matchesQuery = !searchQuery || t.topic.toLowerCase().includes(searchQuery.toLowerCase())

            if (!matchesQuery) return false
            if (activeFilter === 'mastered') return level >= 5
            if (activeFilter === 'reviewing') return level === 4
            if (activeFilter === 'read') return level >= 1 && level < 4
            if (activeFilter === 'not_started') return level === 0
            return true
          })

          if (filteredTopics.length === 0 && (searchQuery || activeFilter !== 'all')) {
            return null
          }

          return (
            <ChapterBlock
              key={chapter.chapter_id}
              chapter={chapter}
              topics={filteredTopics}
              color={subjectColor}
              localTopics={localTopics}
              onSelectTopic={(t) => setSelectedTopic(t)}
            />
          )
        })}
      </div>

      {/* ─── Topic Mastery Stage & SM-2 Modal ──────────────────────────────── */}
      <AnimatePresence>
        {selectedTopic && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg bg-[#0e1424] border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold">تحديد مستوى استيعاب الدرس</span>
                    <h3 className="text-sm font-black text-white">{selectedTopic.topic}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTopic(null)}
                  className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 rounded-xl my-3">
                <button
                  onClick={() => setActiveModalTab('stages')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeModalTab === 'stages'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  المراحل الدراسية الخمسة
                </button>
                <button
                  onClick={() => setActiveModalTab('sm2')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeModalTab === 'sm2'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  تقييم التكرار الذكي (SM-2)
                </button>
              </div>

              {/* TAB 1: 5 Direct Mastery Stages */}
              {activeModalTab === 'stages' && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400 mb-2">
                    اختر مرحلة استيعابك الحالية للدرس ليتم تحديث نسب المواد فوراً:
                  </p>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleSetStage(selectedTopic.id, 5)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition-all active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>🌟 متقن تماماً (المستوى 5)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                      إتقان 100%
                    </span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleSetStage(selectedTopic.id, 4)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-2">
                      <Clock size={16} className="text-amber-400" />
                      <span>⏳ تحت المراجعة (المستوى 4)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                      جاهز للاختبار
                    </span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleSetStage(selectedTopic.id, 2)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 font-bold text-xs transition-all active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-2">
                      <FileText size={16} className="text-sky-400" />
                      <span>✍️ تم التلخيص وحل التمارين (المستوى 2)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                      تطبيق عملي
                    </span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleSetStage(selectedTopic.id, 1)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-xs transition-all active:scale-[0.98]"
                  >
                    <span className="flex items-center gap-2">
                      <BookOpen size={16} className="text-purple-400" />
                      <span>📖 تمت القراءة والفهم الأولي (المستوى 1)</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                      مقدمة
                    </span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleSetStage(selectedTopic.id, 0)}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-400 font-bold text-xs transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Circle size={15} />
                      <span>⚪ لم يبدأ بعد (المستوى 0)</span>
                    </span>
                    <span className="text-[10px]">إعادة ضبط</span>
                  </button>
                </div>
              )}

              {/* TAB 2: SM-2 Algorithm Rating */}
              {activeModalTab === 'sm2' && (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400 mb-2 leading-relaxed">
                    قيم استرجاعك للمعلومة لحساب موعد التكرار المتباعد القادم رياضياً:
                  </p>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleRateTopic(selectedTopic.id, 5)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>متقن وسهل جداً (درجة 5)</span>
                    </span>
                    <span className="text-[10px] text-emerald-300 font-mono">+XP ممتد</span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleRateTopic(selectedTopic.id, 4)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 font-bold text-xs transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Check size={16} className="text-teal-400" />
                      <span>فهم جيد مع تردد بسيط (درجة 4)</span>
                    </span>
                    <span className="text-[10px] text-teal-300 font-mono">مراجعة عادية</span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleRateTopic(selectedTopic.id, 3)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-amber-400" />
                      <span>صحيح ولكن بصعوبة (درجة 3)</span>
                    </span>
                    <span className="text-[10px] text-amber-300 font-mono">مراجعة قريبة</span>
                  </button>

                  <button
                    disabled={isSubmitting}
                    onClick={() => handleRateTopic(selectedTopic.id, 1)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <HelpCircle size={16} className="text-rose-400" />
                      <span>نسيان تام أو خطأ (درجة 1)</span>
                    </span>
                    <span className="text-[10px] text-rose-300 font-mono">إعادة غداً</span>
                  </button>
                </div>
              )}

              {isSubmitting && (
                <div className="absolute inset-0 bg-slate-950/85 rounded-3xl flex items-center justify-center gap-2 text-indigo-400 text-xs font-bold">
                  <Loader2 size={18} className="animate-spin" />
                  <span>جاري تحديث قاعدة البيانات...</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ChapterBlock({
  chapter,
  topics,
  color,
  localTopics,
  onSelectTopic,
}: {
  chapter: ChapterData
  topics: TopicData[]
  color: string
  localTopics: Record<number, Partial<TopicData>>
  onSelectTopic: (topic: TopicData) => void
}) {
  const [open, setOpen] = useState(true)

  const masteredCount = topics.filter((t) => {
    const lvl = localTopics[t.id]?.mastery_level ?? t.mastery_level
    return lvl >= 4
  }).length

  const chapterPct = topics.length ? Math.round((masteredCount / topics.length) * 100) : 0

  return (
    <div className="panel overflow-hidden border-slate-800">
      {/* Chapter Milestone Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-right transition-colors hover:bg-slate-800/30"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
            <BookOpen size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">الفصل {chapter.chapter_num}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                {`${masteredCount}/${topics.length} متقن`}
              </span>
            </div>
            <h3 className="font-bold text-slate-100 text-sm sm:text-base mt-0.5">{chapter.chapter_name}</h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-slate-300 font-mono">{`${chapterPct}%`}</span>
          <div className="w-6 h-6 rounded-full bg-slate-850 flex items-center justify-center text-slate-400">
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </button>

      {/* Topics Timeline Node View */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-4 pt-1 space-y-2">
              {topics.map((t, index) => {
                const currentLevel = localTopics[t.id]?.mastery_level ?? t.mastery_level
                const nextReview = localTopics[t.id]?.next_review ?? t.next_review

                return (
                  <TopicNode
                    key={t.id}
                    topic={t}
                    level={currentLevel}
                    nextReview={nextReview}
                    index={index + 1}
                    onOpenRate={() => onSelectTopic(t)}
                  />
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function TopicNode({
  topic,
  level,
  nextReview,
  index,
  onOpenRate,
}: {
  topic: TopicData
  level: number
  nextReview: string | null
  index: number
  onOpenRate: () => void
}) {
  const getStageConfig = (lvl: number) => {
    if (lvl >= 5) {
      return {
        label: 'متقن تماماً 🌟',
        badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        icon: CheckCircle2,
        iconColor: 'text-emerald-400',
      }
    }
    if (lvl === 4) {
      return {
        label: 'تحت المراجعة ⏳',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        icon: Clock,
        iconColor: 'text-amber-400',
      }
    }
    if (lvl === 2 || lvl === 3) {
      return {
        label: 'تم التلخيص ✍️',
        badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
        icon: FileText,
        iconColor: 'text-sky-400',
      }
    }
    if (lvl === 1) {
      return {
        label: 'تمت القراءة 📖',
        badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        icon: BookOpen,
        iconColor: 'text-purple-400',
      }
    }
    return {
      label: 'لم يبدأ بعد',
      badgeClass: 'bg-slate-800 text-slate-400 border-slate-700/60',
      icon: Circle,
      iconColor: 'text-slate-600',
    }
  }

  const currentStage = getStageConfig(level)
  const Icon = currentStage.icon

  return (
    <div
      onClick={onOpenRate}
      className="panel-interactive rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer group"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-slate-900/90 flex items-center justify-center flex-shrink-0 border border-slate-800 group-hover:border-indigo-500/30 transition-colors">
          <Icon size={16} className={currentStage.iconColor} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-200 text-xs sm:text-sm truncate group-hover:text-white transition-colors">
            {topic.topic}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-slate-500 font-mono">وزن {topic.weight || 1}</span>
            {nextReview && level > 0 && (
              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                <Calendar size={10} className="text-indigo-400" />
                <span>
                  {new Date(nextReview).toLocaleDateString('ar-EG', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-xl border ${currentStage.badgeClass} group-hover:scale-105 transition-transform`}
        >
          {currentStage.label}
        </span>
      </div>
    </div>
  )
}
